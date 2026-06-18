'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { buildingWhereForUser } from '@/lib/building-scope';
import { revalidatePath } from 'next/cache';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

function parseBuildingFormData(formData: FormData) {
  const hasSecurityRoom = formData.get('hasSecurityRoom') === 'true';
  const areaRaw = formData.get('areaHectares') as string;
  const roomsRaw = formData.get('numberOfRooms') as string;
  const yearRaw = formData.get('yearBuilt') as string;
  const photoUrl = (formData.get('photoUrl') as string)?.trim() || undefined;

  return {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    state: (formData.get('state') as string) || undefined,
    zipCode: (formData.get('zipCode') as string) || undefined,
    country: (formData.get('country') as string) || 'Ethiopia',
    numberOfFloors: parseInt(formData.get('numberOfFloors') as string, 10) || 1,
    numberOfRooms: roomsRaw ? parseInt(roomsRaw, 10) : undefined,
    parkingSpaces: parseInt(formData.get('parkingSpaces') as string, 10) || 0,
    areaHectares: areaRaw ? parseFloat(areaRaw) : undefined,
    hasSecurityRoom,
    yearBuilt: yearRaw ? parseInt(yearRaw, 10) : undefined,
    photoUrl,
    utilitiesInfo: (formData.get('utilitiesInfo') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
  };
}

export async function getBuildings() {
  const user = await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  const scope = buildingWhereForUser(user);
  return prisma.building.findMany({
    where: scope,
    orderBy: { name: 'asc' },
    include: {
      owner: { select: { id: true, fullName: true, email: true } },
      _count: { select: { units: true } },
    },
  });
}

export async function getBuilding(id: string) {
  const user = await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  const scope = buildingWhereForUser(user);
  return prisma.building.findFirstOrThrow({
    where: { id, ...scope },
    include: {
      owner: true,
      manager: true,
      units: {
        orderBy: [{ floorNumber: 'asc' }, { unitNumber: 'asc' }],
        include: { tenant: { include: { user: { select: { fullName: true } } } } },
      },
    },
  });
}

export async function getBuildingFloorSummary(buildingId: string) {
  const user = await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  const scope = buildingWhereForUser(user);
  const building = await prisma.building.findFirstOrThrow({
    where: { id: buildingId, ...scope },
    select: { numberOfFloors: true },
  });

  const units = await prisma.unit.findMany({
    where: { buildingId },
    select: { floorNumber: true, status: true },
  });

  const floors: Record<number, { total: number; occupied: number; vacant: number; reserved: number; maintenance: number }> = {};
  for (let f = 0; f < building.numberOfFloors; f++) {
    floors[f] = { total: 0, occupied: 0, vacant: 0, reserved: 0, maintenance: 0 };
  }
  for (const u of units) {
    const fl = floors[u.floorNumber] ?? { total: 0, occupied: 0, vacant: 0, reserved: 0, maintenance: 0 };
    fl.total++;
    if (u.status === 'OCCUPIED') fl.occupied++;
    else if (u.status === 'AVAILABLE') fl.vacant++;
    else if (u.status === 'RESERVED') fl.reserved++;
    else if (u.status === 'MAINTENANCE') fl.maintenance++;
    floors[u.floorNumber] = fl;
  }
  return floors;
}

export async function createBuilding(formData: FormData) {
  const user = await requireRole([...ADMIN_ROLES]);
  const data = parseBuildingFormData(formData);

  await prisma.building.create({
    data: {
      ...data,
      ownerId: user.role === 'BUILDING_OWNER' ? user.id : undefined,
    },
  });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/buildings');
}

export async function updateBuilding(id: string, formData: FormData) {
  await requireRole([...ADMIN_ROLES]);
  const data = parseBuildingFormData(formData);

  await prisma.building.update({
    where: { id },
    data,
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
  revalidatePath('/dashboard/units');
}
