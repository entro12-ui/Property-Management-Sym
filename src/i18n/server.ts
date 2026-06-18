import { cookies } from 'next/headers';
import { getTranslations, t, type Locale } from './index';
import { getLabelMaps } from './labels';
import { DEFAULT_LOCALE, LOCALE_COOKIE } from './types';

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === 'am' ? 'am' : DEFAULT_LOCALE;
}

export async function getServerI18n() {
  const locale = await getServerLocale();
  return {
    locale,
    dict: getTranslations(locale),
    t: (key: string) => t(locale, key),
    labels: getLabelMaps(locale),
  };
}
