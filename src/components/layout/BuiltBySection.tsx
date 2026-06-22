'use client';

import { ExternalLink, Mail, Phone } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { COMPANY } from '@/lib/company';

type BuiltBySectionProps = {
  variant?: 'inline' | 'card';
};

export function BuiltBySection({ variant = 'inline' }: BuiltBySectionProps) {
  const { t } = useLocale();

  const links = (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:justify-start">
      <a
        href={COMPANY.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-amber-500/90 transition hover:text-amber-400"
      >
        {COMPANY.name}
        <ExternalLink className="h-3 w-3" aria-hidden />
      </a>
      <a
        href={`mailto:${COMPANY.email}`}
        className="inline-flex items-center gap-1.5 text-stone-400 transition hover:text-amber-400"
      >
        <Mail className="h-3 w-3" aria-hidden />
        {COMPANY.email}
      </a>
      <a
        href={COMPANY.phoneHref}
        className="inline-flex items-center gap-1.5 text-stone-400 transition hover:text-amber-400"
      >
        <Phone className="h-3 w-3" aria-hidden />
        {COMPANY.phone}
      </a>
    </div>
  );

  if (variant === 'card') {
    return (
      <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">
          {t('home.footerDeveloper')}
        </p>
        <p className="mt-2 text-sm font-medium text-stone-200">{COMPANY.legalName}</p>
        <p className="mt-1 text-xs text-stone-500">{t('home.footerBuiltProduct')}</p>
        <div className="mt-4">{links}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 text-center text-xs text-stone-500 sm:flex-row sm:justify-center sm:gap-4">
      <span className="text-stone-400">
        {t('home.footerBuiltProduct')}{' '}
        <a
          href={COMPANY.website}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-amber-500/90 transition hover:text-amber-400"
        >
          {COMPANY.name}
        </a>
      </span>
      <span className="hidden text-stone-700 sm:inline" aria-hidden>
        ·
      </span>
      <a href={`mailto:${COMPANY.email}`} className="transition hover:text-amber-400">
        {COMPANY.email}
      </a>
      <span className="hidden text-stone-700 sm:inline" aria-hidden>
        ·
      </span>
      <a href={COMPANY.phoneHref} className="transition hover:text-amber-400">
        {COMPANY.phone}
      </a>
    </div>
  );
}
