import { getMyTenantProfile } from '@/app/actions/tenant-portal';
import { TenantProfileForm } from '@/components/tenant/TenantProfileForm';
import { serializeTenantProfileForClient } from '@/lib/serialize-client';

export default async function TenantProfilePage() {
  const profile = await getMyTenantProfile();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Update your contact details for SMS rent reminders and emergency contact.
      </p>
      <div className="mt-6">
        <TenantProfileForm profile={serializeTenantProfileForClient(profile)} />
      </div>
    </div>
  );
}
