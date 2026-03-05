'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { MaintenanceStatus, UrgencyLevel } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

export async function getMaintenanceRequests(filters?: { status?: MaintenanceStatus }) {
  const user = await requireAuth();
  const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);

  if (isAdmin) {
    return prisma.maintenanceRequest.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        unit: { include: { building: { select: { name: true } } } },
        requestedBy: { select: { fullName: true, email: true } },
        assignedTo: { select: { fullName: true } },
      },
    });
  }

  return prisma.maintenanceRequest.findMany({
    where: { requestedById: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      unit: { include: { building: { select: { name: true } } } },
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
  revalidatePath('/dashboard/maintenance');
  revalidatePath('/dashboard');
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
}
