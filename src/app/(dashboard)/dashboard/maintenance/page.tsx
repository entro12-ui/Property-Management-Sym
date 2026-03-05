import Link from 'next/link';
import { getMaintenanceRequests } from '@/app/actions/maintenance';
import { MAINTENANCE_STATUS_LABELS, URGENCY_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';
import type { MaintenanceStatus } from '@prisma/client';

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const requests = await getMaintenanceRequests(
    status ? { status: status as MaintenanceStatus } : undefined
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Requests and status</p>
        </div>
        <Link
          href="/dashboard/maintenance/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          <Plus className="h-4 w-4" /> New request
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        <Link href="/dashboard/maintenance" className={`rounded-lg px-3 py-1.5 text-sm ${!status ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'}`}>
          All
        </Link>
        {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as MaintenanceStatus[]).map((s) => (
          <Link key={s} href={`/dashboard/maintenance?status=${s}`} className={`rounded-lg px-3 py-1.5 text-sm ${status === s ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'}`}>
            {MAINTENANCE_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No maintenance requests.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Title / Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Urgency</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Requested</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/maintenance/${r.id}`} className="font-medium text-slate-900 dark:text-white hover:underline">{r.title}</Link>
                    <p className="text-xs text-slate-500">{r.unit.building.name} – Unit {r.unit.unitNumber}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{URGENCY_LABELS[r.urgency]}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{MAINTENANCE_STATUS_LABELS[r.status]}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatDate(r.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/dashboard/maintenance/${r.id}`} className="text-sky-500 hover:underline">View</Link>
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
