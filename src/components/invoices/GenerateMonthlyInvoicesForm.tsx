'use client';

import { useState } from 'react';
import { generateMonthlyInvoices } from '@/app/actions/invoices';

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const currentYear = new Date().getFullYear();

export function GenerateMonthlyInvoicesForm() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setPending(true);
    try {
      const { created } = await generateMonthlyInvoices(month, year);
      setResult(`Created ${created} draft invoice(s) for ${month}/${year}.`);
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-semibold text-slate-900 dark:text-white">Generate monthly invoices</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create draft invoices for all occupied units that don’t have one for the selected month.</p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Month</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="mt-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Year</label>
          <input type="number" min={currentYear - 2} max={currentYear + 1} value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-1 w-24 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <button type="submit" disabled={pending} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50">
          {pending ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {result && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{result}</p>}
    </form>
  );
}
