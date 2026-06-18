'use client';

import { signOut } from 'next-auth/react';
import type { AuthUser } from '@/lib/auth';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { LogOut } from 'lucide-react';

export function DashboardHeader({ user }: { user: AuthUser }) {
  const { t, labels } = useLocale();
  const initial = user.fullName?.trim().charAt(0).toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-20 border-b border-indigo-800/60 bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 shadow-md shadow-indigo-950/15">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:hidden">
          <BrandLogo showText={false} tone="onDark" />
          <div className="min-w-0 sm:block lg:hidden">
            <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
            <p className="truncate text-xs text-indigo-200">{labels.role[user.role]}</p>
          </div>
        </div>
        <div className="hidden flex-1 lg:block" />
        <div className="flex items-center gap-3 sm:gap-4">
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
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-700/50 bg-indigo-900/50 px-3 py-2 text-sm font-medium text-indigo-50 transition hover:bg-indigo-800/60"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{t('common.signOut')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
