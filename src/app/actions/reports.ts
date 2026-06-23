'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { buildingWhereForUser } from '@/lib/building-scope';
import type { ExpenseCategory, IncomeType, UnitStatus } from '@prisma/client';

export type ArrearsBucket = 'current' | 'days1to30' | 'days31to60' | 'days60plus';

export type PropertyReport = Awaited<ReturnType<typeof getPropertyReport>>;

export async function getPropertyReport(year: number, buildingId?: string) {
  const user = await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT']);
  const buildingScope = buildingWhereForUser(user);

  const buildingFilter = buildingId
    ? { id: buildingId, ...(buildingScope ?? {}) }
    : buildingScope;

  const buildings = await prisma.building.findMany({
    where: buildingFilter,
    orderBy: { name: 'asc' },
    include: {
      units: {
        include: {
          tenant: { include: { user: { select: { fullName: true, phone: true } } } },
        },
        orderBy: [{ floorNumber: 'asc' }, { unitNumber: 'asc' }],
      },
    },
  });

  const buildingIds = buildings.map((b) => b.id);
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  if (buildingIds.length === 0) {
    return {
      year,
      buildingOptions: [],
      buildingBreakdown: [],
      unitRoster: [],
      incomeByType: {},
      expenseByCategory: {},
      collectionRate: 100,
      totalInvoiced: 0,
      totalCollected: 0,
      arrears: { current: 0, days1to30: 0, days31to60: 0, days60plus: 0, total: 0 },
      arrearsList: [],
      portfolio: {
        totalUnits: 0,
        occupied: 0,
        vacant: 0,
        monthlyRentPotential: 0,
        rentalIncome: 0,
        otherIncome: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        occupancyRate: 0,
      },
    };
  }

  const buildingIdFilter = { buildingId: { in: buildingIds } };

  const [payments, incomes, expenses, yearInvoices, outstandingInvoices] = await Promise.all([
    prisma.payment.findMany({
      where: {
        paidAt: { gte: startDate, lte: endDate },
        invoice: { unit: buildingIdFilter },
      },
      include: { invoice: { include: { unit: { select: { buildingId: true } } } } },
    }),
    prisma.income.findMany({
      where: {
        incomeDate: { gte: startDate, lte: endDate },
        ...buildingIdFilter,
      },
    }),
    prisma.expense.findMany({
      where: {
        expenseDate: { gte: startDate, lte: endDate },
        approvalStatus: 'APPROVED',
        ...buildingIdFilter,
      },
    }),
    prisma.invoice.findMany({
      where: {
        year,
        status: { not: 'CANCELLED' },
        unit: buildingIdFilter,
      },
      include: { payments: true },
    }),
    prisma.invoice.findMany({
      where: {
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        unit: buildingIdFilter,
      },
      include: {
        payments: true,
        unit: {
          include: {
            building: { select: { name: true } },
            tenant: { include: { user: { select: { fullName: true } } } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    }),
  ]);

  const buildingBreakdown = buildings.map((building) => {
    const units = building.units;
    const occupied = units.filter((u) => u.status === 'OCCUPIED').length;
    const vacant = units.filter((u) => u.status === 'AVAILABLE').length;
    const monthlyRentPotential = units.reduce((s, u) => s + Number(u.rentAmount), 0);

    const buildingPayments = payments.filter((p) => p.invoice.unit.buildingId === building.id);
    const buildingIncomes = incomes.filter((i) => i.buildingId === building.id);
    const buildingExpenses = expenses.filter((e) => e.buildingId === building.id);

    const rentalIncome = buildingPayments.reduce((s, p) => s + Number(p.amount), 0);
    const otherIncome = buildingIncomes.reduce((s, i) => s + Number(i.amount), 0);
    const totalIncome = rentalIncome + otherIncome;
    const totalExpenses = buildingExpenses.reduce((s, e) => s + Number(e.amount), 0);

    return {
      id: building.id,
      name: building.name,
      address: building.address,
      city: building.city,
      totalUnits: units.length,
      occupied,
      vacant,
      occupancyRate: units.length > 0 ? Math.round((occupied / units.length) * 100) : 0,
      monthlyRentPotential,
      rentalIncome,
      otherIncome,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
    };
  });

  const rentalFromPayments = payments.reduce((s, p) => s + Number(p.amount), 0);
  const incomeByType: Partial<Record<IncomeType | 'RENTAL', number>> = { RENTAL: rentalFromPayments };
  for (const inc of incomes) {
    incomeByType[inc.type] = (incomeByType[inc.type] ?? 0) + Number(inc.amount);
  }

  const expenseByCategory: Partial<Record<ExpenseCategory, number>> = {};
  for (const exp of expenses) {
    expenseByCategory[exp.category] = (expenseByCategory[exp.category] ?? 0) + Number(exp.amount);
  }

  const totalInvoiced = yearInvoices.reduce((s, inv) => s + Number(inv.amount) + Number(inv.latePenalty), 0);
  const totalCollected = yearInvoices.reduce(
    (s, inv) => s + inv.payments.reduce((ps, p) => ps + Number(p.amount), 0),
    0,
  );
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const arrears = { current: 0, days1to30: 0, days31to60: 0, days60plus: 0, total: 0 };
  const arrearsList: {
    id: string;
    buildingName: string;
    unitNumber: string;
    tenantName: string | null;
    dueDate: Date;
    balance: number;
    daysOverdue: number;
    bucket: ArrearsBucket;
  }[] = [];

  for (const inv of outstandingInvoices) {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    const balance = Math.max(0, Number(inv.amount) + Number(inv.latePenalty) - paid);
    if (balance <= 0) continue;

    const due = new Date(inv.dueDate);
    due.setHours(0, 0, 0, 0);
    const daysOverdue = due < today ? Math.floor((today.getTime() - due.getTime()) / 86400000) : 0;

    let bucket: ArrearsBucket;
    if (daysOverdue <= 0) {
      bucket = 'current';
      arrears.current += balance;
    } else if (daysOverdue <= 30) {
      bucket = 'days1to30';
      arrears.days1to30 += balance;
    } else if (daysOverdue <= 60) {
      bucket = 'days31to60';
      arrears.days31to60 += balance;
    } else {
      bucket = 'days60plus';
      arrears.days60plus += balance;
    }

    arrears.total += balance;
    arrearsList.push({
      id: inv.id,
      buildingName: inv.unit.building.name,
      unitNumber: inv.unit.unitNumber,
      tenantName: inv.unit.tenant?.user.fullName ?? null,
      dueDate: inv.dueDate,
      balance,
      daysOverdue,
      bucket,
    });
  }

  const unitRoster = buildings.flatMap((b) =>
    b.units.map((u) => ({
      buildingId: b.id,
      buildingName: b.name,
      unitNumber: u.unitNumber,
      floorNumber: u.floorNumber,
      status: u.status as UnitStatus,
      rentAmount: Number(u.rentAmount),
      tenantName: u.tenant?.user.fullName ?? null,
      tenantPhone: u.tenant?.user.phone ?? null,
      leaseStart: u.leaseStart,
      leaseEnd: u.leaseEnd,
    })),
  );

  const portfolioTotals = buildingBreakdown.reduce(
    (acc, b) => ({
      totalUnits: acc.totalUnits + b.totalUnits,
      occupied: acc.occupied + b.occupied,
      vacant: acc.vacant + b.vacant,
      monthlyRentPotential: acc.monthlyRentPotential + b.monthlyRentPotential,
      rentalIncome: acc.rentalIncome + b.rentalIncome,
      otherIncome: acc.otherIncome + b.otherIncome,
      totalIncome: acc.totalIncome + b.totalIncome,
      totalExpenses: acc.totalExpenses + b.totalExpenses,
      netProfit: acc.netProfit + b.netProfit,
    }),
    {
      totalUnits: 0,
      occupied: 0,
      vacant: 0,
      monthlyRentPotential: 0,
      rentalIncome: 0,
      otherIncome: 0,
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
    },
  );

  const portfolio = {
    ...portfolioTotals,
    occupancyRate:
      portfolioTotals.totalUnits > 0
        ? Math.round((portfolioTotals.occupied / portfolioTotals.totalUnits) * 100)
        : 0,
  };

  return {
    year,
    buildingOptions: buildings.map((b) => ({ id: b.id, name: b.name })),
    buildingBreakdown,
    unitRoster,
    incomeByType,
    expenseByCategory,
    collectionRate,
    totalInvoiced,
    totalCollected,
    arrears,
    arrearsList,
    portfolio,
  };
}
