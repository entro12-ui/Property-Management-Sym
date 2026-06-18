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

export function formatInvoiceLabel(inv: {
  category?: string;
  periodType: string;
  month?: number | null;
  year: number;
  quarter?: number | null;
}): string {
  const period = formatPeriodLabel(inv);
  if (inv.category === 'ELECTRICITY') return `Electricity · ${period}`;
  if (inv.category === 'WATER') return `Water · ${period}`;
  return period;
}

export function quarterlyRentAmount(monthlyRent: number): number {
  return Math.round(monthlyRent * 3 * 100) / 100;
}

export function quarterlyDueDateFromAnchor(anchor: Date, year: number, quarter: number): Date {
  const offsetInQuarter = anchor.getMonth() % 3;
  const dueMonth = (quarter - 1) * 3 + offsetInQuarter;
  return new Date(year, dueMonth, anchor.getDate());
}

/** Upcoming quarterly due dates from an anchor (every 3 months, same day). */
export function upcomingQuarterlyDueDates(anchor: Date, count = 4, from = new Date()): Date[] {
  const dates: Date[] = [];
  let cursor = new Date(anchor);
  cursor.setHours(0, 0, 0, 0);
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  while (cursor < start) {
    cursor.setMonth(cursor.getMonth() + 3);
  }

  for (let i = 0; i < count; i++) {
    dates.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 3);
  }
  return dates;
}

export function formatQuarterlySchedule(anchor: Date, count = 4): string {
  return upcomingQuarterlyDueDates(anchor, count)
    .map((d) => d.toLocaleDateString('en-ET', { dateStyle: 'medium' }))
    .join(', ');
}

export function daysUntilDue(dueDate: Date): number {
  const d = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}
