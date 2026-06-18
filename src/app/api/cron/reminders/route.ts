import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendSms, buildRentReminderMessage } from '@/lib/sms';
import { daysUntilDue } from '@/lib/billing-utils';
import {
  getOwnerPhone,
  getCustomMessageTemplate,
  getReminderSchedule,
  areRemindersEnabled,
} from '@/lib/sms-settings';
import { logger } from '@/lib/logger';
import type { SmsNotificationType } from '@prisma/client';

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

async function alreadySent(invoiceId: string, type: SmsNotificationType): Promise<boolean> {
  const existing = await prisma.smsNotificationLog.findFirst({
    where: { invoiceId, type, status: 'SENT' },
  });
  return !!existing;
}

function resolveReminderType(
  days: number,
  schedule: Awaited<ReturnType<typeof getReminderSchedule>>
): SmsNotificationType | null {
  if (days === 15 && schedule.alertDays15) return 'RENT_REMINDER_15_DAYS';
  if (days === 7 && schedule.alertDays7) return 'RENT_REMINDER_7_DAYS';
  if (days === 0 && schedule.alertDueToday) return 'RENT_DUE_TODAY';
  if (days < 0 && schedule.alertOverdue) return 'RENT_OVERDUE';
  return null;
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await areRemindersEnabled())) {
    return NextResponse.json({ sent: 0, skipped: 0, processed: 0, disabled: true });
  }

  const [ownerPhone, messageTemplate, schedule] = await Promise.all([
    getOwnerPhone(),
    getCustomMessageTemplate(),
    getReminderSchedule(),
  ]);

  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE', 'DRAFT'] }, category: 'RENT' },
    include: {
      unit: { include: { tenant: { include: { user: true } } } },
      payments: true,
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const inv of invoices) {
    const tenant = inv.unit.tenant;
    const phone = tenant?.user.phone;
    if (!tenant || !phone) {
      skipped++;
      continue;
    }

    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    const balance = Math.max(0, Number(inv.amount) + Number(inv.latePenalty) - paid);
    if (balance <= 0) {
      skipped++;
      continue;
    }

    const days = daysUntilDue(inv.dueDate);
    const type = resolveReminderType(days, schedule);
    if (!type) {
      skipped++;
      continue;
    }

    if (await alreadySent(inv.id, type)) {
      skipped++;
      continue;
    }

    const message = buildRentReminderMessage({
      tenantName: tenant.user.fullName,
      roomNumber: inv.unit.unitNumber,
      dueAmount: balance,
      dueDate: inv.dueDate,
      ownerPhone: ownerPhone ?? '',
      template: messageTemplate,
    });

    const result = await sendSms({
      phone,
      message,
      type,
      tenantId: tenant.id,
      invoiceId: inv.id,
    });
    if (result.success) sent++;
  }

  if (sent > 0) {
    logger.important(`Rent reminders sent: ${sent} (${skipped} skipped)`);
  }

  return NextResponse.json({
    sent,
    skipped,
    processed: invoices.length,
    schedule: {
      alertHour: schedule.alertHour,
    },
  });
}
