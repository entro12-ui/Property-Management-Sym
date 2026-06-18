'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { UnitType, UnitStatus } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

function parseUnitFormData(formData: FormData) {
  return {
    unitNumber: formData.get('unitNumber') as string,
    floorNumber: parseInt(formData.get('floorNumber') as string, 10) || 0,
    unitType: (formData.get('unitType') as UnitType) || 'ROOM',
    sizeSqm: parseFloat(formData.get('sizeSqm') as string) || 0,
    rentAmount: parseFloat(formData.get('rentAmount') as string) || 0,
    quarterlyRentDueDate: formData.get('quarterlyRentDueDate')
      ? new Date(formData.get('quarterlyRentDueDate') as string)
      : null,
    leaseStart: formData.get('leaseStart') ? new Date(formData.get('leaseStart') as string) : null,
    leaseEnd: formData.get('leaseEnd') ? new Date(formData.get('leaseEnd') as string) : null,
    status: (formData.get('status') as UnitStatus) || 'AVAILABLE',
    notes: (formData.get('notes') as string) || undefined,
  };
}

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
  const data = parseUnitFormData(formData);

  await prisma.unit.create({
    data: {
      buildingId,
      ...data,
    },
  });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/units');
  revalidatePath(`/dashboard/buildings/${buildingId}`);
}

export async function updateUnit(id: string, formData: FormData) {
  await requireRole([...ADMIN_ROLES]);
  const data = parseUnitFormData(formData);

  const u = await prisma.unit.update({
    where: { id },
    data,
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
