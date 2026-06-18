'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { submitPaymentProof } from '@/app/actions/payment-proofs';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { PaymentProofList } from '@/components/invoices/PaymentProofList';
import { uploadPaymentProofFile } from '@/lib/client-upload';
import { PAYMENT_PROOF_ACCEPT } from '@/lib/upload-utils';
import { formatCurrency } from '@/lib/utils';
import { formatInvoiceLabel } from '@/lib/billing-utils';
import { INVOICE_STATUS_LABELS, INVOICE_CATEGORY_LABELS, PAYMENT_PROOF_STATUS_LABELS } from '@/types';
import type { ClientPaymentProof } from '@/lib/serialize-client';
import type { InvoiceStatus, InvoiceCategory } from '@prisma/client';
import { Droplets, Home, Zap } from 'lucide-react';

type TenantInvoice = {
  id: string;
  year: number;
  quarter: number | null;
  month: number | null;
  periodType: 'MONTHLY' | 'QUARTERLY';
  category?: InvoiceCategory;
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
  activeStatusFilter?: string;
  activeCategoryFilter?: string;
};

const CATEGORY_ORDER: InvoiceCategory[] = ['RENT', 'ELECTRICITY', 'WATER'];

const CATEGORY_STYLES: Record<InvoiceCategory, string> = {
  RENT: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  ELECTRICITY: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  WATER: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
};

const CATEGORY_ICONS: Record<InvoiceCategory, typeof Home> = {
  RENT: Home,
  ELECTRICITY: Zap,
  WATER: Droplets,
};

function invoiceCategory(inv: TenantInvoice): InvoiceCategory {
  return inv.category ?? 'RENT';
}

export function TenantInvoicesPanel({
  invoices,
  submittedProofs,
  activeStatusFilter,
  activeCategoryFilter,
}: TenantInvoicesPanelProps) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id ?? '');

  const groupedInvoices = useMemo(() => {
    if (activeCategoryFilter) {
      return [{ category: activeCategoryFilter as InvoiceCategory, items: invoices }];
    }
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: invoices.filter((inv) => invoiceCategory(inv) === category),
    })).filter((group) => group.items.length > 0);
  }, [invoices, activeCategoryFilter]);

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upload payment receipt</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload proof for rent, electricity, or water bills — bank receipt, mobile money screenshot (JPG, PNG, PDF),
          or a billing link.
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
              className="mt-1 w-full max-w-lg rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="">General payment (no invoice selected)</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  [{INVOICE_CATEGORY_LABELS[invoiceCategory(inv)]}] {formatInvoiceLabel(inv)} –{' '}
                  {formatCurrency(inv.amount)} ({INVOICE_STATUS_LABELS[inv.status]})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            No invoices have been issued yet. You can still submit your payment proof below and management will match
            it to your account.
          </p>
        )}

        <div className="mt-4">
          <PaymentProofUploadForm invoiceId={selectedInvoiceId || undefined} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white">Your submitted proofs</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Receipts you have uploaded for review.</p>
        <div className="mt-4">
          <PaymentProofList proofs={submittedProofs} isAdmin={false} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Your invoices</h2>
          {(activeStatusFilter || activeCategoryFilter) && (
            <p className="mt-1 text-xs text-slate-500">
              {activeCategoryFilter && (
                <span>{INVOICE_CATEGORY_LABELS[activeCategoryFilter as InvoiceCategory]} · </span>
              )}
              {activeStatusFilter && (
                <span>{INVOICE_STATUS_LABELS[activeStatusFilter as InvoiceStatus]} · </span>
              )}
              <Link href="/dashboard/invoices" className="text-sky-600 hover:underline">
                Clear filters
              </Link>
            </p>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            {activeStatusFilter || activeCategoryFilter
              ? 'No invoices match your filters.'
              : 'No invoices issued yet. Use the upload form above after you make a payment.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {groupedInvoices.map(({ category, items }) => {
              const Icon = CATEGORY_ICONS[category];
              return (
                <div key={category}>
                  {!activeCategoryFilter && groupedInvoices.length > 1 && (
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 dark:bg-slate-700/40">
                      <Icon className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        {INVOICE_CATEGORY_LABELS[category]}
                      </span>
                    </div>
                  )}
                  {items.map((inv) => (
                    <InvoiceRow
                      key={inv.id}
                      inv={inv}
                      onUpload={() => {
                        setSelectedInvoiceId(inv.id);
                        document.getElementById('tenant-upload-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceRow({ inv, onUpload }: { inv: TenantInvoice; onUpload: () => void }) {
  const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
  const balance = Math.max(0, Number(inv.amount) - paid);
  const pendingProof = inv.paymentProofs.find((p) => p.status === 'PENDING');
  const approvedProof = inv.paymentProofs.some((p) => p.status === 'APPROVED');
  const category = invoiceCategory(inv);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}>
            {INVOICE_CATEGORY_LABELS[category]}
          </span>
          <p className="font-medium text-slate-900 dark:text-white">{formatInvoiceLabel(inv)}</p>
        </div>
        <p className="mt-1 text-sm text-slate-500">
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
          onClick={onUpload}
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
          placeholder="e.g. Electricity bill for March, paid via CBE mobile banking"
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
