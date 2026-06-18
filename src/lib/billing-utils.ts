/** Quarter boundaries and quarterly rent helpers. */

export function getQuarterDates(year: number, quarter: number): { start: Date; end: Date; dueDate: Date } {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  const dueDate = new Date(year, startMonth, 5);
  return { start, end, dueDate };
}

export function getCurrentQuarter(): { year: number; quarter: number } {
  const now = new Date();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return { year: now.getFullYear(), quarter };
}

export function formatPeriodLabel(inv: {
  periodType: string;
  month?: number | null;
  year: number;
  quarter?: number | null;
}): string {
  if (inv.periodType === 'QUARTERLY' && inv.quarter) {
    return `Q${inv.quarter} ${inv.year}`;
  }
  if (inv.month) return `${inv.month}/${inv.year}`;
  return String(inv.year);
}

export function quarterlyRentAmount(monthlyRent: number): number {
  return Math.round(monthlyRent * 3 * 100) / 100;
}

export function daysUntilDue(dueDate: Date): number {
  const d = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}
