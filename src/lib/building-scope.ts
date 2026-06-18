import type { AuthUser } from '@/lib/auth';
import type { Prisma } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

/** Restrict building queries for building owners to their owned buildings. */
export function buildingWhereForUser(user: AuthUser): Prisma.BuildingWhereInput | undefined {
  if (user.role === 'SUPER_ADMIN') return undefined;
  if (user.role === 'BUILDING_OWNER') {
    return { ownerId: user.id };
  }
  if (user.role === 'PROPERTY_MANAGER') {
    return { managerId: user.id };
  }
  return undefined;
}

export function unitWhereForUser(user: AuthUser): Prisma.UnitWhereInput | undefined {
  const buildingFilter = buildingWhereForUser(user);
  if (!buildingFilter) return undefined;
  return { building: buildingFilter };
}

export function expenseWhereForUser(user: AuthUser): Prisma.ExpenseWhereInput | undefined {
  const buildingFilter = buildingWhereForUser(user);
  if (!buildingFilter) return undefined;
  return { building: buildingFilter };
}

export function incomeWhereForUser(user: AuthUser): Prisma.IncomeWhereInput | undefined {
  const buildingFilter = buildingWhereForUser(user);
  if (!buildingFilter) return undefined;
  return { building: buildingFilter };
}

export function invoiceWhereForUser(user: AuthUser): Prisma.InvoiceWhereInput | undefined {
  const unitFilter = unitWhereForUser(user);
  if (!unitFilter) return undefined;
  return { unit: unitFilter };
}
