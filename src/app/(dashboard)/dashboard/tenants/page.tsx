import Link from 'next/link';
import { getTenants } from '@/app/actions/tenants';
import { Plus } from 'lucide-react';

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tenants</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Tenant profiles and lease info</p>
        </div>
        <Link href="/dashboard/tenants/new" className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
          <Plus className="h-4 w-4" /> Add tenant
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {tenants.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No tenants yet. Assign a user to a unit to create a tenant profile.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Email / Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Business</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                    <Link href={`/dashboard/tenants/${t.id}`} className="hover:underline">
                      {t.user.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {t.user.email} {t.user.phone && `· ${t.user.phone}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {t.unit ? `${t.unit.building.name} – ${t.unit.unitNumber}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{t.businessType ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/dashboard/tenants/${t.id}`} className="text-sky-500 hover:underline">View</Link>
                    <span className="mx-2 text-slate-300">|</span>
                    <Link href={`/dashboard/tenants/${t.id}/edit`} className="text-sky-500 hover:underline">Edit</Link>
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
