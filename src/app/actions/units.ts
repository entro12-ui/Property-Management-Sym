'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { UnitType, UnitStatus } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

export async function getUnits(buildingId?: string) {
  await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  return prisma.unit.findMany({
    where: buildingId ? { buildingId } : undefined,
    orderBy: [{ building: { name: 'asc' } }, { floorNumber: 'asc' }, { unitNumber: 'asc' }],
    include: {
      building: { select: { id: true, name: true } },
      tenant: { include: { user: { select: { fullName: true, email: true } } } },
    },
  });
}

export async function getUnit(id: string) {
  await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  return prisma.unit.findUniqueOrThrow({
    where: { id },
    include: {
      building: true,
      tenant: { include: { user: true } },
      invoices: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 10 },
    },
  });
}

export async function createUnit(formData: FormData) {
  await requireRole([...ADMIN_ROLES]);
  const buildingId = formData.get('buildingId') as string;
  const unitNumber = formData.get('unitNumber') as string;
  const floorNumber = parseInt(formData.get('floorNumber') as string, 10) || 0;
  const unitType = (formData.get('unitType') as UnitType) || 'APARTMENT';
  const sizeSqm = parseFloat(formData.get('sizeSqm') as string) || 0;
  const rentAmount = parseFloat(formData.get('rentAmount') as string) || 0;
  const leaseStart = formData.get('leaseStart') ? new Date(formData.get('leaseStart') as string) : null;
  const leaseEnd = formData.get('leaseEnd') ? new Date(formData.get('leaseEnd') as string) : null;
  const status = (formData.get('status') as UnitStatus) || 'AVAILABLE';
  const notes = (formData.get('notes') as string) || undefined;

  await prisma.unit.create({
    data: {
      buildingId,
      unitNumber,
      floorNumber,
      unitType,
      sizeSqm,
      rentAmount,
      leaseStart,
      leaseEnd,
      status,
      notes,
    },
  });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/units');
  revalidatePath(`/dashboard/buildings/${buildingId}`);
}

export async function updateUnit(id: string, formData: FormData) {
  await requireRole([...ADMIN_ROLES]);
  const unitNumber = formData.get('unitNumber') as string;
  const floorNumber = parseInt(formData.get('floorNumber') as string, 10) || 0;
  const unitType = (formData.get('unitType') as UnitType) || 'APARTMENT';
  const sizeSqm = parseFloat(formData.get('sizeSqm') as string) || 0;
  const rentAmount = parseFloat(formData.get('rentAmount') as string) || 0;
  const leaseStart = formData.get('leaseStart') ? new Date(formData.get('leaseStart') as string) : null;
  const leaseEnd = formData.get('leaseEnd') ? new Date(formData.get('leaseEnd') as string) : null;
  const status = (formData.get('status') as UnitStatus) || 'AVAILABLE';
  const notes = (formData.get('notes') as string) || undefined;

  const u = await prisma.unit.update({
    where: { id },
    data: {
      unitNumber,
      floorNumber,
      unitType,
      sizeSqm,
      rentAmount,
      leaseStart,
      leaseEnd,
      status,
      notes,
    },
  });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/units');
  revalidatePath(`/dashboard/buildings/${u.buildingId}`);
}

export async function deleteUnit(id: string) {
  await requireRole([...ADMIN_ROLES]);
  const u = await prisma.unit.findUniqueOrThrow({ where: { id }, select: { buildingId: true } });
  await prisma.unit.delete({ where: { id } });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/units');
  revalidatePath(`/dashboard/buildings/${u.buildingId}`);
}
