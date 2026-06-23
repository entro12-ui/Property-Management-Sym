'use client';

import { useFormStatus } from 'react-dom';
import { updatePaymentProofStatus } from '@/app/actions/payment-proofs';
import {
  PAYMENT_PROOF_STATUS_LABELS,
  PAYMENT_PROOF_TYPE_LABELS,
} from '@/types';
import { formatDate } from '@/lib/utils';
import { isImageProof, isPdfProof } from '@/lib/upload-utils';
import { FilePreviewActions } from '@/components/ui/FilePreviewActions';
import type { ClientPaymentProof } from '@/lib/serialize-client';
import type { PaymentProofStatus } from '@prisma/client';

export function PaymentProofList({
  proofs,
  isAdmin,
}: {
  proofs: ClientPaymentProof[];
  isAdmin: boolean;
}) {
  if (proofs.length === 0) {
    return <p className="text-sm text-slate-500">No payment proof submitted yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {proofs.map((proof) => (
        <li
          key={proof.id}
          className="rounded-lg border border-slate-200 p-4 dark:border-slate-600 dark:bg-slate-900/20"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {PAYMENT_PROOF_TYPE_LABELS[proof.proofType as keyof typeof PAYMENT_PROOF_TYPE_LABELS]}
                {!proof.invoice && ' (general submission)'}
              </p>
              <p className="text-xs text-slate-500">
                Submitted {formatDate(proof.createdAt)} by {proof.submittedBy.fullName}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                proof.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : proof.status === 'REJECTED'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              }`}
            >
              {PAYMENT_PROOF_STATUS_LABELS[proof.status as PaymentProofStatus]}
            </span>
          </div>

          {proof.fileUrl && isImageProof(proof.fileName, proof.fileUrl) && (
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

          {proof.fileUrl && isPdfProof(proof.fileName, proof.fileUrl) && (
            <iframe
              src={proof.fileUrl}
              title={proof.fileName ?? 'Payment receipt PDF'}
              className="mt-3 h-64 w-full rounded-lg border border-slate-200 dark:border-slate-600"
            />
          )}

          <div className="mt-3 space-y-2 text-sm">
            {proof.fileUrl && (
              <FilePreviewActions fileUrl={proof.fileUrl} fileName={proof.fileName} />
            )}
            {proof.billingUrl && (
              <p>
                <a
                  href={proof.billingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sky-600 hover:underline"
                >
                  {proof.billingUrl}
                </a>
              </p>
            )}
            {proof.notes && <p className="text-slate-600 dark:text-slate-400">{proof.notes}</p>}
          </div>

          {isAdmin && proof.status === 'PENDING' && (
            <div className="mt-3 flex gap-2">
              <ReviewProofForm proofId={proof.id} status="APPROVED" label="Approve" variant="approve" />
              <ReviewProofForm proofId={proof.id} status="REJECTED" label="Reject" variant="reject" />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function ReviewProofForm({
  proofId,
  status,
  label,
  variant,
}: {
  proofId: string;
  status: 'APPROVED' | 'REJECTED';
  label: string;
  variant: 'approve' | 'reject';
}) {
  const action = updatePaymentProofStatus.bind(null, proofId, status);

  return (
    <form action={action}>
      <ReviewButton label={label} variant={variant} />
    </form>
  );
}

function ReviewButton({ label, variant }: { label: string; variant: 'approve' | 'reject' }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
        variant === 'approve'
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400'
      }`}
    >
      {pending ? '…' : label}
    </button>
  );
}
