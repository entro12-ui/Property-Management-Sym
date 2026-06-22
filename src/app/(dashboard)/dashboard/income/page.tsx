import { requireRole } from '@/lib/auth';
import { getIncomes } from '@/app/actions/income';
import { getBuildings } from '@/app/actions/buildings';
import { getTenants } from '@/app/actions/tenants';
import { IncomeForm } from '@/components/income/IncomeForm';
import { INCOME_TYPE_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function IncomePage() {
  await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT']);
  const [incomes, buildings, tenants] = await Promise.all([
    getIncomes(),
    getBuildings(),
    getTenants(),
  ]);

  const tenantOptions = tenants.map((t) => ({
    id: t.id,
    label: `${t.user.fullName}${t.unit ? ` – Room ${t.unit.unitNumber}` : ''}`,
  }));

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Income Management</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Track rental income, deposits, advances, and other building revenue</p>

      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
        <p className="text-sm text-emerald-700 dark:text-emerald-300">Total recorded income</p>
        <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">{formatCurrency(totalIncome)}</p>
      </div>

      <div className="mt-8">
        <IncomeForm buildings={buildings} tenants={tenantOptions} />
      </div>

      <div className="mt-8 table-shell">
        {incomes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No income records yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Building</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {incomes.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 text-sm">{formatDate(i.incomeDate)}</td>
                  <td className="px-4 py-3 text-sm">{INCOME_TYPE_LABELS[i.type]}</td>
                  <td className="px-4 py-3 text-sm">{i.building.name}</td>
                  <td className="px-4 py-3 text-sm">{i.tenant?.user.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(i.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
