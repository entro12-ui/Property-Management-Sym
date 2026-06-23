'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;

export async function getSmsLogs(limit = 50) {
  await requireRole(ADMIN_ROLES);
  return prisma.smsNotificationLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: { include: { user: { select: { fullName: true } } } },
      invoice: { include: { unit: { select: { unitNumber: true } } } },
    },
  });
}

export async function getRecentActivity(limit = 20) {
  await requireRole(ADMIN_ROLES);
  return prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { fullName: true } } },
  });
}

export async function getFinancialSummary(year: number, month?: number) {
  await requireRole(ADMIN_ROLES);

  const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
  const endDate = month ? new Date(year, month, 0) : new Date(year, 11, 31);

  const [payments, otherIncome, expenses, totalUnits, occupiedUnits, outstandingInvoices] = await Promise.all([
    prisma.payment.findMany({
      where: { paidAt: { gte: startDate, lte: endDate } },
      include: { invoice: true },
    }),
    prisma.income.findMany({
      where: { incomeDate: { gte: startDate, lte: endDate } },
    }),
    prisma.expense.findMany({
      where: { expenseDate: { gte: startDate, lte: endDate }, approvalStatus: 'APPROVED' },
    }),
    prisma.unit.count(),
    prisma.unit.count({ where: { status: 'OCCUPIED' } }),
    prisma.invoice.findMany({
      where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
      include: { payments: true },
    }),
  ]);

  const rentalIncome = payments.reduce((s, p) => s + Number(p.amount), 0);
  const additionalIncome = otherIncome.reduce((s, i) => s + Number(i.amount), 0);
  const totalIncome = rentalIncome + additionalIncome;
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const outstandingRent = outstandingInvoices.reduce((s, inv) => {
    const paid = inv.payments.reduce((ps, p) => ps + Number(p.amount), 0);
    return s + Math.max(0, Number(inv.amount) + Number(inv.latePenalty) - paid);
  }, 0);

  const vacantUnits = await prisma.unit.count({ where: { status: 'AVAILABLE' } });

  return {
    totalIncome,
    rentalIncome,
    additionalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    outstandingRent,
    occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
    vacantRooms: vacantUnits,
    occupiedUnits,
    totalUnits,
  };
}

export async function getMonthlyCashFlow(year: number) {
  await requireRole(ADMIN_ROLES);
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const [payments, incomes, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: { paidAt: { gte: start, lte: end } },
      select: { paidAt: true, amount: true },
    }),
    prisma.income.findMany({
      where: { incomeDate: { gte: start, lte: end } },
      select: { incomeDate: true, amount: true },
    }),
    prisma.expense.findMany({
      where: { expenseDate: { gte: start, lte: end }, approvalStatus: 'APPROVED' },
      select: { expenseDate: true, amount: true },
    }),
  ]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expenses: 0,
  }));

  for (const payment of payments) {
    months[new Date(payment.paidAt).getMonth()].income += Number(payment.amount);
  }
  for (const income of incomes) {
    months[new Date(income.incomeDate).getMonth()].income += Number(income.amount);
  }
  for (const expense of expenses) {
    months[new Date(expense.expenseDate).getMonth()].expenses += Number(expense.amount);
  }

  return months;
}
