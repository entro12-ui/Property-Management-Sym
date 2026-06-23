import { requireRole } from '@/lib/auth';
import { getPropertyReport } from '@/app/actions/reports';
import { getMonthlyCashFlow } from '@/app/actions/financial';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CashFlowChart, BreakdownChart } from '@/components/dashboard/FinancialCharts';
import {
  INCOME_TYPE_LABELS,
  EXPENSE_CATEGORY_LABELS,
  UNIT_STATUS_LABELS,
} from '@/types';
import type { ExpenseCategory, IncomeType } from '@prisma/client';
import Link from 'next/link';
import { Download, Building2, Users, DollarSign, AlertTriangle } from 'lucide-react';

const SECTIONS = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'buildings', label: 'Buildings' },
  { id: 'financials', label: 'Financials' },
  { id: 'collection', label: 'Collection' },
  { id: 'units', label: 'Units & Tenants' },
] as const;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; building?: string }>;
}) {
  await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT']);
  const { year: yearParam, building: buildingParam } = await searchParams;
  const year = parseInt(yearParam ?? String(new Date().getFullYear()), 10);
  const buildingId = buildingParam || undefined;

  const [report, cashFlow] = await Promise.all([
    getPropertyReport(year, buildingId),
    getMonthlyCashFlow(year),
  ]);

  const { portfolio, buildingBreakdown, unitRoster, incomeByType, expenseByCategory, arrears, arrearsList } =
    report;

  const incomeChartData = Object.entries(incomeByType)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => ({
      name: type === 'RENTAL' ? 'Rental (payments)' : INCOME_TYPE_LABELS[type as IncomeType],
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const expenseChartData = Object.entries(expenseByCategory)
    .filter(([, amount]) => amount > 0)
    .map(([cat, amount]) => ({
      name: EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory],
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  function buildUrl(overrides: { year?: number; building?: string }) {
    const params = new URLSearchParams();
    params.set('year', String(overrides.year ?? year));
    const b = overrides.building !== undefined ? overrides.building : buildingId;
    if (b) params.set('building', b);
    return `/dashboard/reports?${params.toString()}`;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Property Reports</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Detailed portfolio analysis, occupancy, financials, and rent collection for {year}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/reports/export?type=financial&format=xlsx&year=${year}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" /> Excel
          </a>
          <a
            href={`/api/reports/export?type=financial&format=pdf&year=${year}`}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            <Download className="h-4 w-4" /> PDF
          </a>
          <a
            href="/api/reports/export?type=tenants&format=xlsx"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Tenant roster
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
          {[year - 1, year, year + 1].map((y) => (
            <Link
              key={y}
              href={buildUrl({ year: y })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                y === year
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>

        {report.buildingOptions.length > 1 && (
          <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
            <Link
              href={buildUrl({ building: '' })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                !buildingId
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              All buildings
            </Link>
            {report.buildingOptions.map((b) => (
              <Link
                key={b.id}
                href={buildUrl({ building: b.id })}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  buildingId === b.id
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {b.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Portfolio summary */}
      <section id="portfolio" className="mt-8 scroll-mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Building2 className="h-5 w-5 text-sky-500" />
          Portfolio summary
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Buildings" value={String(buildingBreakdown.length)} sub={`${portfolio.totalUnits} total rooms`} />
          <SummaryCard
            label="Occupancy"
            value={`${portfolio.occupancyRate}%`}
            sub={`${portfolio.occupied} occupied · ${portfolio.vacant} vacant`}
          />
          <SummaryCard
            label="Monthly rent potential"
            value={formatCurrency(portfolio.monthlyRentPotential)}
            sub="If all rooms are leased at current rates"
          />
          <SummaryCard
            label="Net profit (YTD)"
            value={formatCurrency(portfolio.netProfit)}
            sub={`Income ${formatCurrency(portfolio.totalIncome)} · Expenses ${formatCurrency(portfolio.totalExpenses)}`}
            highlight={portfolio.netProfit >= 0 ? 'positive' : 'negative'}
          />
        </div>
      </section>

      {/* Building performance */}
      <section id="buildings" className="mt-10 scroll-mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Building performance</h2>
        <p className="mt-1 text-sm text-slate-500">Income, expenses, and occupancy by building for {year}</p>
        <div className="mt-4 table-shell overflow-x-auto">
          {buildingBreakdown.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No buildings found.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Building</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Rooms</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Occupancy</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Rent potential/mo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Income (YTD)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Expenses (YTD)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Net profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {buildingBreakdown.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/buildings/${b.id}`} className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                        {b.name}
                      </Link>
                      <p className="text-xs text-slate-500">{b.city}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {b.occupied}/{b.totalUnits}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <OccupancyBar rate={b.occupancyRate} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(b.monthlyRentPotential)}</td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-600">{formatCurrency(b.totalIncome)}</td>
                    <td className="px-4 py-3 text-right text-sm text-orange-600">{formatCurrency(b.totalExpenses)}</td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${b.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(b.netProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {buildingBreakdown.length > 1 && (
                <tfoot className="bg-slate-50 font-medium dark:bg-slate-700/50">
                  <tr>
                    <td className="px-4 py-3 text-sm">Total</td>
                    <td className="px-4 py-3 text-right text-sm">
                      {portfolio.occupied}/{portfolio.totalUnits}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{portfolio.occupancyRate}%</td>
                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(portfolio.monthlyRentPotential)}</td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-600">{formatCurrency(portfolio.totalIncome)}</td>
                    <td className="px-4 py-3 text-right text-sm text-orange-600">{formatCurrency(portfolio.totalExpenses)}</td>
                    <td className={`px-4 py-3 text-right text-sm ${portfolio.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(portfolio.netProfit)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </section>

      {/* Financial breakdown */}
      <section id="financials" className="mt-10 scroll-mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <DollarSign className="h-5 w-5 text-emerald-500" />
          Financial breakdown
        </h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="font-medium text-slate-900 dark:text-white">Income by source</h3>
            <div className="mt-4">
              <BreakdownChart data={incomeChartData} color="#10b981" />
            </div>
            <IncomeExpenseTable
              rows={incomeChartData}
              total={portfolio.totalIncome}
              colorClass="text-emerald-600"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="font-medium text-slate-900 dark:text-white">Expenses by category</h3>
            <div className="mt-4">
              <BreakdownChart data={expenseChartData} color="#f97316" />
            </div>
            <IncomeExpenseTable
              rows={expenseChartData}
              total={portfolio.totalExpenses}
              colorClass="text-orange-600"
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-medium text-slate-900 dark:text-white">Monthly cash flow ({year})</h3>
          <div className="mt-4">
            <CashFlowChart data={cashFlow} />
          </div>
        </div>
      </section>

      {/* Rent collection & arrears */}
      <section id="collection" className="mt-10 scroll-mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Rent collection & arrears
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CollectionCard
            label="Collection rate"
            value={`${report.collectionRate}%`}
            sub={`${formatCurrency(report.totalCollected)} of ${formatCurrency(report.totalInvoiced)} invoiced`}
            progress={report.collectionRate}
          />
          <ArrearsCard label="Not yet due" amount={arrears.current} color="sky" />
          <ArrearsCard label="1–30 days overdue" amount={arrears.days1to30} color="amber" />
          <ArrearsCard label="31+ days overdue" amount={arrears.days31to60 + arrears.days60plus} color="red" />
        </div>

        {arrearsList.length > 0 && (
          <div className="mt-6 table-shell overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Due date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {arrearsList.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/dashboard/invoices/${row.id}`} className="hover:underline">
                        {row.buildingName} – {row.unitNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.tenantName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(row.dueDate)}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-amber-600">{formatCurrency(row.balance)}</td>
                    <td className="px-4 py-3 text-sm">
                      <ArrearsBadge bucket={row.bucket} daysOverdue={row.daysOverdue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {arrearsList.length === 0 && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
            No outstanding rent balances. All invoices are paid or not yet due.
          </p>
        )}
      </section>

      {/* Unit & tenant roster */}
      <section id="units" className="mt-10 scroll-mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Users className="h-5 w-5 text-sky-500" />
          Unit & tenant roster
        </h2>
        <p className="mt-1 text-sm text-slate-500">Complete room inventory with tenant assignment and lease dates</p>
        <div className="mt-4 table-shell overflow-x-auto">
          {unitRoster.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No units found.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Building</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Floor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Tenant</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Rent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Lease</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {unitRoster.map((u) => (
                  <tr key={`${u.buildingId}-${u.unitNumber}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm">{u.buildingName}</td>
                    <td className="px-4 py-3 text-sm font-medium">{u.unitNumber}</td>
                    <td className="px-4 py-3 text-sm">{u.floorNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <UnitStatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {u.tenantName ? (
                        <span>
                          {u.tenantName}
                          {u.tenantPhone && <span className="block text-xs text-slate-500">{u.tenantPhone}</span>}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(u.rentAmount)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {u.leaseStart ? formatDate(u.leaseStart) : '—'}
                      {u.leaseEnd && ` → ${formatDate(u.leaseEnd)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: 'positive' | 'negative';
}) {
  const valueColor =
    highlight === 'positive'
      ? 'text-emerald-600 dark:text-emerald-400'
      : highlight === 'negative'
        ? 'text-red-600 dark:text-red-400'
        : 'text-slate-900 dark:text-white';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function OccupancyBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${rate}%` }} />
      </div>
      <span className="text-sm">{rate}%</span>
    </div>
  );
}

function IncomeExpenseTable({
  rows,
  total,
  colorClass,
}: {
  rows: { name: string; amount: number }[];
  total: number;
  colorClass: string;
}) {
  if (rows.length === 0) return null;

  return (
    <table className="mt-4 w-full text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} className="border-t border-slate-100 dark:border-slate-700">
            <td className="py-2 text-slate-600 dark:text-slate-300">{row.name}</td>
            <td className={`py-2 text-right font-medium ${colorClass}`}>{formatCurrency(row.amount)}</td>
            <td className="py-2 pl-3 text-right text-xs text-slate-500 w-12">
              {total > 0 ? `${Math.round((row.amount / total) * 100)}%` : '—'}
            </td>
          </tr>
        ))}
        <tr className="border-t border-slate-200 font-medium dark:border-slate-600">
          <td className="py-2">Total</td>
          <td className={`py-2 text-right ${colorClass}`}>{formatCurrency(total)}</td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}

function CollectionCard({
  label,
  value,
  sub,
  progress,
}: {
  label: string;
  value: string;
  sub: string;
  progress: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full ${progress >= 80 ? 'bg-emerald-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function ArrearsCard({ label, amount, color }: { label: string; amount: number; color: 'sky' | 'amber' | 'red' }) {
  const colors = {
    sky: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300',
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{formatCurrency(amount)}</p>
    </div>
  );
}

function ArrearsBadge({ bucket, daysOverdue }: { bucket: string; daysOverdue: number }) {
  if (bucket === 'current') {
    return <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">Not due</span>;
  }
  if (bucket === 'days1to30') {
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{daysOverdue}d overdue</span>;
  }
  return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">{daysOverdue}d overdue</span>;
}

function UnitStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OCCUPIED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    AVAILABLE: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    RESERVED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    MAINTENANCE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  };
  const label = UNIT_STATUS_LABELS[status as keyof typeof UNIT_STATUS_LABELS] ?? status;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.AVAILABLE}`}>{label}</span>;
}
