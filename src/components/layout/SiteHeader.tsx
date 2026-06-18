'use client';

import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { BrandLogo } from '@/components/layout/BrandLogo';

export function SiteHeader() {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-30 border-b border-indigo-800/60 bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 shadow-lg shadow-indigo-950/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo tone="onDark" />
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
            >
              {t('auth.signIn')}
            </Link>
            <Link
              href="/admin/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
            >
              {t('auth.adminOnly')}
            </Link>
          </nav>
          <LanguageSwitcher tone="onDark" />
        </div>
      </div>
    </header>
  );
}
