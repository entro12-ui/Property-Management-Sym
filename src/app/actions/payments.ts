'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { PaymentMethod } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;

export async function getPayments(filters?: { invoiceId?: string }) {
  await requireRole(ADMIN_ROLES);
  return prisma.payment.findMany({
    where: filters?.invoiceId ? { invoiceId: filters.invoiceId } : undefined,
    orderBy: { paidAt: 'desc' },
    include: {
      invoice: { include: { unit: { include: { building: { select: { name: true } } } } } },
      recordedBy: { select: { fullName: true } },
    },
  });
}

export async function recordPayment(formData: FormData) {
  const user = await requireRole(ADMIN_ROLES);
  const invoiceId = formData.get('invoiceId') as string;
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const method = (formData.get('method') as PaymentMethod) || 'CASH';
  const receiptUrl = (formData.get('receiptUrl') as string) || undefined;
  const reference = (formData.get('reference') as string) || undefined;
  const paidAt = new Date((formData.get('paidAt') as string) || Date.now());

  await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method,
      receiptUrl,
      reference,
      paidAt,
      recordedById: user.id,
    },
  });

  const inv = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { payments: true } });
  const totalPaid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
  const newStatus = totalPaid >= Number(inv.amount) ? 'PAID' : 'PARTIAL';
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: newStatus },
  });

  revalidatePath('/dashboard/payments');
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard');
}
