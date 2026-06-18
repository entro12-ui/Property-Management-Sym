import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_CODE = 'ETB';

export function formatCurrency(amount: number | string | { toString(): string }): string {
  const n = typeof amount === 'number' ? amount : parseFloat(String(amount));
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isNaN(n) ? 0 : n);
}

export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(typeof d === 'string' ? new Date(d) : d);
}

/** Serialize Prisma Decimal for client component props. */
export function toNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}
