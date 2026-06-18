'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { expenseWhereForUser } from '@/lib/building-scope';
import { logActivity } from '@/lib/activity-log';
import { revalidatePath } from 'next/cache';
import type { ExpenseCategory } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;
const APPROVER_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

export async function getExpenses(filters?: { buildingId?: string; status?: string }) {
  const user = await requireRole(ADMIN_ROLES);
  const scope = expenseWhereForUser(user);
  return prisma.expense.findMany({
    where: {
      ...(scope ? scope : {}),
      ...(filters?.buildingId && { buildingId: filters.buildingId }),
      ...(filters?.status && { approvalStatus: filters.status as 'PENDING' | 'APPROVED' | 'REJECTED' }),
    },
    orderBy: { expenseDate: 'desc' },
    include: {
      building: { select: { name: true } },
      approvedBy: { select: { fullName: true } },
    },
  });
}

export async function getExpense(id: string) {
  await requireRole(ADMIN_ROLES);
  return prisma.expense.findUniqueOrThrow({
    where: { id },
    include: { building: true, approvedBy: { select: { fullName: true } } },
  });
}

export async function createExpense(formData: FormData) {
  const user = await requireRole(ADMIN_ROLES);
  const buildingId = formData.get('buildingId') as string;
  const category = formData.get('category') as ExpenseCategory;
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const description = (formData.get('description') as string) || undefined;
  const expenseDate = new Date(formData.get('expenseDate') as string);
  const receiptUrl = (formData.get('receiptUrl') as string) || undefined;

  const expense = await prisma.expense.create({
    data: { buildingId, category, amount, description, expenseDate, receiptUrl },
  });

  await logActivity({
    userId: user.id,
    action: 'CREATE',
    entityType: 'Expense',
    entityId: expense.id,
    description: `Recorded expense: ${category}`,
  });

  revalidatePath('/dashboard/expenses');
  revalidatePath('/dashboard/reports');
  revalidatePath('/dashboard');
}

export async function updateExpense(id: string, formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const category = formData.get('category') as ExpenseCategory;
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const description = (formData.get('description') as string) || undefined;
  const expenseDate = new Date(formData.get('expenseDate') as string);
  const receiptUrl = (formData.get('receiptUrl') as string) || undefined;

  await prisma.expense.update({
    where: { id },
    data: { category, amount, description, expenseDate, receiptUrl: receiptUrl || undefined },
  });
  revalidatePath('/dashboard/expenses');
  revalidatePath('/dashboard/reports');
}

export async function approveExpense(id: string, approved: boolean) {
  const user = await requireRole(APPROVER_ROLES);
  await prisma.expense.update({
    where: { id },
    data: {
      approvalStatus: approved ? 'APPROVED' : 'REJECTED',
      approvedById: user.id,
      approvedAt: new Date(),
    },
  });
  revalidatePath('/dashboard/expenses');
  revalidatePath('/dashboard/reports');
}

export async function deleteExpense(id: string) {
  await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER']);
  await prisma.expense.delete({ where: { id } });
  revalidatePath('/dashboard/expenses');
  revalidatePath('/dashboard/reports');
}
