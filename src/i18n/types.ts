import type { en } from './locales/en';

export type Locale = 'en' | 'am';

export const LOCALES: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'am', label: 'አማርኛ' },
];

type DeepStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]>;
};

export type TranslationDict = DeepStrings<typeof en>;

export const LOCALE_COOKIE = 'locale';

export const DEFAULT_LOCALE: Locale = 'en';
