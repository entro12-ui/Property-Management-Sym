import { en } from './locales/en';
import { am } from './locales/am';
import type { Locale, TranslationDict } from './types';
import { DEFAULT_LOCALE } from './types';

const dictionaries: Record<Locale, TranslationDict> = { en, am };

export function getTranslations(locale: Locale): TranslationDict {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export type { Locale, TranslationDict };
export { LOCALES, LOCALE_COOKIE, DEFAULT_LOCALE } from './types';

/** Resolve dot-separated key path, e.g. `nav.dashboard` */
export function t(locale: Locale, key: string): string {
  const dict = getTranslations(locale);
  const parts = key.split('.');
  let cur: unknown = dict;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return key;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : key;
}

export function floorLabel(locale: Locale, floor: number): string {
  const floors = getTranslations(locale).labels.floor;
  return floors[String(floor) as keyof typeof floors] ?? `${t(locale, 'common.floor')} ${floor}`;
}
