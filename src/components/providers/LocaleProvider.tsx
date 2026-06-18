'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTranslations, t as translate, type Locale } from '@/i18n';
import { getLabelMaps } from '@/i18n/labels';
import { DEFAULT_LOCALE, LOCALE_COOKIE } from '@/i18n/types';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: ReturnType<typeof getTranslations>;
  t: (key: string) => string;
  labels: ReturnType<typeof getLabelMaps>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      persistLocale(next);
      setLocaleState(next);
      document.documentElement.lang = next === 'am' ? 'am' : 'en';
      router.refresh();
    },
    [locale, router]
  );

  const value = useMemo<LocaleContextValue>(() => {
    const dict = getTranslations(locale);
    return {
      locale,
      setLocale,
      dict,
      t: (key: string) => translate(locale, key),
      labels: getLabelMaps(locale),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Can happen briefly during Fast Refresh full reloads (e.g. after locale file edits).
    const locale = DEFAULT_LOCALE;
    const dict = getTranslations(locale);
    return {
      locale,
      setLocale: () => {},
      dict,
      t: (key: string) => translate(locale, key),
      labels: getLabelMaps(locale),
    };
  }
  return ctx;
}

export function useLabels() {
  return useLocale().labels;
}
