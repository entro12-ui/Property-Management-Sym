'use client';

import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { updateMyTenantProfile } from '@/app/actions/tenant-portal';
import { useLocale } from '@/components/providers/LocaleProvider';
import { floorLabel } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { formatQuarterlySchedule } from '@/lib/billing-utils';
import { AlertTriangle, Building2, Phone } from 'lucide-react';

type ProfileData = {
  emergencyContact: string | null;
  emergencyPhone: string | null;
  moveInDate: Date | null;
  moveOutDate: Date | null;
  user: { fullName: string; email: string; phone: string | null };
  unit: {
    unitNumber: string;
    floorNumber: number;
    rentAmount: number;
    leaseStart: Date | null;
    leaseEnd: Date | null;
    quarterlyRentDueDate: Date | null;
    building: {
      name: string;
      address: string;
      city: string;
      manager: { fullName: string; email: string; phone: string | null } | null;
    };
  } | null;
};

export function TenantProfileForm({ profile }: { profile: ProfileData }) {
  const { t } = useLocale();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const missingPhone = !profile.user.phone?.trim();

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        action={async (formData) => {
          const result = await updateMyTenantProfile(formData);
          if (result.success) {
            setMessage({ type: 'success', text: t('tenantPortal.profileSaved') });
          } else {
            setMessage({ type: 'error', text: result.error });
          }
        }}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 lg:col-span-3"
      >
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">{t('tenantPortal.contactSettings')}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('tenantPortal.contactSettingsHint')}</p>
        </div>

        {missingPhone && (
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{t('tenantPortal.phoneRequiredForSms')}</p>
          </div>
        )}

        {message && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('auth.fullName')}</label>
            <input
              readOnly
              value={profile.user.fullName}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.email')}</label>
            <input
              readOnly
              value={profile.user.email}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Phone className="h-3.5 w-3.5" />
              {t('common.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              defaultValue={profile.user.phone ?? ''}
              placeholder="+251 9XX XXX XXX"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500">{t('tenantPortal.phoneHint')}</p>
          </div>
          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('tenants.emergencyContact')}
            </label>
            <input
              id="emergencyContact"
              name="emergencyContact"
              defaultValue={profile.emergencyContact ?? ''}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="emergencyPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('tenants.emergencyPhone')}
            </label>
            <input
              id="emergencyPhone"
              name="emergencyPhone"
              type="tel"
              defaultValue={profile.emergencyPhone ?? ''}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        <SubmitButton label={t('tenantPortal.saveProfile')} />
      </form>

      <div className="space-y-6 lg:col-span-2">
        {profile.unit && (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Building2 className="h-4 w-4 text-sky-500" />
                {t('tenantPortal.leaseSummary')}
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label={t('common.building')} value={profile.unit.building.name} />
                <Row
                  label={t('common.room')}
                  value={`${profile.unit.unitNumber} (${floorLabel(profile.unit.floorNumber)})`}
                />
                <Row label={t('common.address')} value={`${profile.unit.building.address}, ${profile.unit.building.city}`} />
                <Row label={t('dashboard.monthlyRent')} value={formatCurrency(profile.unit.rentAmount)} />
                <Row label={t('tenants.moveIn')} value={profile.moveInDate ? formatDate(profile.moveInDate) : '—'} />
                <Row
                  label={t('tenantPortal.leaseStart')}
                  value={profile.unit.leaseStart ? formatDate(profile.unit.leaseStart) : '—'}
                />
                <Row
                  label={t('tenantPortal.leaseEnd')}
                  value={profile.unit.leaseEnd ? formatDate(profile.unit.leaseEnd) : '—'}
                />
                {profile.unit.quarterlyRentDueDate && (
                  <>
                    <Row
                      label={t('tenantPortal.quarterlyDue')}
                      value={formatDate(profile.unit.quarterlyRentDueDate)}
                    />
                    <Row
                      label={t('tenantPortal.upcomingDueDates')}
                      value={formatQuarterlySchedule(new Date(profile.unit.quarterlyRentDueDate))}
                    />
                  </>
                )}
              </dl>
            </div>

            {profile.unit.building.manager && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-800 dark:bg-sky-900/20">
                <h3 className="font-semibold text-sky-900 dark:text-sky-100">{t('tenantPortal.propertyContact')}</h3>
                <p className="mt-2 text-sm text-sky-800 dark:text-sky-200">{profile.unit.building.manager.fullName}</p>
                <p className="text-sm text-sky-700 dark:text-sky-300">{profile.unit.building.manager.email}</p>
                {profile.unit.building.manager.phone && (
                  <p className="text-sm text-sky-700 dark:text-sky-300">{profile.unit.building.manager.phone}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
    >
      {pending ? 'Saving…' : label}
    </button>
  );
}
