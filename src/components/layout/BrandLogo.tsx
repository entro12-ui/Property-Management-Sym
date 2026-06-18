'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  showText?: boolean;
  /** Use on dark header/footer backgrounds */
  tone?: 'default' | 'onDark';
};

export function BrandLogo({ className, showText = true, tone = 'default' }: BrandLogoProps) {
  const { t } = useLocale();
  const onDark = tone === 'onDark';

  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md transition group-hover:shadow-lg',
          onDark
            ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/30 group-hover:shadow-amber-500/40'
            : 'bg-gradient-to-br from-sky-500 to-sky-600 shadow-sky-500/25 group-hover:shadow-sky-500/30'
        )}
      >
        <Building2 className="h-5 w-5" strokeWidth={2.25} />
      </span>
      {showText && (
        <span
          className={cn(
            'text-base font-semibold tracking-tight',
            onDark ? 'text-white' : 'text-slate-900 dark:text-white'
          )}
        >
          {t('common.appName')}
        </span>
      )}
    </Link>
  );
}
