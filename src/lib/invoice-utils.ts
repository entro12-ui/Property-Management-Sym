/** Late penalty: 5% per week overdue, applied when due date has passed. */
export function calculateLatePenalty(amount: number, dueDate: Date): number {
  const now = new Date();
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  if (now <= due) return 0;
  const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (24 * 60 * 60 * 1000));
  const weeks = Math.ceil(daysOverdue / 7);
  return Math.round(amount * 0.05 * weeks * 100) / 100;
}

export function isOverdue(dueDate: Date): boolean {
  return new Date(dueDate) < new Date();
}

/** Due within the next N days. */
export function isDueWithin(dueDate: Date, days: number): boolean {
  const d = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = (d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  return diff >= 0 && diff <= days;
}
