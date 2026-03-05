import { requireAuth } from '@/lib/auth';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
