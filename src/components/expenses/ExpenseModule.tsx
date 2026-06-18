'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { createExpense, approveExpense } from '@/app/actions/expenses';
import { formatCurrency } from '@/lib/utils';
import { EXPENSE_CATEGORY_LABELS, EXPENSE_APPROVAL_LABELS } from '@/types';
import type { ExpenseCategory, ExpenseApprovalStatus } from '@prisma/client';

const CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: { toString(): string };
  description: string | null;
  expenseDate: Date;
  receiptUrl: string | null;
  approvalStatus: ExpenseApprovalStatus;
  building: { name: string };
  approvedBy: { fullName: string } | null;
};

export function ExpenseList({ expenses, canApprove }: { expenses: Expense[]; canApprove: boolean }) {
  if (expenses.length === 0) {
    return <div className="p-8 text-center text-slate-500">No expenses recorded.</div>;
  }

  return (
    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
      <thead className="bg-slate-50 dark:bg-slate-700/50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Building</th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Amount</th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
          <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
        {expenses.map((e) => (
          <tr key={e.id}>
            <td className="px-4 py-3 text-sm">{new Date(e.expenseDate).toLocaleDateString()}</td>
            <td className="px-4 py-3 text-sm">{e.building.name}</td>
            <td className="px-4 py-3 text-sm">{EXPENSE_CATEGORY_LABELS[e.category]}</td>
            <td className="px-4 py-3 text-sm">{formatCurrency(e.amount)}</td>
            <td className="px-4 py-3 text-sm">{EXPENSE_APPROVAL_LABELS[e.approvalStatus]}</td>
            <td className="px-4 py-3 text-right text-sm">
              {e.receiptUrl && (
                <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer" className="mr-2 text-sky-500 hover:underline">Receipt</a>
              )}
              {canApprove && e.approvalStatus === 'PENDING' && (
                <>
                  <button type="button" onClick={() => approveExpense(e.id, true)} className="mr-2 text-emerald-600 hover:underline">Approve</button>
                  <button type="button" onClick={() => approveExpense(e.id, false)} className="text-red-500 hover:underline">Reject</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ExpenseFormPanel({ buildings }: { buildings: { id: string; name: string }[] }) {
  const [receiptUrl, setReceiptUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleReceipt(file: File) {
    const fd = new FormData();
    fd.set('file', file);
    fd.set('type', 'expense');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return;
    const { url } = await res.json();
    setReceiptUrl(url);
  }

  return (
    <form
      action={(fd) => {
        if (receiptUrl) fd.set('receiptUrl', receiptUrl);
        return createExpense(fd);
      }}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      <h2 className="font-semibold text-slate-900 dark:text-white">Record expense</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building</label>
          <select name="buildingId" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2">
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
          <select name="category" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2">
            {CATEGORIES.map((c) => <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
          <input name="amount" type="number" step="0.01" min="0" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
          <input name="expenseDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
        <textarea name="description" rows={2} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Receipt attachment</label>
        <input ref={fileRef} type="file" accept=".pdf,image/*" className="mt-1 text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReceipt(f); }} />
        {receiptUrl && <p className="mt-1 text-xs text-slate-500">Receipt attached.</p>}
      </div>
      <SubmitButton label="Save expense" />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50">
      {pending ? 'Saving…' : label}
    </button>
  );
}
