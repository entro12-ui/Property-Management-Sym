import type { Prisma, InvoiceStatus } from '@prisma/client';
import type { AuthUser } from '@/lib/auth';

const TENANT_VISIBLE_STATUSES: InvoiceStatus[] = ['SENT', 'PARTIAL', 'OVERDUE', 'PAID'];

export function tenantInvoiceWhere(
  user: Pick<AuthUser, 'tenantProfileId' | 'unitId'>,
  filters?: { status?: string }
): Prisma.InvoiceWhereInput {
  const scope: Prisma.InvoiceWhereInput[] = [];
  if (user.tenantProfileId) scope.push({ tenantId: user.tenantProfileId });
  if (user.unitId) scope.push({ unitId: user.unitId });

  return {
    OR: scope.length > 0 ? scope : [{ id: '__none__' }],
    status: filters?.status
      ? (filters.status as InvoiceStatus)
      : { in: TENANT_VISIBLE_STATUSES },
  };
}

export function tenantCanAccessInvoice(
  user: Pick<AuthUser, 'tenantProfileId' | 'unitId'>,
  invoice: { tenantId: string | null; unitId: string }
): boolean {
  if (user.tenantProfileId && invoice.tenantId === user.tenantProfileId) return true;
  if (user.unitId && invoice.unitId === user.unitId) return true;
  return false;
}
