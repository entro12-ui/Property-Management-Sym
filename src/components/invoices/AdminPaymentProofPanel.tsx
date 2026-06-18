import Link from 'next/link';
import { PaymentProofAdminReview } from '@/components/invoices/PaymentProofAdminReview';
import { LinkProofToInvoiceForm } from '@/components/invoices/LinkProofToInvoiceForm';
import { formatPeriodLabel } from '@/lib/billing-utils';
import type { ClientPaymentProof } from '@/lib/serialize-client';

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

export function AdminPaymentProofPanel({
  proofs,
  invoices,
}: {
  proofs: ClientPaymentProof[];
  invoices: LinkableInvoice[];
}) {
  const pending = proofs.filter((p) => p.status === 'PENDING');

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-white p-6 dark:border-amber-800/50 dark:bg-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Payment proof review
            {pending.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                {pending.length} pending
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Receipt details are extracted automatically (amount, payer, date, transaction ID). Review them, then approve to record income and payment.
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No payment proofs waiting for review.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {pending.map((proof) => {
            const tenantName = proof.tenant?.user.fullName ?? proof.submittedBy.fullName;
            const room = proof.tenant?.unit
              ? `${proof.tenant.unit.building.name} – Room ${proof.tenant.unit.unitNumber}`
              : 'No unit assigned';

            return (
              <li
                key={proof.id}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-600"
              >
                <div className="mb-3">
                  <p className="font-medium text-slate-900 dark:text-white">{tenantName}</p>
                  <p className="text-sm text-slate-500">{room}</p>
                  {proof.tenant?.user.email && (
                    <p className="text-xs text-slate-400">{proof.tenant.user.email}</p>
                  )}
                  {proof.invoice ? (
                    <p className="mt-1 text-sm text-sky-600">
                      Linked to {formatPeriodLabel(proof.invoice)} ·{' '}
                      <Link href={`/dashboard/invoices/${proof.invoice.id}`} className="hover:underline">
                        View invoice
                      </Link>
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-amber-600">
                      General submission — link to an invoice before approving
                    </p>
                  )}
                </div>

                <PaymentProofAdminReview proof={proof} />

                {!proof.invoiceId && (
                  <LinkProofToInvoiceForm
                    proofId={proof.id}
                    tenantId={proof.tenantId!}
                    invoices={invoices}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
