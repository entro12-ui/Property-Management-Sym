import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { ExpenseForm } from '@/components/reports/ExpenseForm';

export default async function ReportsPage() {
  await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT']);

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const [monthlyIncome, paidInvoicesWithUnit, outstandingInvoices, expensesByBuilding, buildings] = await Promise.all([
    prisma.invoice.aggregate({
      where: { month: thisMonth, year: thisYear, status: 'PAID' },
      _sum: { amount: true },
    }),
    prisma.invoice.findMany({
      where: { month: thisMonth, year: thisYear, status: 'PAID' },
      include: { unit: { select: { buildingId: true } } },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
      include: { unit: { include: { building: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.expense.groupBy({
      by: ['buildingId'],
      _sum: { amount: true },
    }),
    prisma.building.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  const buildingIncomeMap: Record<string, number> = {};
  for (const inv of paidInvoicesWithUnit) {
    const bid = inv.unit.buildingId;
    buildingIncomeMap[bid] = (buildingIncomeMap[bid] ?? 0) + Number(inv.amount);
  }
  const buildingNames = Object.fromEntries(buildings.map((b) => [b.id, b.name]));

  const totalMonthly = Number(monthlyIncome._sum.amount ?? 0);
  const totalOutstanding = outstandingInvoices.reduce((s, inv) => s + Number(inv.amount) + Number(inv.latePenalty), 0);
  const totalExpenses = expensesByBuilding.reduce((s, e) => s + Number(e._sum.amount ?? 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Income, outstanding rent, and expenses</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Monthly income ({thisMonth}/{thisYear})</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Outstanding rent</h2>
          <p className="mt-2 text-3xl font-bold text-amber-600">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Total expenses</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Building income ({thisMonth}/{thisYear})</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {buildings.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No buildings yet.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Building</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Income (paid)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {buildings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 text-sm">{b.name}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(buildingIncomeMap[b.id] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Record expense</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track maintenance, security, cleaning, utilities</p>
        <div className="mt-4">
          <ExpenseForm buildings={buildings} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Outstanding invoices</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {outstandingInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No outstanding invoices.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {outstandingInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 text-sm">{inv.unit.building.name} – {inv.unit.unitNumber}</td>
                    <td className="px-4 py-3 text-sm">{inv.month}/{inv.year}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(Number(inv.amount) + Number(inv.latePenalty))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Expenses by building</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {expensesByBuilding.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No expenses recorded.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Building</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Total expenses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {expensesByBuilding.map((e) => (
                  <tr key={e.buildingId}>
                    <td className="px-4 py-3 text-sm">{buildingNames[e.buildingId] ?? e.buildingId}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(Number(e._sum.amount ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
