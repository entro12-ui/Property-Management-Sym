import { requireRole } from '@/lib/auth';
import { getExpenses } from '@/app/actions/expenses';
import { getBuildings } from '@/app/actions/buildings';
import { ExpenseFormPanel, ExpenseList } from '@/components/expenses/ExpenseModule';

export default async function ExpensesPage() {
  const user = await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT']);
  const [expenses, buildings] = await Promise.all([getExpenses(), getBuildings()]);
  const canApprove = user.role === 'SUPER_ADMIN' || user.role === 'BUILDING_OWNER' || user.role === 'PROPERTY_MANAGER';

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expense Management</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Track operational costs with categorization, receipts, and approval workflow</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <ExpenseFormPanel buildings={buildings} />
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Expense categories</h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>• Cleaner & security salaries</li>
            <li>• Water & electricity bills</li>
            <li>• Maintenance & repair costs</li>
            <li>• Administrative & miscellaneous</li>
          </ul>
          <p className="mt-4 text-xs text-slate-500">Expenses require approval before counting in financial reports.</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <ExpenseList expenses={expenses} canApprove={canApprove} />
      </div>
    </div>
  );
}
