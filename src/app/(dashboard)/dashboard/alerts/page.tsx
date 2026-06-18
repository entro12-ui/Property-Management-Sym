import { getMyAlerts, getMySmsLogs } from '@/app/actions/tenant-portal';
import { TenantAlertsPanel } from '@/components/tenant/TenantAlertsPanel';

export default async function TenantAlertsPage() {
  const [alerts, smsLogs] = await Promise.all([getMyAlerts(), getMySmsLogs()]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Rent alerts, payment proof updates, SMS history, and building announcements.
      </p>
      <div className="mt-6">
        <TenantAlertsPanel alerts={alerts} smsLogs={smsLogs} />
      </div>
    </div>
  );
}
