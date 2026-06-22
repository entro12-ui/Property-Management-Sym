'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { BrandLogo } from '@/components/layout/BrandLogo';

export function SiteHeader() {
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-indigo-800/60 bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 shadow-lg shadow-indigo-950/20">
      <div className="mx-auto flex h-14 min-h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <BrandLogo tone="onDark" />
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden items-center gap-1 md:flex">
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
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="touch-target inline-flex items-center justify-center rounded-lg border border-indigo-700/50 bg-indigo-900/50 p-2 text-indigo-50 transition hover:bg-indigo-800/60 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="border-t border-indigo-800/60 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
            >
              {t('auth.userLogin')}
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
            >
              {t('auth.adminOnly')}
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-amber-300 transition hover:bg-white/10"
            >
              {t('auth.ownerSignUp')}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
