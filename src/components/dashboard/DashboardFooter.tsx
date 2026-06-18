'use client';

import { useLocale } from '@/components/providers/LocaleProvider';

export function DashboardFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-amber-600/50 bg-stone-950 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center text-xs text-stone-500 sm:flex-row sm:text-left">
        <p className="text-stone-400">© {year} {t('common.appName')}</p>
        <p className="text-stone-500">{t('home.tagline')}</p>
      </div>
    </footer>
  );
}
