/** Minimum notice period before a tenant can vacate (calendar months). */
export const LEAVE_NOTICE_MONTHS = 2;

export function minimumLeaveDate(from = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + LEAVE_NOTICE_MONTHS);
  return d;
}

export function minimumLeaveDateInput(from = new Date()): string {
  return minimumLeaveDate(from).toISOString().slice(0, 10);
}

export function isValidLeaveDate(requested: Date, from = new Date()): boolean {
  const min = minimumLeaveDate(from);
  const req = new Date(requested);
  req.setHours(0, 0, 0, 0);
  return req >= min;
}

export function daysUntilMoveOut(moveOutDate: Date): number {
  const target = new Date(moveOutDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}
