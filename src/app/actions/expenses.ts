'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;

export async function createExpense(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const buildingId = formData.get('buildingId') as string;
  const category = formData.get('category') as string;
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const description = (formData.get('description') as string) || undefined;
  const expenseDate = new Date(formData.get('expenseDate') as string);

  await prisma.expense.create({
    data: { buildingId, category, amount, description, expenseDate },
  });
  revalidatePath('/dashboard/reports');
  revalidatePath('/dashboard');
}
