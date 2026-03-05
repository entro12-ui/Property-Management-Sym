'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;

export async function getInvoices(filters?: { buildingId?: string; unitId?: string; status?: string }) {
  const user = await requireAuth();
  const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);

  if (isAdmin) {
    return prisma.invoice.findMany({
      where: {
        ...(filters?.buildingId && { unit: { buildingId: filters.buildingId } }),
        ...(filters?.unitId && { unitId: filters.unitId }),
        ...(filters?.status && { status: filters.status as 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED' }),
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        unit: { include: { building: { select: { name: true } } } },
      },
    });
  }

  if (user.tenantProfileId) {
    return prisma.invoice.findMany({
      where: { tenantId: user.tenantProfileId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: { unit: { include: { building: { select: { name: true } } } } },
    });
  }

  return [];
}

export async function getInvoice(id: string) {
  const user = await requireAuth();
  const inv = await prisma.invoice.findUniqueOrThrow({
    where: { id },
    include: {
      unit: { include: { building: true } },
      payments: { include: { recordedBy: { select: { fullName: true } } } },
    },
  });
  const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);
  if (!isAdmin && inv.tenantId !== user.tenantProfileId) {
    throw new Error('Not authorized');
  }
  return inv;
}

export async function createInvoice(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const unitId = formData.get('unitId') as string;
  const month = parseInt(formData.get('month') as string, 10);
  const year = parseInt(formData.get('year') as string, 10);
  const dueDate = new Date(formData.get('dueDate') as string);
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const notes = (formData.get('notes') as string) || undefined;

  const unit = await prisma.unit.findUniqueOrThrow({ where: { id: unitId }, include: { tenant: true } });
  const tenantId = unit.tenant?.id ?? undefined;

  await prisma.invoice.create({
    data: {
      unitId,
      tenantId,
      month,
      year,
      dueDate,
      amount,
      status: 'DRAFT',
      notes,
    },
  });
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard');
}

/** Generate draft invoices for all occupied units (or all units) for a given month/year. Skips units that already have an invoice. */
export async function generateMonthlyInvoices(month: number, year: number) {
  await requireRole(ADMIN_ROLES);
  const dueDate = new Date(year, month - 1, 5);
  const units = await prisma.unit.findMany({
    where: { status: 'OCCUPIED' },
    include: { tenant: true },
  });
  const existing = await prisma.invoice.findMany({
    where: { month, year },
    select: { unitId: true },
  });
  const existingUnitIds = new Set(existing.map((e) => e.unitId));
  let created = 0;
  for (const unit of units) {
    if (existingUnitIds.has(unit.id)) continue;
    await prisma.invoice.create({
      data: {
        unitId: unit.id,
        tenantId: unit.tenant?.id ?? undefined,
        month,
        year,
        dueDate,
        amount: unit.rentAmount,
        status: 'DRAFT',
      },
    });
    created++;
  }
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard');
  return { created };
}
