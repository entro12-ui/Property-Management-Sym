import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendSms, buildRentReminderMessage } from '@/lib/sms';
import { daysUntilDue } from '@/lib/billing-utils';
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

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contactPhone = process.env.BUILDING_CONTACT_PHONE ?? '';
  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE', 'DRAFT'] } },
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
    let type: SmsNotificationType | null = null;
    if (days === 15) type = 'RENT_REMINDER_15_DAYS';
    else if (days === 7) type = 'RENT_REMINDER_7_DAYS';
    else if (days === 0) type = 'RENT_DUE_TODAY';
    else if (days < 0) type = 'RENT_OVERDUE';
    else {
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
      contactPhone,
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

  return NextResponse.json({ sent, skipped, processed: invoices.length });
}
