'use client';

import { useFormStatus } from 'react-dom';
import {
  approvePaymentProof,
  rejectPaymentProof,
  reExtractPaymentProof,
  updateProofExtraction,
} from '@/app/actions/payment-proofs';
import {
  PAYMENT_PROOF_STATUS_LABELS,
  PAYMENT_PROOF_TYPE_LABELS,
} from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { isImageProofUrl, isPdfProofUrl } from '@/lib/upload-utils';
import { FilePreviewActions } from '@/components/ui/FilePreviewActions';
import type { ClientPaymentProof } from '@/lib/serialize-client';

export function PaymentProofAdminReview({ proof }: { proof: ClientPaymentProof }) {
  const canApprove = proof.extractedAmount != null && proof.extractedAmount > 0;
  const scanLabel = proof.extractedAmount != null ? 'Re-scan receipt' : 'Scan receipt';

  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-600 dark:bg-slate-900/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            {PAYMENT_PROOF_TYPE_LABELS[proof.proofType as keyof typeof PAYMENT_PROOF_TYPE_LABELS]}
          </p>
          <p className="text-xs text-slate-500">
            Submitted {formatDate(proof.createdAt)} by {proof.submittedBy.fullName}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          {PAYMENT_PROOF_STATUS_LABELS.PENDING}
        </span>
      </div>

      {proof.fileUrl && isImageProofUrl(proof.fileUrl) && (
        <div className="mt-3">
          <a href={proof.fileUrl} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proof.fileUrl}
              alt={proof.fileName ?? 'Payment receipt'}
              className="max-h-48 rounded-lg border border-slate-200 object-contain dark:border-slate-600"
            />
          </a>
        </div>
      )}

      {proof.fileUrl && isPdfProofUrl(proof.fileUrl) && (
        <iframe
          src={proof.fileUrl}
          title={proof.fileName ?? 'Payment receipt PDF'}
          className="mt-3 h-64 w-full rounded-lg border border-slate-200 dark:border-slate-600"
        />
      )}

      {proof.fileUrl && (
        <div className="mt-3">
          <FilePreviewActions fileUrl={proof.fileUrl} fileName={proof.fileName} />
        </div>
      )}

      <ExtractedDetails proof={proof} />

      <ExtractionEditForm proof={proof} />

      <div className="mt-3 flex flex-wrap gap-2">
        <form action={reExtractPaymentProof.bind(null, proof.id)}>
          <PendingSubmitButton
            idleLabel={scanLabel}
            pendingLabel="Scanning…"
            className="rounded-lg border border-sky-300 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-50 dark:border-sky-700 dark:text-sky-300"
          />
        </form>
        {canApprove ? (
          <form action={approvePaymentProof.bind(null, proof.id)}>
            <PendingSubmitButton
              idleLabel="Approve & record income"
              pendingLabel="Approving…"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            />
          </form>
        ) : (
          <p className="text-xs text-amber-600 self-center">
            Extract or enter the payment amount before approving.
          </p>
        )}
        <form action={rejectPaymentProof.bind(null, proof.id)}>
          <PendingSubmitButton
            idleLabel="Reject"
            pendingLabel="…"
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400"
          />
        </form>
      </div>
    </div>
  );
}

function ExtractedDetails({ proof }: { proof: ClientPaymentProof }) {
  if (proof.extractionStatus === 'PENDING' || proof.extractionStatus === null) {
    return (
      <p className="mt-3 text-sm text-slate-500">
        Click <strong>Scan receipt</strong> to extract amount, payer name, payment date, and transaction ID.
        You can also enter details manually below.
      </p>
    );
  }

  if (proof.extractionStatus === 'FAILED' && !proof.extractedAmount) {
    return (
      <p className="mt-3 text-sm text-amber-600">
        Automatic extraction failed. Use Re-scan receipt or enter details manually below.
      </p>
    );
  }

  return (
    <dl className="mt-3 grid gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900/40 sm:grid-cols-2">
      <div>
        <dt className="text-xs font-medium uppercase text-slate-500">Amount debited</dt>
        <dd className="font-semibold text-slate-900 dark:text-white">
          {proof.extractedAmount != null ? formatCurrency(proof.extractedAmount) : '—'}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase text-slate-500">Payer name</dt>
        <dd className="text-slate-900 dark:text-white">{proof.extractedPayerName ?? '—'}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase text-slate-500">Payment date</dt>
        <dd className="text-slate-900 dark:text-white">
          {proof.extractedPaymentDate ? formatDate(proof.extractedPaymentDate) : '—'}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase text-slate-500">Transaction ID</dt>
        <dd className="font-mono text-slate-900 dark:text-white">
          {proof.extractedTransactionId ?? '—'}
        </dd>
      </div>
    </dl>
  );
}

function ExtractionEditForm({ proof }: { proof: ClientPaymentProof }) {
  return (
    <form action={updateProofExtraction} className="mt-3 space-y-2 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-600">
      <input type="hidden" name="proofId" value={proof.id} />
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Edit extracted details</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          name="extractedAmount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={proof.extractedAmount ?? ''}
          placeholder="Amount (ETB)"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
        <input
          name="extractedPayerName"
          type="text"
          defaultValue={proof.extractedPayerName ?? ''}
          placeholder="Payer name"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
        <input
          name="extractedPaymentDate"
          type="date"
          defaultValue={proof.extractedPaymentDate ?? ''}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
        <input
          name="extractedTransactionId"
          type="text"
          defaultValue={proof.extractedTransactionId ?? ''}
          placeholder="Transaction ID"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>
      <PendingSubmitButton
        idleLabel="Save details"
        pendingLabel="Saving…"
        className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      />
    </form>
  );
}

function PendingSubmitButton({
  idleLabel,
  pendingLabel,
  className,
}: {
  idleLabel: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
