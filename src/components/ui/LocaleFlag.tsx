import type { Locale } from '@/i18n/types';
import { cn } from '@/lib/utils';

type LocaleFlagProps = {
  locale: Locale;
  size?: 'sm' | 'md';
  className?: string;
};

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};

export function LocaleFlag({ locale, size = 'md', className }: LocaleFlagProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-white/20 shadow-sm',
        sizes[size],
        className
      )}
      aria-hidden
    >
      {locale === 'en' ? <EnglishFlagIcon /> : <EthiopiaFlagIcon />}
    </span>
  );
}

function EnglishFlagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="en-flag-clip">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#en-flag-clip)">
        <rect width="24" height="24" fill="#012169" />
        <path d="M0 0L24 24M24 0L0 24" stroke="#fff" strokeWidth="4.5" />
        <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="2.5" />
        <path d="M12 0V24M0 12H24" stroke="#fff" strokeWidth="7" />
        <path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="4" />
      </g>
    </svg>
  );
}

function EthiopiaFlagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="am-flag-clip">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#am-flag-clip)">
        <rect width="24" height="8" y="0" fill="#078930" />
        <rect width="24" height="8" y="8" fill="#FCDD09" />
        <rect width="24" height="8" y="16" fill="#DA121A" />
        <circle cx="12" cy="12" r="4.2" fill="#0F47AF" />
        <path
          d="M12 8.8L12.9 11.1H15.3L13.2 12.6L14.1 14.9L12 13.4L9.9 14.9L10.8 12.6L8.7 11.1H11.1L12 8.8Z"
          fill="#FCDD09"
        />
      </g>
    </svg>
  );
}
