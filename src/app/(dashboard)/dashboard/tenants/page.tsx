import Link from 'next/link';
import { getTenants } from '@/app/actions/tenants';
import { getServerI18n } from '@/i18n/server';
import { Plus } from 'lucide-react';

export default async function TenantsPage() {
  const { t, labels } = await getServerI18n();
  const tenants = await getTenants();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('tenants.title')}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{t('tenants.subtitle')}</p>
        </div>
        <Link href="/dashboard/tenants/new" className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
          <Plus className="h-4 w-4" /> {t('tenants.addTenant')}
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {tenants.length === 0 ? (
          <div className="p-12 text-center text-slate-500">{t('tenants.noTenants')}</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('common.name')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('common.email')} / {t('common.phone')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('common.status')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('common.room')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('tenants.documentsCol')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                    <Link href={`/dashboard/tenants/${tenant.id}`} className="hover:underline">
                      {tenant.user.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {tenant.user.email} {tenant.user.phone && `· ${tenant.user.phone}`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">{labels.tenantStatus[tenant.tenantStatus]}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {tenant.unit ? `${t('common.room')} ${tenant.unit.unitNumber} – ${tenant.unit.building.name}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {tenant._count.documents > 0 ? (
                      <Link href={`/dashboard/tenants/${tenant.id}#documents`} className="text-sky-500 hover:underline">
                        {tenant._count.documents} {tenant._count.documents === 1 ? t('tenants.file') : t('tenants.files')}
                      </Link>
                    ) : (
                      <Link href={`/dashboard/tenants/${tenant.id}#documents`} className="text-slate-400 hover:text-sky-500 hover:underline">
                        {t('tenants.uploadDoc')}
                      </Link>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/dashboard/tenants/${tenant.id}`} className="text-sky-500 hover:underline">{t('common.view')}</Link>
                    <span className="mx-2 text-slate-300">|</span>
                    <Link href={`/dashboard/tenants/${tenant.id}/edit`} className="text-sky-500 hover:underline">{t('common.edit')}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
