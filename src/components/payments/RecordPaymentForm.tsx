'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { recordPayment } from '@/app/actions/payments';
import { PAYMENT_METHOD_LABELS } from '@/types';
import type { PaymentMethod } from '@prisma/client';

const METHODS: PaymentMethod[] = ['CASH', 'BANK', 'MOBILE_MONEY', 'CARD', 'OTHER'];

export function RecordPaymentForm({ invoiceId }: { invoiceId: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const [receiptUrl, setReceiptUrl] = useState('');

  async function handleReceiptUpload(file: File) {
    const formData = new FormData();
    formData.set('file', file);
    formData.set('type', 'receipt');
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) return;
    const { url } = await res.json();
    setReceiptUrl(url);
  }

  return (
    <form action={recordPayment} className="mt-3 space-y-3">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      {receiptUrl && <input type="hidden" name="receiptUrl" value={receiptUrl} />}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
        <input id="amount" name="amount" type="number" step="0.01" min={0.01} required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
      </div>
      <div>
        <label htmlFor="method" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Method</label>
        <select id="method" name="method" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
          {METHODS.map((m) => (
            <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="paidAt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment date</label>
        <input id="paidAt" name="paidAt" type="date" defaultValue={today} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload receipt (optional)</label>
        <input type="file" accept=".pdf,image/*" className="mt-1 text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReceiptUpload(f); }} />
        {receiptUrl && <p className="mt-1 text-xs text-slate-500">Attached. <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500">View</a></p>}
      </div>
      <div>
        <label htmlFor="receiptNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Receipt number</label>
        <input id="receiptNumber" name="receiptNumber" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="RCP-001" />
      </div>
      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reference</label>
        <input id="reference" name="reference" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="Transaction ID, receipt #" />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50">
      {pending ? 'Recording…' : 'Record payment'}
    </button>
  );
}
