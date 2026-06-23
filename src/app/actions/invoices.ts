'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { invoiceWhereForUser } from '@/lib/building-scope';
import { tenantInvoiceWhere, tenantCanAccessInvoice } from '@/lib/tenant-invoice-scope';
import { getQuarterDates, quarterlyRentAmount, quarterlyDueDateFromAnchor } from '@/lib/billing-utils';
import { logActivity } from '@/lib/activity-log';
import { revalidatePath } from 'next/cache';
import type { BillingPeriod, InvoiceCategory } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;

export async function getInvoices(filters?: {
  buildingId?: string;
  unitId?: string;
  status?: string;
  category?: InvoiceCategory | InvoiceCategory[];
}) {
  const user = await requireAuth();
  const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);
  const scope = isAdmin ? invoiceWhereForUser(user) : undefined;

  const categoryWhere = filters?.category
    ? Array.isArray(filters.category)
      ? { in: filters.category }
      : filters.category
    : undefined;

  if (isAdmin) {
    return prisma.invoice.findMany({
      where: {
        ...(scope ? { AND: [scope] } : {}),
        ...(filters?.buildingId && { unit: { buildingId: filters.buildingId } }),
        ...(filters?.unitId && { unitId: filters.unitId }),
        ...(filters?.status && { status: filters.status as 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED' }),
        ...(categoryWhere ? { category: categoryWhere } : {}),
      },
      orderBy: [{ year: 'desc' }, { quarter: 'desc' }, { month: 'desc' }],
      include: {
        unit: { include: { building: { select: { name: true } }, tenant: { select: { id: true } } } },
        payments: true,
        paymentProofs: { select: { id: true, status: true, fileUrl: true, fileName: true } },
      },
    });
  }

  if (user.tenantProfileId) {
    return prisma.invoice.findMany({
      where: tenantInvoiceWhere(user, {
        status: filters?.status,
        category: filters?.category,
      }),
      orderBy: [{ year: 'desc' }, { quarter: 'desc' }, { month: 'desc' }],
      include: {
        unit: { include: { building: { select: { name: true } }, tenant: { select: { id: true } } } },
        payments: true,
        paymentProofs: { select: { id: true, status: true, fileUrl: true, fileName: true } },
      },
    });
  }

  return [];
}

export async function getInvoice(id: string) {
  const user = await requireAuth();
  const inv = await prisma.invoice.findUniqueOrThrow({
    where: { id },
    include: {
      unit: { include: { building: true, tenant: { include: { user: true } } } },
      payments: { include: { recordedBy: { select: { fullName: true } } } },
      paymentProofs: {
        orderBy: { createdAt: 'desc' },
        include: { submittedBy: { select: { fullName: true } } },
      },
    },
  });
  const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);
  if (!isAdmin && !tenantCanAccessInvoice(user, inv)) {
    throw new Error('Not authorized');
  }
  return inv;
}

export async function createInvoice(formData: FormData) {
  const user = await requireRole(ADMIN_ROLES);
  const unitId = formData.get('unitId') as string;
  const category = ((formData.get('category') as InvoiceCategory) || 'RENT');
  const periodType = (formData.get('periodType') as BillingPeriod) || (category === 'RENT' ? 'QUARTERLY' : 'MONTHLY');
  const year = parseInt(formData.get('year') as string, 10);
  const quarter = formData.get('quarter') ? parseInt(formData.get('quarter') as string, 10) : undefined;
  const month = formData.get('month') ? parseInt(formData.get('month') as string, 10) : undefined;
  const dueDate = new Date(formData.get('dueDate') as string);
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const notes = (formData.get('notes') as string) || undefined;

  const unit = await prisma.unit.findUniqueOrThrow({ where: { id: unitId }, include: { tenant: true } });
  const tenantId = unit.tenant?.id ?? undefined;

  let periodStart: Date | undefined;
  let periodEnd: Date | undefined;
  if (periodType === 'QUARTERLY' && quarter) {
    const dates = getQuarterDates(year, quarter);
    periodStart = dates.start;
    periodEnd = dates.end;
  } else if (month) {
    periodStart = new Date(year, month - 1, 1);
    periodEnd = new Date(year, month, 0);
  }

  const invoice = await prisma.invoice.create({
    data: {
      unitId,
      tenantId,
      category,
      periodType,
      month: month ?? null,
      year,
      quarter: quarter ?? null,
      periodStart,
      periodEnd,
      dueDate,
      amount,
      status: 'DRAFT',
      notes,
    },
  });

  await logActivity({
    userId: user.id,
    action: 'CREATE',
    entityType: 'Invoice',
    entityId: invoice.id,
    description: `Created ${category.toLowerCase()} invoice for unit ${unit.unitNumber}`,
  });

  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard/utility-bills');
  revalidatePath('/dashboard');
}

export async function generateMonthlyInvoices(month: number, year: number) {
  const user = await requireRole(ADMIN_ROLES);
  const dueDate = new Date(year, month - 1, 5);
  const units = await prisma.unit.findMany({
    where: { status: 'OCCUPIED' },
    include: { tenant: true },
  });
  const existing = await prisma.invoice.findMany({
    where: { month, year, periodType: 'MONTHLY', category: 'RENT' },
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
        periodType: 'MONTHLY',
        month,
        year,
        periodStart: new Date(year, month - 1, 1),
        periodEnd: new Date(year, month, 0),
        dueDate,
        amount: unit.rentAmount,
        status: 'DRAFT',
        category: 'RENT',
      },
    });
    created++;
  }

  await logActivity({
    userId: user.id,
    action: 'GENERATE',
    entityType: 'Invoice',
    description: `Generated ${created} monthly invoices for ${month}/${year}`,
  });

  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard');
  return { created };
}

/** Generate quarterly invoices for all occupied units. Amount = monthly rent × 3. */
export async function generateQuarterlyInvoices(quarter: number, year: number) {
  const user = await requireRole(ADMIN_ROLES);
  const { start, end, dueDate } = getQuarterDates(year, quarter);
  const units = await prisma.unit.findMany({
    where: { status: 'OCCUPIED' },
    include: { tenant: true },
  });
  const existing = await prisma.invoice.findMany({
    where: { quarter, year, periodType: 'QUARTERLY', category: 'RENT' },
    select: { unitId: true },
  });
  const existingUnitIds = new Set(existing.map((e) => e.unitId));
  let created = 0;
  for (const unit of units) {
    if (existingUnitIds.has(unit.id)) continue;
    const unitDueDate = unit.quarterlyRentDueDate
      ? quarterlyDueDateFromAnchor(new Date(unit.quarterlyRentDueDate), year, quarter)
      : dueDate;
    await prisma.invoice.create({
      data: {
        unitId: unit.id,
        tenantId: unit.tenant?.id ?? undefined,
        periodType: 'QUARTERLY',
        quarter,
        year,
        periodStart: start,
        periodEnd: end,
        dueDate: unitDueDate,
        amount: quarterlyRentAmount(Number(unit.rentAmount)),
        status: 'DRAFT',
        category: 'RENT',
      },
    });
    created++;
  }

  await logActivity({
    userId: user.id,
    action: 'GENERATE',
    entityType: 'Invoice',
    description: `Generated ${created} quarterly invoices for Q${quarter} ${year}`,
  });

  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard');
  return { created };
}

export async function markInvoiceSent(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.invoice.update({ where: { id }, data: { status: 'SENT' } });
  revalidatePath('/dashboard/invoices');
  revalidatePath(`/dashboard/invoices/${id}`);
}

export async function syncOverdueInvoices() {
  await requireRole(ADMIN_ROLES);
  const now = new Date();
  const result = await prisma.invoice.updateMany({
    where: {
      dueDate: { lt: now },
      status: { in: ['SENT', 'PARTIAL', 'DRAFT'] },
    },
    data: { status: 'OVERDUE' },
  });
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard');
  return { updated: result.count };
}
