import { requireAuth } from '@/lib/auth';
import { getMyAlertCount } from '@/app/actions/tenant-portal';
import { getAdminPendingCount } from '@/app/actions/admin-notifications';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';

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
    <div className="flex min-h-screen bg-slate-100/80 dark:bg-slate-950">
      <DashboardSidebar user={user} alertCount={alertCount} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} alertCount={alertCount} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
