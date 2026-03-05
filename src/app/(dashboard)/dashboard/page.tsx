import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { isDueWithin, isOverdue } from '@/lib/invoice-utils';
import { Building2, DoorOpen, FileText, Wrench } from 'lucide-react';
import Link from 'next/link';

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

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const [buildingsCount, unitsCount, totalUnits, occupiedUnits, invoicesThisMonth, pendingInvoices, expiredLeases, maintenancePending] = await Promise.all([
    prisma.building.count(),
    prisma.unit.count(),
    prisma.unit.count(),
    prisma.unit.count({ where: { status: 'OCCUPIED' } }),
    prisma.invoice.aggregate({
      where: { month: thisMonth, year: thisYear, status: 'PAID' },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
      _sum: { amount: true },
    }),
    prisma.unit.count({ where: { leaseEnd: { lt: now }, status: 'OCCUPIED' } }),
    prisma.maintenanceRequest.count({ where: { status: 'PENDING' } }),
  ]);

  const monthlyIncome = Number(invoicesThisMonth._sum.amount ?? 0);
  const pendingRent = Number(pendingInvoices._sum.amount ?? 0);
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const allPendingInvoices = await prisma.invoice.findMany({
    where: { status: { in: ['SENT', 'PARTIAL', 'DRAFT'] } },
    include: { unit: { select: { unitNumber: true, building: { select: { name: true } } } } },
  });
  const dueSoon = allPendingInvoices.filter((inv) => isDueWithin(inv.dueDate, 7));
  const overdue = allPendingInvoices.filter((inv) => isOverdue(inv.dueDate));

  const cards = [
    { title: 'Monthly income', value: formatCurrency(monthlyIncome), icon: FileText, href: '/dashboard/reports' },
    { title: 'Pending rent', value: formatCurrency(pendingRent), icon: FileText, href: '/dashboard/invoices' },
    { title: 'Buildings', value: String(buildingsCount), icon: Building2, href: '/dashboard/buildings' },
    { title: 'Units', value: `${occupiedUnits} / ${unitsCount}`, icon: DoorOpen, href: '/dashboard/units' },
    { title: 'Occupancy rate', value: `${occupancyRate}%`, icon: DoorOpen },
    { title: 'Expired leases', value: String(expiredLeases), icon: FileText, href: '/dashboard/units' },
    { title: 'Maintenance pending', value: String(maintenancePending), icon: Wrench, href: '/dashboard/maintenance' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Overview of your properties and finances
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <Icon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
          );
          return card.href ? (
            <Link key={card.title} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.title}>{content}</div>
          );
        })}
      </div>

      {(dueSoon.length > 0 || overdue.length > 0) && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Alerts</h2>
          {overdue.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">Overdue invoices ({overdue.length})</h3>
              <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                {overdue.slice(0, 5).map((inv) => (
                  <li key={inv.id}>
                    <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                      {inv.unit.building.name} – Unit {inv.unit.unitNumber} ({inv.month}/{inv.year})
                    </Link>
                  </li>
                ))}
                {overdue.length > 5 && <li>… and {overdue.length - 5} more</li>}
              </ul>
              <Link href="/dashboard/invoices?status=OVERDUE" className="mt-2 inline-block text-sm font-medium text-amber-700 hover:underline dark:text-amber-300">View all →</Link>
            </div>
          )}
          {dueSoon.length > 0 && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
              <h3 className="font-medium text-sky-800 dark:text-sky-200">Due in next 7 days ({dueSoon.length})</h3>
              <ul className="mt-2 space-y-1 text-sm text-sky-700 dark:text-sky-300">
                {dueSoon.slice(0, 5).map((inv) => (
                  <li key={inv.id}>
                    <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                      {inv.unit.building.name} – Unit {inv.unit.unitNumber} ({inv.month}/{inv.year})
                    </Link>
                  </li>
                ))}
                {dueSoon.length > 5 && <li>… and {dueSoon.length - 5} more</li>}
              </ul>
              <Link href="/dashboard/invoices" className="mt-2 inline-block text-sm font-medium text-sky-700 hover:underline dark:text-sky-300">View all →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

async function TenantDashboard({ user }: { user: { id: string; fullName: string; unitId: string | null } }) {
  const tenantProfile = user.unitId
    ? await prisma.tenantProfile.findUnique({
        where: { unitId: user.unitId },
        include: { unit: { include: { building: true } } },
      })
    : null;

  const myInvoices = await prisma.invoice.findMany({
    where: { tenantId: tenantProfile?.id },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: 5,
    include: { unit: true },
  });

  const readCount = await prisma.announcementRead.count({ where: { userId: user.id } });
  const totalAnnouncements = await prisma.announcement.count();
  const unread = Math.max(0, totalAnnouncements - readCount);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Welcome, {user.fullName}
      </h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Tenant portal
      </p>

      {tenantProfile?.unit && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Your unit</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            {tenantProfile.unit.building.name} – Unit {tenantProfile.unit.unitNumber} (Floor {tenantProfile.unit.floorNumber})
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent invoices</h2>
            <Link href="/dashboard/invoices" className="text-sm text-sky-500 hover:underline">
              View all
            </Link>
          </div>
          {myInvoices.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No invoices yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {myInvoices.map((inv) => (
                <li key={inv.id} className="flex justify-between text-sm">
                  <span>{inv.month}/{inv.year} – {inv.unit.unitNumber}</span>
                  <span>{inv.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Announcements</h2>
            <Link href="/dashboard/announcements" className="text-sm text-sky-500 hover:underline">
              View all
            </Link>
          </div>
          {unread > 0 && (
            <p className="mt-2 text-sm text-sky-600 dark:text-sky-400">
              {unread} unread
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
