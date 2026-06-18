'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LOCALES, type Locale } from '@/i18n';
import { ChevronDown, Check, Languages } from 'lucide-react';
import { LocaleFlag } from '@/components/ui/LocaleFlag';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
  /** Use on dark header backgrounds */
  tone?: 'default' | 'onDark';
};

export function LanguageSwitcher({ className, compact = false, tone = 'default' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const onDark = tone === 'onDark';

  const current = LOCALES.find((loc) => loc.value === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function selectLocale(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div className={cn('flex items-center gap-2', compact && 'w-full flex-col items-stretch')}>
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

        <button
          type="button"
          aria-label={t('common.language')}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm shadow-sm transition focus:outline-none focus:ring-2',
            onDark
              ? 'border-indigo-700/60 bg-indigo-900/60 text-indigo-50 hover:bg-indigo-800/70 focus:border-amber-400 focus:ring-amber-400/25'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:border-sky-500 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600/80',
            compact ? 'w-full justify-between' : 'min-w-[9.5rem]'
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <LocaleFlag locale={current.value} size="sm" />
            <span className="truncate font-medium">{current.label}</span>
          </span>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 opacity-70 transition-transform', open && 'rotate-180')}
          />
        </button>
      </div>

      {open && (
        <ul
          role="listbox"
          aria-label={t('common.language')}
          className={cn(
            'absolute z-50 mt-1.5 min-w-full overflow-hidden rounded-lg border py-1 shadow-lg',
            compact ? 'left-0 right-0' : 'right-0 w-44',
            onDark
              ? 'border-indigo-700/60 bg-indigo-950 text-indigo-50'
              : 'border-slate-200 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
          )}
        >
          {LOCALES.map((loc) => {
            const selected = loc.value === locale;
            return (
              <li key={loc.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => selectLocale(loc.value)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition',
                    onDark
                      ? selected
                        ? 'bg-indigo-800/80 text-white'
                        : 'text-indigo-100 hover:bg-indigo-800/50'
                      : selected
                        ? 'bg-sky-50 text-sky-900 dark:bg-sky-900/30 dark:text-sky-100'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  )}
                >
                  <LocaleFlag locale={loc.value} size="md" />
                  <span className="flex-1 font-medium">{loc.label}</span>
                  {selected && <Check className="h-4 w-4 shrink-0 opacity-80" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
