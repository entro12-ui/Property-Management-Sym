'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';

type TenantFormProps = {
  users: { id: string; fullName: string; email: string }[];
  units: { id: string; label: string }[];
  tenant?: {
    businessType: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    moveInDate: Date | null;
    moveOutDate: Date | null;
    idDocumentUrl: string | null;
    leaseAgreementUrl: string | null;
    userId: string;
    unitId: string | null;
  };
  action: (formData: FormData) => void;
  submitLabel: string;
};

function toInputDate(d: Date | null): string {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

export function TenantForm({ users, units, tenant, action, submitLabel }: TenantFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [idDocUrl, setIdDocUrl] = useState(tenant?.idDocumentUrl ?? '');
  const [leaseUrl, setLeaseUrl] = useState(tenant?.leaseAgreementUrl ?? '');

  async function handleFileUpload(field: 'idDocumentUrl' | 'leaseAgreementUrl', file: File) {
    const formData = new FormData();
    formData.set('file', file);
    formData.set('type', 'tenant-doc');
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) return;
    const { url } = await res.json();
    if (field === 'idDocumentUrl') setIdDocUrl(url);
    else setLeaseUrl(url);
  }

  return (
    <form
      ref={formRef}
      action={(fd) => {
        if (idDocUrl) fd.set('idDocumentUrl', idDocUrl);
        if (leaseUrl) fd.set('leaseAgreementUrl', leaseUrl);
        action(fd);
      }}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      {!tenant && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">User</label>
            <select name="userId" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unit</label>
            <select name="unitId" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
              <option value="">Select unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Business type</label>
        <input name="businessType" defaultValue={tenant?.businessType ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="e.g. Retail, Office" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Emergency contact</label>
          <input name="emergencyContact" defaultValue={tenant?.emergencyContact ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Emergency phone</label>
          <input name="emergencyPhone" defaultValue={tenant?.emergencyPhone ?? ''} type="tel" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Move-in date</label>
          <input name="moveInDate" type="date" defaultValue={toInputDate(tenant?.moveInDate ?? null)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Move-out date</label>
          <input name="moveOutDate" type="date" defaultValue={toInputDate(tenant?.moveOutDate ?? null)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ID / License (upload PDF or image)</label>
        <input type="file" accept=".pdf,image/*" className="mt-1 text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload('idDocumentUrl', f); }} />
        {idDocUrl && <p className="mt-1 text-xs text-slate-500">Uploaded. <a href={idDocUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500">View</a></p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lease agreement (upload PDF)</label>
        <input type="file" accept=".pdf" className="mt-1 text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload('leaseAgreementUrl', f); }} />
        {leaseUrl && <p className="mt-1 text-xs text-slate-500">Uploaded. <a href={leaseUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500">View</a></p>}
      </div>
      <div className="flex gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <Link href="/dashboard/tenants" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300">Cancel</Link>
      </div>
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
