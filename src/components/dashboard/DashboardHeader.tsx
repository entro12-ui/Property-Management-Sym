'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { AuthUser } from '@/lib/auth';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Bell, LogOut, Menu, X } from 'lucide-react';

export function DashboardHeader({
  user,
  alertCount = 0,
  sidebarOpen,
  onMenuToggle,
}: {
  user: AuthUser;
  alertCount?: number;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
}) {
  const { t, labels } = useLocale();
  const initial = user.fullName?.trim().charAt(0).toUpperCase() || '?';
  const isAdmin =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'BUILDING_OWNER' ||
    user.role === 'PROPERTY_MANAGER' ||
    user.role === 'ACCOUNTANT';
  const alertsHref = isAdmin ? '/dashboard/approvals' : '/dashboard/alerts';

  return (
    <header className="sticky top-0 z-20 border-b border-indigo-800/60 bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 shadow-md shadow-indigo-950/15">
      <div className="flex h-14 min-h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:flex-none">
          <button
            type="button"
            onClick={onMenuToggle}
            className="touch-target inline-flex shrink-0 items-center justify-center rounded-lg border border-indigo-700/50 bg-indigo-900/50 p-2 text-indigo-50 transition hover:bg-indigo-800/60 lg:hidden"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 lg:hidden">
            <BrandLogo showText={false} tone="onDark" />
          </div>
          <div className="min-w-0 lg:hidden">
            <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
            <p className="truncate text-xs text-indigo-200">{labels.role[user.role]}</p>
          </div>
        </div>
        <div className="hidden flex-1 lg:block" />
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={alertsHref}
            className="touch-target relative inline-flex items-center justify-center rounded-lg border border-indigo-700/50 bg-indigo-900/50 p-2 text-indigo-50 transition hover:bg-indigo-800/60"
            aria-label={isAdmin ? t('nav.pendingApprovals') : t('nav.myNotifications')}
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </Link>
          <LanguageSwitcher tone="onDark" />
          <div className="hidden h-8 w-px bg-indigo-700/60 md:block" aria-hidden />
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-semibold text-indigo-950 shadow-sm">
              {initial}
            </div>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
              <p className="truncate text-xs text-indigo-200">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.assign('/login');
            }}
            className="touch-target inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-700/50 bg-indigo-900/50 px-2.5 py-2 text-sm font-medium text-indigo-50 transition hover:bg-indigo-800/60 sm:px-3"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{t('common.signOut')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
