'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { COMPANY } from '@/lib/company';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/#features', key: 'nav.features' as const },
  { href: '/pricing', key: 'nav.pricing' as const },
  { href: `mailto:${COMPANY.email}`, key: 'nav.contact' as const, external: true },
];

export function SiteHeader() {
  const { t } = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href.startsWith('mailto:')) return false;
    if (href === '/pricing') return pathname === '/pricing';
    if (href === '/#features') return pathname === '/';
    return false;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo tone="marketing" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.key}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-900 dark:text-slate-300 dark:hover:text-white"
              >
                {t(link.key)}
              </a>
            ) : (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition',
                  isActive(link.href)
                    ? 'text-indigo-900 dark:text-indigo-300'
                    : 'text-slate-600 hover:text-indigo-900 dark:text-slate-300 dark:hover:text-white'
                )}
              >
                {t(link.key)}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="hidden sm:block" />
          <Link
            href="/admin/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:text-indigo-900 sm:inline-flex dark:text-slate-200 dark:hover:text-white"
          >
            {t('nav.logIn')}
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-indigo-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 sm:inline-flex dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            {t('nav.getStartedFree')}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 md:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-200 px-4 py-4 md:hidden dark:border-slate-800">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  {t(link.key)}
                </a>
              ) : (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  {t(link.key)}
                </Link>
              )
            )}
            <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
            <LanguageSwitcher compact className="px-1" />
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {t('nav.logIn')}
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-indigo-900 px-4 py-3 text-sm font-semibold text-white"
            >
              {t('nav.getStartedFree')}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
