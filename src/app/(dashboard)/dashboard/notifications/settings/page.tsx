import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { getSmsSettings } from '@/app/actions/sms-settings';
import { SmsSettingsForm } from '@/components/notifications/SmsSettingsForm';

export default async function SmsSettingsPage() {
  await requireRole(['SUPER_ADMIN', 'BUILDING_OWNER']);
  const settings = await getSmsSettings();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SMS Notification Settings</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Configure SMS Ethiopia for rent reminders and announcements
          </p>
        </div>
        <Link
          href="/dashboard/notifications"
          className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
        >
          ← Back to SMS logs
        </Link>
      </div>

      <div className="mt-6">
        <SmsSettingsForm settings={settings} />
      </div>
    </div>
  );
}
