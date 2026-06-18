import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getFinancialSummary, getRecentActivity } from '@/app/actions/financial';
import { getBuildings } from '@/app/actions/buildings';
import { formatCurrency } from '@/lib/utils';
import { isDueWithin, isOverdue } from '@/lib/invoice-utils';
import { formatPeriodLabel } from '@/lib/billing-utils';
import { ROLE_LABELS, floorLabel } from '@/types';
import { Building2, DoorOpen, FileText, Wrench, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { CashFlowChart } from '@/components/dashboard/FinancialCharts';
import { getMonthlyCashFlow } from '@/app/actions/financial';

export default async function DashboardPage() {
  const user = await requireAuth();

  const isAdmin =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'BUILDING_OWNER' ||
    user.role === 'PROPERTY_MANAGER' ||
    user.role === 'ACCOUNTANT';

  if (!isAdmin) {
    return <TenantDashboard user={user} />;
  }

  const year = new Date().getFullYear();
  const [summary, cashFlow, buildings, activity, buildingsList] = await Promise.all([
    getFinancialSummary(year),
    getMonthlyCashFlow(year),
    prisma.building.count(),
    getRecentActivity(8),
    getBuildings().catch(() => []),
  ]);

  const allPendingInvoices = await prisma.invoice.findMany({
    where: { status: { in: ['SENT', 'PARTIAL', 'DRAFT', 'OVERDUE'] } },
    include: { unit: { select: { unitNumber: true, building: { select: { name: true } } } }, payments: true },
  });
  const dueSoon = allPendingInvoices.filter((inv) => isDueWithin(inv.dueDate, 15));
  const overdue = allPendingInvoices.filter((inv) => isOverdue(inv.dueDate));
  const maintenancePending = await prisma.maintenanceRequest.count({ where: { status: 'PENDING' } });

  const cards = [
    { title: 'Total income (YTD)', value: formatCurrency(summary.totalIncome), icon: DollarSign, href: '/dashboard/reports', color: 'text-emerald-500' },
    { title: 'Net profit (YTD)', value: formatCurrency(summary.netProfit), icon: TrendingUp, href: '/dashboard/reports', color: summary.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500' },
    { title: 'Outstanding rent', value: formatCurrency(summary.outstandingRent), icon: AlertTriangle, href: '/dashboard/invoices?status=OVERDUE', color: 'text-amber-500' },
    { title: 'Occupancy rate', value: `${summary.occupancyRate}%`, icon: DoorOpen, href: '/dashboard/units', color: 'text-sky-500' },
    { title: 'Vacant rooms', value: String(summary.vacantRooms), icon: DoorOpen, color: 'text-slate-400' },
    { title: 'Buildings', value: String(buildings), icon: Building2, href: '/dashboard/buildings', color: 'text-sky-500' },
    { title: 'Due in 15 days', value: String(dueSoon.length), icon: FileText, href: '/dashboard/invoices', color: 'text-amber-500' },
    { title: 'Maintenance pending', value: String(maintenancePending), icon: Wrench, href: '/dashboard/maintenance', color: 'text-orange-500' },
  ];

  const roleLabel = ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Dashboard</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Building rental management overview</p>
      <p className="mt-1 text-xs font-medium text-sky-600 dark:text-sky-400">Signed in as {roleLabel}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</span>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
            </div>
          );
          return card.href ? <Link key={card.title} href={card.href}>{content}</Link> : <div key={card.title}>{content}</div>;
        })}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white">Monthly cash flow</h2>
        <div className="mt-4">
          <CashFlowChart data={cashFlow} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {(overdue.length > 0 || dueSoon.length > 0) && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payment alerts</h2>
            {overdue.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <h3 className="font-medium text-amber-800 dark:text-amber-200">Overdue ({overdue.length})</h3>
                <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  {overdue.slice(0, 5).map((inv) => (
                    <li key={inv.id}>
                      <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                        Room {inv.unit.unitNumber} – {formatPeriodLabel(inv)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {dueSoon.length > 0 && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
                <h3 className="font-medium text-sky-800 dark:text-sky-200">Due within 15 days ({dueSoon.length})</h3>
                <ul className="mt-2 space-y-1 text-sm text-sky-700 dark:text-sky-300">
                  {dueSoon.slice(0, 5).map((inv) => (
                    <li key={inv.id}>
                      <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                        Room {inv.unit.unitNumber} – due {new Date(inv.dueDate).toLocaleDateString()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent activity</h2>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            {activity.length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="text-sm border-b border-slate-100 pb-2 last:border-0 dark:border-slate-700">
                    <p>{a.description}</p>
                    <p className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {buildingsList.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your buildings</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {buildingsList.map((b) => (
              <Link key={b.id} href={`/dashboard/buildings/${b.id}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                <p className="font-medium text-slate-900 dark:text-white">{b.name}</p>
                <p className="text-sm text-slate-500">{b._count.units} rooms</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

async function TenantDashboard({ user }: { user: { id: string; fullName: string; unitId: string | null; tenantProfileId: string | null } }) {
  const tenantProfile = user.tenantProfileId
    ? await prisma.tenantProfile.findUnique({
        where: { id: user.tenantProfileId },
        include: { unit: { include: { building: true } } },
      })
    : null;

  const myInvoices = await prisma.invoice.findMany({
    where: { tenantId: user.tenantProfileId ?? undefined },
    orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
    take: 5,
    include: { unit: true, payments: true },
  });

  const upcoming = myInvoices.filter((inv) => {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return paid < Number(inv.amount) && inv.status !== 'PAID' && inv.status !== 'CANCELLED';
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {user.fullName}</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Tenant portal</p>

      {tenantProfile?.unit && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Your room</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            {tenantProfile.unit.building.name} – Room {tenantProfile.unit.unitNumber} ({floorLabel(tenantProfile.unit.floorNumber)})
          </p>
          <p className="mt-1 text-sm text-slate-500">Monthly rent: {formatCurrency(tenantProfile.unit.rentAmount)}</p>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent invoices</h2>
            <Link href="/dashboard/invoices" className="text-sm text-sky-500 hover:underline">View all</Link>
          </div>
          {myInvoices.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No invoices yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {myInvoices.map((inv) => (
                <li key={inv.id} className="flex justify-between text-sm">
                  <span>{formatPeriodLabel(inv)}</span>
                  <span>{inv.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Upcoming payments</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-emerald-600">All caught up!</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {upcoming.map((inv) => {
                const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
                const balance = Number(inv.amount) - paid;
                return (
                  <li key={inv.id} className="flex justify-between">
                    <span>Due {new Date(inv.dueDate).toLocaleDateString()}</span>
                    <span className="font-medium">{formatCurrency(balance)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/dashboard/payments" className="mt-3 inline-block text-sm text-sky-500 hover:underline">Payment history →</Link>
        </div>
      </div>
    </div>
  );
}
