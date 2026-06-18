import { requireRole } from '@/lib/auth';
import { getSmsLogs } from '@/app/actions/financial';
import { SMS_TYPE_LABELS, SMS_STATUS_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function NotificationsPage() {
  const user = await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT']);
  const logs = await getSmsLogs(100);
  const canManageSettings = user.role === 'SUPER_ADMIN' || user.role === 'BUILDING_OWNER';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SMS Notification Logs</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Automated rent reminders (15 days, 7 days, due date, overdue) and announcement delivery history
          </p>
        </div>
        {canManageSettings && (
          <Link
            href="/dashboard/notifications/settings"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            SMS settings
          </Link>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-200">
        <p className="font-medium">Automated reminders</p>
        <p className="mt-1">Run daily via cron: <code className="rounded bg-sky-100 px-1 dark:bg-sky-900">POST /api/cron/reminders</code> with <code className="rounded bg-sky-100 px-1 dark:bg-sky-900">Authorization: Bearer $CRON_SECRET</code></p>
        <p className="mt-1">Configure SMS Ethiopia in <Link href="/dashboard/notifications/settings" className="font-medium underline">SMS settings</Link> (or via environment variables).</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No SMS notifications sent yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Sent</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{log.sentAt ? formatDate(log.sentAt) : formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3 text-sm">{log.tenant?.user.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{log.phone}</td>
                  <td className="px-4 py-3 text-sm">{SMS_TYPE_LABELS[log.type]}</td>
                  <td className="px-4 py-3 text-sm">{SMS_STATUS_LABELS[log.status]}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-500">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
