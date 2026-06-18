import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { logger } from '@/lib/logger';
import type { SmsNotificationType } from '@prisma/client';

type SendSmsParams = {
  phone: string;
  message: string;
  type: SmsNotificationType;
  tenantId?: string;
  invoiceId?: string;
};

/**
 * SMS delivery via Twilio when configured; otherwise marked SENT in dev without Twilio.
 * Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env.local
 */
export async function sendSms(params: SendSmsParams): Promise<{ success: boolean; logId: string }> {
  const log = await prisma.smsNotificationLog.create({
    data: {
      phone: params.phone,
      message: params.message,
      type: params.type,
      tenantId: params.tenantId,
      invoiceId: params.invoiceId,
      status: 'PENDING',
    },
  });

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    if (process.env.SMS_DEBUG === 'true') {
      logger.info(`SMS dev delivery to ${params.phone}: ${params.message.slice(0, 80)}…`);
    }
    await prisma.smsNotificationLog.update({
      where: { id: log.id },
      data: { status: 'SENT', sentAt: new Date(), errorMessage: 'Dev mode – no Twilio configured' },
    });
    return { success: true, logId: log.id };
  }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const body = new URLSearchParams({ To: params.phone, From: from, Body: params.message });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.warn('SMS delivery failed', { phone: params.phone, status: res.status, error: errText.slice(0, 200) });
      await prisma.smsNotificationLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', errorMessage: errText.slice(0, 500) },
      });
      return { success: false, logId: log.id };
    }

    await prisma.smsNotificationLog.update({
      where: { id: log.id },
      data: { status: 'SENT', sentAt: new Date() },
    });
    return { success: true, logId: log.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    logger.error('SMS delivery error', { phone: params.phone, error: msg });
    await prisma.smsNotificationLog.update({
      where: { id: log.id },
      data: { status: 'FAILED', errorMessage: msg },
    });
    return { success: false, logId: log.id };
  }
}

export function buildRentReminderMessage(params: {
  tenantName: string;
  roomNumber: string;
  dueAmount: number;
  dueDate: Date;
  contactPhone?: string;
}): string {
  const dateStr = params.dueDate.toLocaleDateString('en-ET', { dateStyle: 'medium' });
  let msg = `Dear ${params.tenantName}, rent reminder for Room ${params.roomNumber}: ${formatCurrency(params.dueAmount)} due ${dateStr}.`;
  if (params.contactPhone) msg += ` Contact: ${params.contactPhone}.`;
  return msg;
}
