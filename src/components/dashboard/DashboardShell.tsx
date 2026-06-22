'use client';

import { useState } from 'react';
import type { AuthUser } from '@/lib/auth';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';

export function DashboardShell({
  user,
  alertCount,
  children,
}: {
  user: AuthUser;
  alertCount: number;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100/80 dark:bg-slate-950">
      <DashboardSidebar
        user={user}
        alertCount={alertCount}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          user={user}
          alertCount={alertCount}
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((open) => !open)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
