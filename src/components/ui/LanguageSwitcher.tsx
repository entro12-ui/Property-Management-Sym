'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { LOCALES } from '@/i18n';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
  /** Use on dark header backgrounds */
  tone?: 'default' | 'onDark';
};

export function LanguageSwitcher({ className, compact = false, tone = 'default' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();
  const onDark = tone === 'onDark';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {!compact && (
        <span
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium',
            onDark ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <Languages className="h-3.5 w-3.5" />
          {t('common.language')}
        </span>
      )}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as 'en' | 'am')}
        aria-label={t('common.language')}
        className={cn(
          'rounded-lg border px-2.5 py-1.5 text-sm shadow-sm transition focus:outline-none focus:ring-2',
          onDark
            ? 'border-indigo-700/60 bg-indigo-900/60 text-indigo-50 focus:border-amber-400 focus:ring-amber-400/25'
            : 'border-slate-300 bg-white text-slate-700 focus:border-sky-500 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200',
          compact ? 'w-full' : 'min-w-[7.5rem]'
        )}
      >
        {LOCALES.map((loc) => (
          <option key={loc.value} value={loc.value}>
            {loc.label}
          </option>
        ))}
      </select>
    </div>
  );
}
