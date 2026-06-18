'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { incomeWhereForUser } from '@/lib/building-scope';
import { logActivity } from '@/lib/activity-log';
import { revalidatePath } from 'next/cache';
import type { IncomeType } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;

export async function getIncomes(filters?: { buildingId?: string; type?: string }) {
  const user = await requireRole(ADMIN_ROLES);
  const scope = incomeWhereForUser(user);
  return prisma.income.findMany({
    where: {
      ...(scope ? scope : {}),
      ...(filters?.buildingId && { buildingId: filters.buildingId }),
      ...(filters?.type && { type: filters.type as IncomeType }),
    },
    orderBy: { incomeDate: 'desc' },
    include: {
      building: { select: { name: true } },
      tenant: { include: { user: { select: { fullName: true } } } },
      recordedBy: { select: { fullName: true } },
    },
  });
}

export async function createIncome(formData: FormData) {
  const user = await requireRole(ADMIN_ROLES);
  const buildingId = formData.get('buildingId') as string;
  const tenantId = (formData.get('tenantId') as string) || undefined;
  const type = formData.get('type') as IncomeType;
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const description = (formData.get('description') as string) || undefined;
  const incomeDate = new Date(formData.get('incomeDate') as string);

  const income = await prisma.income.create({
    data: { buildingId, tenantId, type, amount, description, incomeDate, recordedById: user.id },
  });

  await logActivity({
    userId: user.id,
    action: 'CREATE',
    entityType: 'Income',
    entityId: income.id,
    description: `Recorded ${type} income`,
  });

  revalidatePath('/dashboard/income');
  revalidatePath('/dashboard/reports');
  revalidatePath('/dashboard');
}

export async function deleteIncome(id: string) {
  await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER']);
  await prisma.income.delete({ where: { id } });
  revalidatePath('/dashboard/income');
  revalidatePath('/dashboard/reports');
}
