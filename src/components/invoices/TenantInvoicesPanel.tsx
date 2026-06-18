'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { submitPaymentProof } from '@/app/actions/payment-proofs';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { PaymentProofList } from '@/components/invoices/PaymentProofList';
import { uploadPaymentProofFile } from '@/lib/client-upload';
import { PAYMENT_PROOF_ACCEPT } from '@/lib/upload-utils';
import { formatCurrency } from '@/lib/utils';
import { formatPeriodLabel } from '@/lib/billing-utils';
import { INVOICE_STATUS_LABELS, PAYMENT_PROOF_STATUS_LABELS } from '@/types';
import type { ClientPaymentProof } from '@/lib/serialize-client';
import type { InvoiceStatus } from '@prisma/client';

type TenantInvoice = {
  id: string;
  year: number;
  quarter: number | null;
  month: number | null;
  periodType: 'MONTHLY' | 'QUARTERLY';
  dueDate: Date;
  amount: { toString(): string } | number;
  status: InvoiceStatus;
  unit: { unitNumber: string; building: { name: string } };
  payments: { amount: { toString(): string } | number }[];
  paymentProofs: { id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }[];
};

type TenantInvoicesPanelProps = {
  invoices: TenantInvoice[];
  submittedProofs: ClientPaymentProof[];
  activeFilter?: string;
};

export function TenantInvoicesPanel({ invoices, submittedProofs, activeFilter }: TenantInvoicesPanelProps) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id ?? '');

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upload payment receipt</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload your bank receipt or mobile money screenshot (JPG, PNG, or PDF), such as a CBE mobile banking confirmation.
        </p>

        {invoices.length > 0 ? (
          <div className="mt-4">
            <label htmlFor="invoiceSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Link to invoice (optional)
            </label>
            <select
              id="invoiceSelect"
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="">General rent payment (no invoice selected)</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {formatPeriodLabel(inv)} – {formatCurrency(inv.amount)} ({INVOICE_STATUS_LABELS[inv.status]})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            No rent invoice has been issued yet. You can still submit your payment proof below and management will match it to your account.
          </p>
        )}

        <div className="mt-4">
          <PaymentProofUploadForm invoiceId={selectedInvoiceId || undefined} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white">Your submitted proofs</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Receipts you have uploaded for review.
        </p>
        <div className="mt-4">
          <PaymentProofList proofs={submittedProofs} isAdmin={false} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Your rent invoices</h2>
          {activeFilter && (
            <p className="mt-1 text-xs text-slate-500">
              Filtered by {INVOICE_STATUS_LABELS[activeFilter as InvoiceStatus] ?? activeFilter}.{' '}
              <Link href="/dashboard/invoices" className="text-sky-600 hover:underline">Show all</Link>
            </p>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            {activeFilter
              ? `No ${INVOICE_STATUS_LABELS[activeFilter as InvoiceStatus]?.toLowerCase() ?? activeFilter} invoices.`
              : 'No rent invoices issued yet. Use the upload form above after you pay rent.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {invoices.map((inv) => {
              const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
              const balance = Math.max(0, Number(inv.amount) - paid);
              const pendingProof = inv.paymentProofs.find((p) => p.status === 'PENDING');
              const approvedProof = inv.paymentProofs.some((p) => p.status === 'APPROVED');

              return (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{formatPeriodLabel(inv)}</p>
                    <p className="text-sm text-slate-500">
                      {inv.unit.building.name} – Room {inv.unit.unitNumber} · Due {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-sm">
                      {formatCurrency(inv.amount)}
                      {balance > 0 && inv.status !== 'PAID' && (
                        <span className="ml-2 text-amber-600">({formatCurrency(balance)} due)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {INVOICE_STATUS_LABELS[inv.status]}
                    </span>
                    {approvedProof ? (
                      <span className="text-xs font-medium text-emerald-600">Proof approved</span>
                    ) : pendingProof ? (
                      <span className="text-xs font-medium text-amber-600">{PAYMENT_PROOF_STATUS_LABELS.PENDING}</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInvoiceId(inv.id);
                        document.getElementById('tenant-upload-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="rounded-lg border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                    >
                      Upload receipt
                    </button>
                    <Link href={`/dashboard/invoices/${inv.id}`} className="text-sm text-sky-600 hover:underline">
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentProofUploadForm({ invoiceId }: { invoiceId?: string }) {
  const [proofMode, setProofMode] = useState<'file' | 'url'>('file');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [billingUrl, setBillingUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleUpload(file: File) {
    const data = await uploadPaymentProofFile(file);
    setFileUrl(data.url);
    setFileName(data.fileName);
    setSuccess(false);
    setError(null);
  }

  return (
    <form
      id="tenant-upload-section"
      action={async (formData) => {
        setError(null);
        setSuccess(false);

        if (invoiceId) formData.set('invoiceId', invoiceId);
        formData.set('proofMode', proofMode);
        if (proofMode === 'file') {
          if (!fileUrl) {
            setError('Please upload a receipt image or PDF first.');
            return;
          }
          formData.set('fileUrl', fileUrl);
          formData.set('fileName', fileName ?? '');
        } else {
          formData.set('billingUrl', billingUrl);
        }
        formData.set('notes', notes);

        const result = await submitPaymentProof(formData);
        if (!result.success) {
          setError(result.error);
          return;
        }

        setSuccess(true);
        setFileUrl(null);
        setFileName(null);
        setBillingUrl('');
        setNotes('');
      }}
      className="space-y-4"
    >
      <input type="hidden" name="proofMode" value={proofMode} />
      {invoiceId && <input type="hidden" name="invoiceId" value={invoiceId} />}
      {fileUrl && <input type="hidden" name="fileUrl" value={fileUrl} />}
      {fileName && <input type="hidden" name="fileName" value={fileName} />}

      <div className="flex flex-wrap gap-2">
        <ModeButton active={proofMode === 'file'} onClick={() => setProofMode('file')} label="Upload image / PDF" />
        <ModeButton active={proofMode === 'url'} onClick={() => setProofMode('url')} label="Billing URL" />
      </div>

      {proofMode === 'file' ? (
        <FileUploadZone
          label="Payment receipt or invoice"
          description="Photo or PDF from your bank or mobile money app (e.g. CBE receipt screenshot)."
          accept={PAYMENT_PROOF_ACCEPT}
          fileUrl={fileUrl}
          fileName={fileName}
          onUpload={handleUpload}
          onRemove={() => {
            setFileUrl(null);
            setFileName(null);
          }}
        />
      ) : (
        <div>
          <label htmlFor="billingUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Billing or payment link
          </label>
          <input
            id="billingUrl"
            name="billingUrl"
            type="url"
            value={billingUrl}
            onChange={(e) => setBillingUrl(e.target.value)}
            placeholder="https://bank.example.com/receipt/..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>
      )}

      <div>
        <label htmlFor="proofNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes (optional)
        </label>
        <textarea
          id="proofNotes"
          name="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Paid via CBE mobile banking"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-600">Payment proof submitted successfully. Management will review it.</p>
      )}

      <SubmitButton />
    </form>
  );
}

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        active
          ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {pending ? 'Submitting…' : 'Submit payment proof'}
    </button>
  );
}
