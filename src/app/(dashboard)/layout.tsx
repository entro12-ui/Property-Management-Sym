import { requireAuth } from '@/lib/auth';
import { getMyAlertCount } from '@/app/actions/tenant-portal';
import { getAdminPendingCount } from '@/app/actions/admin-notifications';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const isAdmin =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'BUILDING_OWNER' ||
    user.role === 'PROPERTY_MANAGER' ||
    user.role === 'ACCOUNTANT';
  const alertCount = isAdmin ? await getAdminPendingCount() : await getMyAlertCount();

  return (
    <DashboardShell user={user} alertCount={alertCount}>
      {children}
    </DashboardShell>
  );
}
