'use client';

import { useFormStatus } from 'react-dom';
import { createExpense } from '@/app/actions/expenses';

const CATEGORIES = ['maintenance', 'security', 'cleaning', 'utilities', 'other'];

export function ExpenseForm({ buildings }: { buildings: { id: string; name: string }[] }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={createExpense} className="mt-2 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Building</label>
        <select name="buildingId" required className="mt-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
          <option value="">Select</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
        <select name="category" required className="mt-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Amount</label>
        <input name="amount" type="number" step="0.01" min={0} required className="mt-1 w-28 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Date</label>
        <input name="expenseDate" type="date" defaultValue={today} required className="mt-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
      </div>
      <div className="min-w-[200px] flex-1">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Description</label>
        <input name="description" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="Optional" />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50">
      {pending ? 'Saving…' : 'Add expense'}
    </button>
  );
}
