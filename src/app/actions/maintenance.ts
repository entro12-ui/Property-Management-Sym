'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { unitWhereForUser } from '@/lib/building-scope';
import { logActivity } from '@/lib/activity-log';
import { revalidatePath } from 'next/cache';
import type { MaintenanceStatus, UrgencyLevel } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

export async function getMaintenanceRequests(filters?: { status?: MaintenanceStatus }) {
  const user = await requireAuth();
  const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);
  const unitScope = unitWhereForUser(user);

  if (isAdmin) {
    return prisma.maintenanceRequest.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(unitScope ? { unit: unitScope } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        unit: { select: { unitNumber: true, building: { select: { name: true } } } },
        requestedBy: { select: { fullName: true, email: true } },
        assignedTo: { select: { fullName: true } },
      },
    });
  }

  return prisma.maintenanceRequest.findMany({
    where: { requestedById: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      unit: { select: { unitNumber: true, building: { select: { name: true } } } },
      assignedTo: { select: { fullName: true } },
    },
  });
}

export async function getMaintenanceRequest(id: string) {
  const user = await requireAuth();
  const req = await prisma.maintenanceRequest.findUniqueOrThrow({
    where: { id },
    include: {
      unit: { include: { building: true } },
      requestedBy: { select: { fullName: true, email: true } },
      assignedTo: { select: { fullName: true, email: true } },
    },
  });
  const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);
  if (!isAdmin && req.requestedById !== user.id) throw new Error('Not authorized');
  return req;
}

export async function createMaintenanceRequest(formData: FormData) {
  const user = await requireAuth();
  const unitId = formData.get('unitId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const urgency = (formData.get('urgency') as UrgencyLevel) || 'MEDIUM';

  const tenant = await prisma.tenantProfile.findFirst({ where: { userId: user.id }, select: { id: true, unitId: true } });
  const effectiveUnitId = tenant?.unitId ?? unitId;
  if (!effectiveUnitId) throw new Error('Unit required');

  await prisma.maintenanceRequest.create({
    data: {
      unitId: effectiveUnitId,
      requestedById: user.id,
      title,
      description,
      urgency,
    },
  });

  await logActivity({
    userId: user.id,
    action: 'CREATE',
    entityType: 'MaintenanceRequest',
    description: `Maintenance request submitted: ${title}`,
  });

  revalidatePath('/dashboard/maintenance');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/approvals');
  revalidatePath('/dashboard/alerts');
}

export async function updateMaintenanceStatus(id: string, formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const status = formData.get('status') as MaintenanceStatus;
  const assignedToId = (formData.get('assignedToId') as string) || undefined;
  const cost = formData.get('cost') ? parseFloat(formData.get('cost') as string) : undefined;
  const completedAt = status === 'COMPLETED' ? new Date() : undefined;

  await prisma.maintenanceRequest.update({
    where: { id },
    data: {
      status,
      assignedToId: assignedToId || undefined,
      cost,
      completedAt,
    },
  });
  revalidatePath('/dashboard/maintenance');
  revalidatePath(`/dashboard/maintenance/${id}`);
  revalidatePath('/dashboard/approvals');
  revalidatePath('/dashboard/alerts');
}

export async function reviewMaintenanceRequest(id: string, decision: 'ACCEPT' | 'REJECT') {
  const user = await requireRole(ADMIN_ROLES);

  const req = await prisma.maintenanceRequest.findUniqueOrThrow({
    where: { id },
    select: { status: true, title: true },
  });

  if (req.status !== 'PENDING') {
    throw new Error('This request has already been reviewed.');
  }

  const status: MaintenanceStatus = decision === 'ACCEPT' ? 'IN_PROGRESS' : 'CANCELLED';

  await prisma.maintenanceRequest.update({
    where: { id },
    data: {
      status,
      completedAt: decision === 'REJECT' ? new Date() : undefined,
    },
  });

  await logActivity({
    userId: user.id,
    action: 'UPDATE',
    entityType: 'MaintenanceRequest',
    entityId: id,
    description: `Maintenance request ${decision === 'ACCEPT' ? 'accepted' : 'rejected'}: ${req.title}`,
  });

  revalidatePath('/dashboard/maintenance');
  revalidatePath(`/dashboard/maintenance/${id}`);
  revalidatePath('/dashboard/approvals');
  revalidatePath('/dashboard/alerts');
}
