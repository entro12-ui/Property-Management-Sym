import Link from 'next/link';
import type { TenantAlertItem } from '@/app/actions/tenant-portal';
import type { SmsNotificationLog } from '@prisma/client';
import { SMS_TYPE_LABELS, SMS_STATUS_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import { Bell, MessageSquare } from 'lucide-react';

const toneStyles = {
  info: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
  success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
  danger: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
};

const categoryLabels: Record<TenantAlertItem['category'], string> = {
  rent: 'Rent',
  payment_proof: 'Payment proof',
  sms: 'SMS',
  announcement: 'Announcement',
  maintenance: 'Maintenance',
};

type SmsLogRow = SmsNotificationLog & {
  invoice: {
    id: string;
    year: number;
    quarter: number | null;
    month: number | null;
    periodType: string;
  } | null;
};

export function TenantAlertsPanel({
  alerts,
  smsLogs,
}: {
  alerts: TenantAlertItem[];
  smsLogs: SmsLogRow[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Activity & alerts</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Rent reminders, payment proof updates, announcements, and maintenance status.
        </p>

        <div className="mt-5 space-y-3">
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
              You&apos;re all caught up. No new alerts right now.
            </div>
          ) : (
            alerts.map((alert) => {
              const content = (
                <div
                  className={`rounded-xl border p-4 transition ${toneStyles[alert.tone ?? 'info']} ${
                    alert.href ? 'hover:shadow-sm' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {categoryLabels[alert.category]}
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">{alert.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{alert.message}</p>
                    </div>
                    <time className="shrink-0 text-xs text-slate-500">{formatDate(alert.createdAt)}</time>
                  </div>
                </div>
              );

              return alert.href ? (
                <Link key={alert.id} href={alert.href} className="block">
                  {content}
                </Link>
              ) : (
                <div key={alert.id}>{content}</div>
              );
            })
          )}
        </div>
      </section>

      <section className="lg:col-span-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">SMS history</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Rent reminders and announcements sent to your phone.
        </p>

        <div className="mt-5 table-shell">
          {smsLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No SMS messages recorded yet.</div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {smsLogs.map((log) => (
                <li key={log.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {SMS_TYPE_LABELS[log.type]}
                    </p>
                    <span className="text-xs text-slate-500">{SMS_STATUS_LABELS[log.status]}</span>
                  </div>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{log.message}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(log.sentAt ?? log.createdAt)} · {log.phone}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
