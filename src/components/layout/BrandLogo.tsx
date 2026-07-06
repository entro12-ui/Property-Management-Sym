'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  showText?: boolean;
  /** Use on dark header/footer backgrounds, or marketing header */
  tone?: 'default' | 'onDark' | 'marketing';
};

export function BrandLogo({ className, showText = true, tone = 'default' }: BrandLogoProps) {
  const { t } = useLocale();
  const onDark = tone === 'onDark';
  const marketing = tone === 'marketing';

  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm transition',
          marketing && 'rounded-xl bg-indigo-900 shadow-indigo-900/20 group-hover:bg-indigo-800',
          onDark &&
            'rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/30 group-hover:shadow-amber-500/40',
          !marketing &&
            !onDark &&
            'rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-sky-500/25 group-hover:shadow-sky-500/30'
        )}
      >
        <Building2 className="h-5 w-5" strokeWidth={2.25} />
      </span>
      {showText && (
        <span
          className={cn(
            'text-lg font-bold tracking-tight',
            marketing && 'text-indigo-950 dark:text-white',
            onDark && 'text-white',
            !marketing && !onDark && 'text-base font-semibold text-slate-900 dark:text-white'
          )}
        >
          {t('common.appName')}
        </span>
      )}
    </Link>
  );
}
