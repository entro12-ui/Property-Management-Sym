'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

export async function getBuildings() {
  await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  return prisma.building.findMany({
    orderBy: { name: 'asc' },
    include: {
      owner: { select: { id: true, fullName: true, email: true } },
      _count: { select: { units: true } },
    },
  });
}

export async function getBuilding(id: string) {
  await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  return prisma.building.findUniqueOrThrow({
    where: { id },
    include: {
      owner: true,
      manager: true,
      units: true,
    },
  });
}

export async function createBuilding(formData: FormData) {
  await requireRole([...ADMIN_ROLES]);
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const state = (formData.get('state') as string) || undefined;
  const zipCode = (formData.get('zipCode') as string) || undefined;
  const numberOfFloors = parseInt(formData.get('numberOfFloors') as string, 10) || 1;
  const parkingSpaces = parseInt(formData.get('parkingSpaces') as string, 10) || 0;
  const utilitiesInfo = (formData.get('utilitiesInfo') as string) || undefined;
  const notes = (formData.get('notes') as string) || undefined;

  await prisma.building.create({
    data: {
      name,
      address,
      city,
      state,
      zipCode,
      numberOfFloors,
      parkingSpaces,
      utilitiesInfo,
      notes,
    },
  });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/buildings');
}

export async function updateBuilding(id: string, formData: FormData) {
  await requireRole([...ADMIN_ROLES]);
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const state = (formData.get('state') as string) || undefined;
  const zipCode = (formData.get('zipCode') as string) || undefined;
  const numberOfFloors = parseInt(formData.get('numberOfFloors') as string, 10) || 1;
  const parkingSpaces = parseInt(formData.get('parkingSpaces') as string, 10) || 0;
  const utilitiesInfo = (formData.get('utilitiesInfo') as string) || undefined;
  const notes = (formData.get('notes') as string) || undefined;

  await prisma.building.update({
    where: { id },
    data: {
      name,
      address,
      city,
      state,
      zipCode,
      numberOfFloors,
      parkingSpaces,
      utilitiesInfo,
      notes,
    },
  });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/buildings');
  revalidatePath(`/dashboard/buildings/${id}`);
}

export async function deleteBuilding(id: string) {
  await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER']);
  await prisma.building.delete({ where: { id } });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/buildings');
}
