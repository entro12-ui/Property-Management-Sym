'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createInvoice } from '@/app/actions/invoices';

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const currentYear = new Date().getFullYear();

type UnitOption = { id: string; label: string; buildingName: string };

export function InvoiceForm({ unitOptions }: { unitOptions: UnitOption[] }) {
  return (
    <form action={createInvoice} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div>
        <label htmlFor="unitId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unit</label>
        <select id="unitId" name="unitId" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
          <option value="">Select unit</option>
          {unitOptions.map((u) => (
            <option key={u.id} value={u.id}>{u.label}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Month</label>
          <select id="month" name="month" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
          <input id="year" name="year" type="number" min={currentYear - 2} max={currentYear + 1} defaultValue={currentYear} required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Due date</label>
          <input id="dueDate" name="dueDate" type="date" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
          <input id="amount" name="amount" type="number" step="0.01" min={0} required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
        <textarea id="notes" name="notes" rows={2} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
      </div>
      <div className="flex gap-3 pt-2">
        <SubmitButton />
        <Link href="/dashboard/invoices" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300">Cancel</Link>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50">
      {pending ? 'Creating…' : 'Create invoice'}
    </button>
  );
}
