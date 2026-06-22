import { requireRole } from '@/lib/auth';
import { getFinancialSummary, getMonthlyCashFlow, getRecentActivity } from '@/app/actions/financial';
import { getBuildings } from '@/app/actions/buildings';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { CashFlowChart } from '@/components/dashboard/FinancialCharts';
import Link from 'next/link';
import { Download } from 'lucide-react';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT']);
  const { year: yearParam } = await searchParams;
  const year = parseInt(yearParam ?? String(new Date().getFullYear()), 10);

  const [summary, cashFlow, buildings, activity] = await Promise.all([
    getFinancialSummary(year),
    getMonthlyCashFlow(year),
    getBuildings(),
    getRecentActivity(10),
  ]);

  const outstandingInvoices = await prisma.invoice.findMany({
    where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
    include: { unit: { include: { building: true } }, payments: true },
    orderBy: { dueDate: 'asc' },
    take: 20,
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Reports</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Income, expenses, net profit, and exportable reports for {year}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/reports/export?type=financial&format=xlsx&year=${year}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600">
            <Download className="h-4 w-4" /> Excel
          </a>
          <a href={`/api/reports/export?type=financial&format=pdf&year=${year}`} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
            <Download className="h-4 w-4" /> PDF
          </a>
          <a href="/api/reports/export?type=tenants&format=xlsx" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600">
            Tenant roster
          </a>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {[year - 1, year, year + 1].map((y) => (
          <Link key={y} href={`/dashboard/reports?year=${y}`} className={`rounded-lg px-3 py-1.5 text-sm ${y === year ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40' : 'text-slate-600 hover:bg-slate-100'}`}>{y}</Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total income" value={formatCurrency(summary.totalIncome)} color="emerald" />
        <MetricCard title="Total expenses" value={formatCurrency(summary.totalExpenses)} color="orange" />
        <MetricCard title="Net profit" value={formatCurrency(summary.netProfit)} color={summary.netProfit >= 0 ? 'sky' : 'red'} />
        <MetricCard title="Outstanding rent" value={formatCurrency(summary.outstandingRent)} color="amber" />
        <MetricCard title="Occupancy rate" value={`${summary.occupancyRate}%`} color="sky" />
        <MetricCard title="Vacant rooms" value={String(summary.vacantRooms)} color="slate" />
        <MetricCard title="Rental income" value={formatCurrency(summary.rentalIncome)} color="emerald" />
        <MetricCard title="Other income" value={formatCurrency(summary.additionalIncome)} color="emerald" />
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white">Monthly cash flow ({year})</h2>
        <div className="mt-4">
          <CashFlowChart data={cashFlow} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Outstanding invoices</h2>
          <div className="mt-4 table-shell">
            {outstandingInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No outstanding invoices.</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Due</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {outstandingInvoices.map((inv) => {
                    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
                    const balance = Math.max(0, Number(inv.amount) + Number(inv.latePenalty) - paid);
                    return (
                      <tr key={inv.id}>
                        <td className="px-4 py-3 text-sm">{inv.unit.building.name} – {inv.unit.unitNumber}</td>
                        <td className="px-4 py-3 text-sm">{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm font-medium text-amber-600">{formatCurrency(balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent activity</h2>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            {activity.length === 0 ? (
              <p className="text-sm text-slate-500">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="border-b border-slate-100 pb-2 text-sm last:border-0 dark:border-slate-700">
                    <p className="text-slate-900 dark:text-white">{a.description}</p>
                    <p className="text-xs text-slate-500">{a.user?.fullName ?? 'System'} · {new Date(a.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/dashboard/expenses" className="text-sky-500 hover:underline">Manage expenses →</Link>
        <Link href="/dashboard/income" className="text-sky-500 hover:underline">Manage income →</Link>
      </div>
    </div>
  );
}

function MetricCard({ title, value, color }: { title: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
    orange: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20',
    sky: 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-900/20',
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
    red: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    slate: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color] ?? colors.slate}`}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
