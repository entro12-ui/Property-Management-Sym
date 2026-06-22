'use client';

import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { BuiltBySection } from '@/components/layout/BuiltBySection';

export function SiteFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-amber-600/50 bg-stone-950 text-stone-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <BrandLogo tone="onDark" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
              {t('home.footerAbout')}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">
              {t('home.footerProduct')}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><span className="text-stone-300">{t('nav.tenants')}</span></li>
              <li><span className="text-stone-300">{t('nav.income')}</span></li>
              <li><span className="text-stone-300">{t('nav.reports')}</span></li>
              <li><span className="text-stone-300">{t('nav.announcements')}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">
              {t('home.footerPortals')}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-stone-300 transition hover:text-amber-400">
                  {t('home.tenantLogin')}
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-stone-300 transition hover:text-amber-400">
                  {t('home.adminLogin')}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-stone-300 transition hover:text-amber-400">
                  {t('auth.ownerSignUp')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <BuiltBySection variant="card" />
          </div>
        </div>
        <div className="mt-10 border-t border-stone-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-stone-500 sm:flex-row sm:text-left">
            <p>© {year} {t('common.appName')}. {t('home.footerRights')}</p>
            <p className="text-stone-400">{t('home.tagline')}</p>
          </div>
          <div className="mt-4">
            <BuiltBySection />
          </div>
        </div>
      </div>
    </footer>
  );
}
