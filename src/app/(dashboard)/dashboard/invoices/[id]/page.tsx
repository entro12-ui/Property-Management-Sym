import Link from 'next/link';
import { getInvoice } from '@/app/actions/invoices';
import { getAuthUser } from '@/lib/auth';
import { INVOICE_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { formatPeriodLabel } from '@/lib/billing-utils';
import { calculateLatePenalty, isOverdue } from '@/lib/invoice-utils';
import { RecordPaymentForm } from '@/components/payments/RecordPaymentForm';
import { TenantPaymentProofForm } from '@/components/invoices/TenantPaymentProofForm';
import { PaymentProofList } from '@/components/invoices/PaymentProofList';
import { MarkInvoiceSentButton } from '@/components/invoices/MarkInvoiceSentButton';
import { serializePaymentProofsForClient } from '@/lib/serialize-client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'];

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, user] = await Promise.all([getInvoice(id), getAuthUser()]);
  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  const isTenant = user?.role === 'TENANT';

  const totalPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const baseAmount = Number(invoice.amount);
  const dueDate = new Date(invoice.dueDate);
  const computedPenalty = isOverdue(dueDate) ? calculateLatePenalty(baseAmount, dueDate) : 0;
  const latePenalty = Math.max(Number(invoice.latePenalty), computedPenalty);
  const outstanding = Math.max(0, baseAmount + latePenalty - totalPaid);
  const paymentProofs = serializePaymentProofsForClient(invoice.paymentProofs);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Invoice {formatPeriodLabel(invoice)}
      </h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        {invoice.unit.building.name} – Room {invoice.unit.unitNumber}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-slate-500">Billing period</dt><dd>{invoice.periodType} – {formatPeriodLabel(invoice)}</dd></div>
            {invoice.periodStart && invoice.periodEnd && (
              <div><dt className="text-slate-500">Period</dt><dd>{formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}</dd></div>
            )}
            <div><dt className="text-slate-500">Due date</dt><dd>{formatDate(invoice.dueDate)}</dd></div>
            <div><dt className="text-slate-500">Amount</dt><dd>{formatCurrency(invoice.amount)}</dd></div>
            {latePenalty > 0 && <div><dt className="text-slate-500">Late penalty</dt><dd className="text-amber-600">{formatCurrency(latePenalty)}</dd></div>}
            <div><dt className="text-slate-500">Status</dt><dd>{INVOICE_STATUS_LABELS[invoice.status]}</dd></div>
            <div><dt className="text-slate-500">Total paid</dt><dd>{formatCurrency(totalPaid)}</dd></div>
            {outstanding > 0 && <div><dt className="text-slate-500">Outstanding</dt><dd className="text-amber-600">{formatCurrency(outstanding)}</dd></div>}
          </dl>
          {isAdmin && invoice.status === 'DRAFT' && (
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-600">
              <p className="mb-2 text-sm text-slate-500">
                This invoice is still a draft. Send it so the tenant can see it in My Invoices.
              </p>
              <MarkInvoiceSentButton invoiceId={id} />
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Record payment</h2>
            <RecordPaymentForm invoiceId={id} />
          </div>
        )}

        {isTenant && (
          <div className="rounded-xl border border-emerald-200 bg-white p-5 dark:border-emerald-800 dark:bg-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Upload payment proof</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Submit your rent payment receipt (image/PDF) or a billing URL after you pay.
            </p>
            <div className="mt-4">
              <TenantPaymentProofForm invoiceId={id} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Submitted payment proof</h2>
        <div className="mt-4">
          <PaymentProofList proofs={paymentProofs} isAdmin={!!isAdmin} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payment history</h2>
        {invoice.payments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No payments recorded yet.</p>
        ) : (
          <div className="mt-4 table-shell">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Receipt #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Recorded by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {invoice.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm">{formatDate(p.paidAt)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-sm">{PAYMENT_METHOD_LABELS[p.method]}</td>
                    <td className="px-4 py-3 text-sm">{p.receiptNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-sm">{p.recordedBy?.fullName ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/dashboard/invoices" className="text-sky-500 hover:underline">← Back to invoices</Link>
      </div>
    </div>
  );
}
