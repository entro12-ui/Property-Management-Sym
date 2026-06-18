'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitPaymentProof } from '@/app/actions/payment-proofs';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { uploadPaymentProofFile } from '@/lib/client-upload';
import { PAYMENT_PROOF_ACCEPT } from '@/lib/upload-utils';

type TenantPaymentProofFormProps = {
  invoiceId: string;
};

export function TenantPaymentProofForm({ invoiceId }: TenantPaymentProofFormProps) {
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
      action={async (formData) => {
        setError(null);
        setSuccess(false);

        formData.set('invoiceId', invoiceId);
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
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <input type="hidden" name="proofMode" value={proofMode} />
      {fileUrl && <input type="hidden" name="fileUrl" value={fileUrl} />}
      {fileName && <input type="hidden" name="fileName" value={fileName} />}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setProofMode('file')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            proofMode === 'file'
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          Upload image / PDF
        </button>
        <button
          type="button"
          onClick={() => setProofMode('url')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            proofMode === 'url'
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          Billing URL
        </button>
      </div>

      {proofMode === 'file' ? (
        <FileUploadZone
          label="Payment receipt or invoice"
          description="Upload a photo or PDF of your rent payment confirmation (e.g. CBE mobile banking screenshot)."
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
          <p className="mt-1 text-xs text-slate-500">
            Paste a link to your mobile banking receipt, payment portal, or online billing page.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Paid via CBE mobile banking on June 18"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Payment proof submitted. Management will review it shortly.</p>}

      <SubmitButton />
    </form>
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
