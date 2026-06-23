'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { unitWhereForUser } from '@/lib/building-scope';
import { logActivity } from '@/lib/activity-log';
import { isValidLeaveDate, LEAVE_NOTICE_MONTHS } from '@/lib/leave-utils';
import type { LeaveRequestStatus } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

export type LeaveRequestSubmitResult =
  | { success: true }
  | { success: false; error: string };

async function requireTenantWithUnit() {
  const user = await requireAuth();
  if (user.role !== 'TENANT' || !user.tenantProfileId || !user.unitId) {
    redirect('/dashboard');
  }
  return { user, tenantProfileId: user.tenantProfileId, unitId: user.unitId };
}

export async function getMyLeaveRequests() {
  const { tenantProfileId } = await requireTenantWithUnit();

  return prisma.leaveRequest.findMany({
    where: { tenantId: tenantProfileId },
    orderBy: { createdAt: 'desc' },
    include: {
      unit: { select: { unitNumber: true, building: { select: { name: true } } } },
      reviewedBy: { select: { fullName: true } },
    },
  });
}

export async function submitLeaveRequest(formData: FormData): Promise<LeaveRequestSubmitResult> {
  const { user, tenantProfileId, unitId } = await requireTenantWithUnit();

  const requestedMoveOutDate = new Date(formData.get('requestedMoveOutDate') as string);
  const reason = (formData.get('reason') as string)?.trim() || undefined;

  if (Number.isNaN(requestedMoveOutDate.getTime())) {
    return { success: false, error: 'Please select a valid move-out date.' };
  }

  if (!isValidLeaveDate(requestedMoveOutDate)) {
    return {
      success: false,
      error: `Move-out must be at least ${LEAVE_NOTICE_MONTHS} months from today.`,
    };
  }

  const pending = await prisma.leaveRequest.findFirst({
    where: { tenantId: tenantProfileId, status: 'PENDING' },
  });
  if (pending) {
    return { success: false, error: 'You already have a pending leave request.' };
  }

  await prisma.leaveRequest.create({
    data: {
      tenantId: tenantProfileId,
      unitId,
      requestedMoveOutDate,
      reason,
    },
  });

  await logActivity({
    userId: user.id,
    action: 'CREATE',
    entityType: 'LeaveRequest',
    description: `Tenant submitted leave request for ${requestedMoveOutDate.toLocaleDateString()}`,
  });

  revalidatePath('/dashboard/leave-request');
  revalidatePath('/dashboard/alerts');
  revalidatePath('/dashboard/approvals');
  return { success: true };
}

export async function cancelMyLeaveRequest(id: string): Promise<LeaveRequestSubmitResult> {
  const { tenantProfileId } = await requireTenantWithUnit();

  const req = await prisma.leaveRequest.findFirst({
    where: { id, tenantId: tenantProfileId, status: 'PENDING' },
  });
  if (!req) {
    return { success: false, error: 'Leave request not found or cannot be cancelled.' };
  }

  await prisma.leaveRequest.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  revalidatePath('/dashboard/leave-request');
  return { success: true };
}

export async function getLeaveRequests(status?: LeaveRequestStatus) {
  await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  const user = await requireAuth();
  const unitScope = unitWhereForUser(user);

  return prisma.leaveRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(unitScope ? { unit: unitScope } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
      unit: { select: { unitNumber: true, building: { select: { name: true } } } },
      reviewedBy: { select: { fullName: true } },
    },
  });
}

export async function reviewLeaveRequest(
  id: string,
  formData: FormData
): Promise<LeaveRequestSubmitResult> {
  const user = await requireRole(ADMIN_ROLES);
  const status = formData.get('status') as LeaveRequestStatus;
  const adminNotes = (formData.get('adminNotes') as string)?.trim() || undefined;

  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return { success: false, error: 'Invalid review status.' };
  }

  const req = await prisma.leaveRequest.findUniqueOrThrow({
    where: { id },
    include: { tenant: true },
  });

  if (req.status !== 'PENDING') {
    return { success: false, error: 'This request has already been reviewed.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.leaveRequest.update({
      where: { id },
      data: {
        status,
        adminNotes,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });

    if (status === 'APPROVED') {
      await tx.tenantProfile.update({
        where: { id: req.tenantId },
        data: { moveOutDate: req.requestedMoveOutDate },
      });
    }
  });

  await logActivity({
    userId: user.id,
    action: 'UPDATE',
    entityType: 'LeaveRequest',
    entityId: id,
    description: `Leave request ${status.toLowerCase()}`,
  });

  revalidatePath('/dashboard/leave-requests');
  revalidatePath('/dashboard/tenants');
  revalidatePath('/dashboard/leave-request');
  revalidatePath('/dashboard/approvals');
  revalidatePath('/dashboard/alerts');
  return { success: true };
}

/** Form action wrapper — returns void for use in client component forms. */
export async function submitLeaveReview(id: string, formData: FormData): Promise<void> {
  await reviewLeaveRequest(id, formData);
}
