'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { unitWhereForUser } from '@/lib/building-scope';
import { logActivity } from '@/lib/activity-log';
import { revalidatePath } from 'next/cache';
import type { UnitStatus } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;

export async function getTenants() {
  const user = await requireRole([...ADMIN_ROLES]);
  const unitScope = unitWhereForUser(user);
  return prisma.tenantProfile.findMany({
    where: unitScope ? { unit: unitScope } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, fullName: true, email: true, phone: true } },
      unit: { include: { building: { select: { name: true } } } },
      _count: { select: { documents: true } },
    },
  });
}

export async function getTenant(id: string) {
  await requireRole([...ADMIN_ROLES]);
  return prisma.tenantProfile.findUniqueOrThrow({
    where: { id },
    include: {
      user: true,
      unit: { include: { building: true } },
      documents: {
        orderBy: [{ type: 'asc' }, { version: 'desc' }],
        include: { uploadedBy: { select: { fullName: true } } },
      },
      unitHistory: {
        orderBy: { assignedAt: 'desc' },
        include: { unit: { select: { unitNumber: true, building: { select: { name: true } } } } },
      },
    },
  });
}

export async function getUsersWithoutTenant() {
  await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER']);
  const withProfile = await prisma.tenantProfile.findMany({ select: { userId: true } });
  const ids = withProfile.map((p) => p.userId);
  return prisma.user.findMany({
    where: { id: { notIn: ids } },
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  });
}

export async function createTenant(formData: FormData) {
  const user = await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER']);
  const userId = formData.get('userId') as string;
  const unitId = formData.get('unitId') as string;
  const address = (formData.get('address') as string) || undefined;
  const nationalId = (formData.get('nationalId') as string) || undefined;
  const occupation = (formData.get('occupation') as string) || undefined;
  const businessType = (formData.get('businessType') as string) || undefined;
  const tenantStatus = (formData.get('tenantStatus') as 'ACTIVE' | 'PENDING') || 'ACTIVE';
  const emergencyContact = (formData.get('emergencyContact') as string) || undefined;
  const emergencyPhone = (formData.get('emergencyPhone') as string) || undefined;
  const moveInDate = formData.get('moveInDate') ? new Date(formData.get('moveInDate') as string) : undefined;
  const moveOutDate = formData.get('moveOutDate') ? new Date(formData.get('moveOutDate') as string) : undefined;
  const idDocumentUrl = (formData.get('idDocumentUrl') as string) || undefined;
  const leaseAgreementUrl = (formData.get('leaseAgreementUrl') as string) || undefined;

  const profile = await prisma.$transaction(async (tx) => {
    const created = await tx.tenantProfile.create({
      data: {
        userId,
        unitId,
        address,
        nationalId,
        occupation,
        businessType,
        tenantStatus,
        emergencyContact,
        emergencyPhone,
        moveInDate,
        moveOutDate,
        idDocumentUrl,
        leaseAgreementUrl,
      },
    });
    await tx.unit.update({ where: { id: unitId }, data: { status: 'OCCUPIED' } });
    await tx.tenantUnitHistory.create({
      data: {
        tenantId: created.id,
        unitId,
        assignedAt: moveInDate ?? new Date(),
      },
    });
    return created;
  });

  await logActivity({
    userId: user.id,
    action: 'CREATE',
    entityType: 'TenantProfile',
    entityId: profile.id,
    description: `Registered tenant and assigned to unit`,
  });

  revalidatePath('/dashboard/tenants');
  revalidatePath('/dashboard/units');
  revalidatePath('/dashboard');
}

export async function updateTenant(id: string, formData: FormData) {
  const user = await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER']);
  const fullName = (formData.get('fullName') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || undefined;
  const address = (formData.get('address') as string) || undefined;
  const nationalId = (formData.get('nationalId') as string) || undefined;
  const occupation = (formData.get('occupation') as string) || undefined;
  const businessType = (formData.get('businessType') as string) || undefined;
  const tenantStatus = formData.get('tenantStatus') as 'ACTIVE' | 'PENDING' | 'VACATED' | 'SUSPENDED';
  const emergencyContact = (formData.get('emergencyContact') as string) || undefined;
  const emergencyPhone = (formData.get('emergencyPhone') as string) || undefined;
  const moveInDate = formData.get('moveInDate') ? new Date(formData.get('moveInDate') as string) : undefined;
  const moveOutDate = formData.get('moveOutDate') ? new Date(formData.get('moveOutDate') as string) : undefined;
  const idDocumentUrl = (formData.get('idDocumentUrl') as string) || undefined;
  const leaseAgreementUrl = (formData.get('leaseAgreementUrl') as string) || undefined;

  const existing = await prisma.tenantProfile.findUniqueOrThrow({ where: { id } });

  if (fullName) {
    await prisma.user.update({
      where: { id: existing.userId },
      data: { fullName, phone },
    });
  }

  await prisma.tenantProfile.update({
    where: { id },
    data: {
      address,
      nationalId,
      occupation,
      businessType,
      tenantStatus,
      emergencyContact,
      emergencyPhone,
      moveInDate,
      moveOutDate,
      idDocumentUrl: idDocumentUrl || undefined,
      leaseAgreementUrl: leaseAgreementUrl || undefined,
    },
  });

  if (tenantStatus === 'VACATED' && existing.unitId) {
    await prisma.$transaction([
      prisma.unit.update({ where: { id: existing.unitId }, data: { status: 'AVAILABLE' } }),
      prisma.tenantUnitHistory.updateMany({
        where: { tenantId: id, unitId: existing.unitId, vacatedAt: null },
        data: { vacatedAt: moveOutDate ?? new Date() },
      }),
      prisma.tenantProfile.update({ where: { id }, data: { unitId: null } }),
    ]);
  }

  await logActivity({
    userId: user.id,
    action: 'UPDATE',
    entityType: 'TenantProfile',
    entityId: id,
    description: `Updated tenant profile`,
  });

  revalidatePath('/dashboard/tenants');
  revalidatePath(`/dashboard/tenants/${id}`);
}

export async function uploadTenantDocument(formData: FormData) {
  const user = await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER']);
  const tenantId = formData.get('tenantId') as string;
  const type = formData.get('type') as 'NATIONAL_ID_FRONT' | 'NATIONAL_ID_BACK' | 'LEASE_AGREEMENT' | 'RENTAL_AGREEMENT' | 'OTHER';
  const fileName = formData.get('fileName') as string;
  const fileUrl = formData.get('fileUrl') as string;
  const mimeType = (formData.get('mimeType') as string) || undefined;

  const latest = await prisma.tenantDocument.findFirst({
    where: { tenantId, type },
    orderBy: { version: 'desc' },
  });
  const version = (latest?.version ?? 0) + 1;

  const doc = await prisma.tenantDocument.create({
    data: { tenantId, type, fileName, fileUrl, mimeType, version, uploadedById: user.id },
  });

  await logActivity({
    userId: user.id,
    action: 'UPLOAD',
    entityType: 'TenantDocument',
    entityId: doc.id,
    description: `Uploaded ${type} v${version}`,
  });

  revalidatePath(`/dashboard/tenants/${tenantId}`);
  return doc;
}

export async function getTenantDocuments(tenantId: string) {
  const authUser = await requireAuth();
  const isAdmin = ADMIN_ROLES.includes(authUser.role as (typeof ADMIN_ROLES)[number]);
  if (!isAdmin && authUser.tenantProfileId !== tenantId) throw new Error('Not authorized');

  return prisma.tenantDocument.findMany({
    where: { tenantId },
    orderBy: [{ type: 'asc' }, { version: 'desc' }],
    include: { uploadedBy: { select: { fullName: true } } },
  });
}
