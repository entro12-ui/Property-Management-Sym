'use client';

import { useFormStatus } from 'react-dom';
import { linkPaymentProofToInvoice } from '@/app/actions/payment-proofs';
import { formatPeriodLabel } from '@/lib/billing-utils';
import { formatCurrency } from '@/lib/utils';

type LinkableInvoice = {
  id: string;
  year: number;
  quarter: number | null;
  month: number | null;
  periodType: 'MONTHLY' | 'QUARTERLY';
  amount: number;
  tenantId: string | null;
  unit: { unitNumber: string; tenant?: { id: string } | null };
};

export function LinkProofToInvoiceForm({
  proofId,
  tenantId,
  invoices,
}: {
  proofId: string;
  tenantId: string;
  invoices: LinkableInvoice[];
}) {
  const options = invoices.filter(
    (inv) => inv.tenantId === tenantId || inv.unit.tenant?.id === tenantId
  );

  if (options.length === 0) {
    return (
      <p className="text-xs text-amber-600">
        No invoice found for this tenant. Create or send an invoice first.
      </p>
    );
  }

  return (
    <form action={linkPaymentProofToInvoice} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="proofId" value={proofId} />
      <div className="min-w-[200px] flex-1">
        <label htmlFor={`link-invoice-${proofId}`} className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Link to invoice
        </label>
        <select
          id={`link-invoice-${proofId}`}
          name="invoiceId"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          <option value="" disabled>
            Select invoice…
          </option>
          {options.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {formatPeriodLabel(inv)} – Room {inv.unit.unitNumber} ({formatCurrency(inv.amount)})
            </option>
          ))}
        </select>
      </div>
      <LinkButton />
    </form>
  );
}

function LinkButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
    >
      {pending ? 'Linking…' : 'Link'}
    </button>
  );
}
