'use client';

import { useState } from 'react';
import { generateQuarterlyInvoices } from '@/app/actions/invoices';
import { getCurrentQuarter } from '@/lib/billing-utils';

const current = getCurrentQuarter();

export function GenerateQuarterlyInvoicesForm() {
  const [quarter, setQuarter] = useState(current.quarter);
  const [year, setYear] = useState(current.year);
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setPending(true);
    try {
      const { created } = await generateQuarterlyInvoices(quarter, year);
      setResult(`Created ${created} quarterly draft invoice(s) for Q${quarter} ${year}.`);
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-semibold text-slate-900 dark:text-white">Generate quarterly invoices</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Create draft invoices for all occupied rooms (rent × 3 months) that don&apos;t have one for the selected quarter.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Quarter</label>
          <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))} className="mt-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>Q{q}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Year</label>
          <input type="number" min={current.year - 2} max={current.year + 1} value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-1 w-24 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <button type="submit" disabled={pending} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {pending ? 'Generating…' : 'Generate quarterly'}
        </button>
      </div>
      {result && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{result}</p>}
    </form>
  );
}
