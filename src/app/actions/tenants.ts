'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

export async function getTenants() {
  await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  return prisma.tenantProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, fullName: true, email: true, phone: true } },
      unit: { include: { building: { select: { name: true } } } },
    },
  });
}

export async function getTenant(id: string) {
  await requireRole([...ADMIN_ROLES, 'ACCOUNTANT']);
  return prisma.tenantProfile.findUniqueOrThrow({
    where: { id },
    include: {
      user: true,
      unit: { include: { building: true } },
    },
  });
}

/** Users who don't have a tenant profile yet (for "Add tenant" dropdown). */
export async function getUsersWithoutTenant() {
  await requireRole([...ADMIN_ROLES]);
  const withProfile = await prisma.tenantProfile.findMany({ select: { userId: true } });
  const ids = withProfile.map((p) => p.userId);
  return prisma.user.findMany({
    where: { id: { notIn: ids } },
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  });
}

export async function createTenant(formData: FormData) {
  await requireRole([...ADMIN_ROLES]);
  const userId = formData.get('userId') as string;
  const unitId = formData.get('unitId') as string;
  const businessType = (formData.get('businessType') as string) || undefined;
  const emergencyContact = (formData.get('emergencyContact') as string) || undefined;
  const emergencyPhone = (formData.get('emergencyPhone') as string) || undefined;
  const moveInDate = formData.get('moveInDate') ? new Date(formData.get('moveInDate') as string) : undefined;
  const moveOutDate = formData.get('moveOutDate') ? new Date(formData.get('moveOutDate') as string) : undefined;
  const idDocumentUrl = (formData.get('idDocumentUrl') as string) || undefined;
  const leaseAgreementUrl = (formData.get('leaseAgreementUrl') as string) || undefined;

  await prisma.$transaction([
    prisma.tenantProfile.create({
      data: {
        userId,
        unitId,
        businessType,
        emergencyContact,
        emergencyPhone,
        moveInDate,
        moveOutDate,
        idDocumentUrl,
        leaseAgreementUrl,
      },
    }),
    prisma.unit.update({ where: { id: unitId }, data: { status: 'OCCUPIED' } }),
  ]);
  revalidatePath('/dashboard/tenants');
  revalidatePath('/dashboard/units');
  revalidatePath('/dashboard');
}

export async function updateTenant(id: string, formData: FormData) {
  await requireRole([...ADMIN_ROLES]);
  const businessType = (formData.get('businessType') as string) || undefined;
  const emergencyContact = (formData.get('emergencyContact') as string) || undefined;
  const emergencyPhone = (formData.get('emergencyPhone') as string) || undefined;
  const moveInDate = formData.get('moveInDate') ? new Date(formData.get('moveInDate') as string) : undefined;
  const moveOutDate = formData.get('moveOutDate') ? new Date(formData.get('moveOutDate') as string) : undefined;
  const idDocumentUrl = (formData.get('idDocumentUrl') as string) || undefined;
  const leaseAgreementUrl = (formData.get('leaseAgreementUrl') as string) || undefined;

  await prisma.tenantProfile.update({
    where: { id },
    data: {
      businessType,
      emergencyContact,
      emergencyPhone,
      moveInDate,
      moveOutDate,
      idDocumentUrl: idDocumentUrl || undefined,
      leaseAgreementUrl: leaseAgreementUrl || undefined,
    },
  });
  revalidatePath('/dashboard/tenants');
  revalidatePath(`/dashboard/tenants/${id}`);
}
