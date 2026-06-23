'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { createTenant, updateTenant } from '@/app/actions/tenants';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { TenantStatus } from '@prisma/client';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { FileText } from 'lucide-react';

type TenantFormProps = {
  units: { id: string; label: string }[];
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    address: string | null;
    nationalId: string | null;
    tinNumber: string | null;
    occupation: string | null;
    businessType: string | null;
    tenantStatus: TenantStatus;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    moveInDate: Date | null;
    moveOutDate: Date | null;
    idDocumentUrl: string | null;
    leaseAgreementUrl: string | null;
    licenseUrl: string | null;
    userId: string;
    unitId: string | null;
  };
  submitLabel: string;
};

const STATUSES: TenantStatus[] = ['ACTIVE', 'PENDING', 'VACATED', 'SUSPENDED'];

function toInputDate(d: Date | null): string {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

export function TenantForm({ units, tenant, submitLabel }: TenantFormProps) {
  const { t, labels } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [idDocUrl, setIdDocUrl] = useState(tenant?.idDocumentUrl ?? '');
  const [leaseUrl, setLeaseUrl] = useState(tenant?.leaseAgreementUrl ?? '');
  const [licenseUrl, setLicenseUrl] = useState(tenant?.licenseUrl ?? '');
  const [idDocName, setIdDocName] = useState<string | null>(
    tenant?.idDocumentUrl ? t('upload.existingId') : null
  );
  const [leaseName, setLeaseName] = useState<string | null>(
    tenant?.leaseAgreementUrl ? t('upload.existingLease') : null
  );
  const [licenseName, setLicenseName] = useState<string | null>(
    tenant?.licenseUrl ? t('upload.existingLicense') : null
  );

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.set('file', file);
    formData.set('type', 'tenant-doc');
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url;
  }

  return (
    <form
      action={async (fd) => {
        setError(null);
        if (idDocUrl) fd.set('idDocumentUrl', idDocUrl);
        if (leaseUrl) fd.set('leaseAgreementUrl', leaseUrl);
        if (licenseUrl) fd.set('licenseUrl', licenseUrl);
        if (tenant?.id) {
          await updateTenant(tenant.id, fd);
        } else {
          const result = await createTenant(fd);
          if (result && !result.success) setError(result.error);
        }
      }}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}
      {!tenant && (
        <>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('tenants.accountSection')}</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('tenants.accountSectionHint')}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('tenants.fullName')}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('common.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('common.phone')}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('tenants.temporaryPassword')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('tenants.temporaryPasswordHint')}</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.room')}</label>
            <select name="unitId" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
              <option value="">{t('tenants.selectRoom')}</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>
        </>
      )}
      {tenant && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-900/30">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('tenants.tenantInfo')}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('tenants.tenantInfoHint')}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('tenants.fullName')}
              </label>
              <input
                id="fullName"
                name="fullName"
                required
                defaultValue={tenant.fullName}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('common.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                readOnly
                value={tenant.email}
                className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('common.phone')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={tenant.phone ?? ''}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.address')}</label>
          <input name="address" defaultValue={tenant?.address ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenants.nationalId')}</label>
          <input name="nationalId" defaultValue={tenant?.nationalId ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenants.tinNumber')}</label>
          <input name="tinNumber" defaultValue={tenant?.tinNumber ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenants.occupation')}</label>
          <input name="occupation" defaultValue={tenant?.occupation ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenants.businessType')}</label>
          <input name="businessType" defaultValue={tenant?.businessType ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="e.g. Retail, Office" />
        </div>
        {tenant && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenants.tenantStatus')}</label>
            <select name="tenantStatus" defaultValue={tenant.tenantStatus} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{labels.tenantStatus[s]}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenants.emergencyContact')}</label>
          <input name="emergencyContact" defaultValue={tenant?.emergencyContact ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenants.emergencyPhone')}</label>
          <input name="emergencyPhone" defaultValue={tenant?.emergencyPhone ?? ''} type="tel" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenants.moveIn')}</label>
          <input name="moveInDate" type="date" defaultValue={toInputDate(tenant?.moveInDate ?? null)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenants.moveOut')}</label>
          <input name="moveOutDate" type="date" defaultValue={toInputDate(tenant?.moveOutDate ?? null)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-900/30">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-sky-500" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('tenants.tenantDocuments')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenants.tenantDocumentsHint')}</p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <FileUploadZone
            label={t('tenants.nationalIdDoc')}
            description={t('tenants.nationalIdDocHint')}
            accept=".pdf,image/jpeg,image/png,image/jpg"
            fileUrl={idDocUrl || null}
            fileName={idDocName}
            onUpload={async (file) => {
              const url = await uploadFile(file);
              setIdDocUrl(url);
              setIdDocName(file.name);
            }}
            onRemove={() => {
              setIdDocUrl('');
              setIdDocName(null);
            }}
          />
          <FileUploadZone
            label={t('tenants.leaseAgreement')}
            description={t('tenants.leaseAgreementHint')}
            accept=".pdf,image/jpeg,image/png,image/jpg"
            fileUrl={leaseUrl || null}
            fileName={leaseName}
            onUpload={async (file) => {
              const url = await uploadFile(file);
              setLeaseUrl(url);
              setLeaseName(file.name);
            }}
            onRemove={() => {
              setLeaseUrl('');
              setLeaseName(null);
            }}
          />
          <FileUploadZone
            label={t('tenants.license')}
            description={t('tenants.licenseHint')}
            accept=".pdf,image/jpeg,image/png,image/jpg"
            fileUrl={licenseUrl || null}
            fileName={licenseName}
            onUpload={async (file) => {
              const url = await uploadFile(file);
              setLicenseUrl(url);
              setLicenseName(file.name);
            }}
            onRemove={() => {
              setLicenseUrl('');
              setLicenseName(null);
            }}
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <Link href="/dashboard/tenants" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300">{t('common.cancel')}</Link>
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50">
      {pending ? t('common.saving') : label}
    </button>
  );
}
