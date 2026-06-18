import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { deliverSms, isSmsConfigured } from '@/lib/sms-providers';
import { resolveSmsConfig } from '@/lib/sms-settings';
import { DEFAULT_SMS_MESSAGE_TEMPLATE } from '@/types';
import type { SmsNotificationType } from '@prisma/client';

type SendSmsParams = {
  phone: string;
  message: string;
  type: SmsNotificationType;
  tenantId?: string;
  invoiceId?: string;
};

/**
 * SMS delivery via SMS Ethiopia when configured; env vars are used as fallback.
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

  const { config, enabled } = await resolveSmsConfig();

  if (!enabled) {
    await prisma.smsNotificationLog.update({
      where: { id: log.id },
      data: { status: 'SKIPPED', errorMessage: 'SMS notifications are disabled' },
    });
    return { success: false, logId: log.id };
  }

  if (!config || !isSmsConfigured(config)) {
    if (process.env.SMS_DEBUG === 'true') {
      logger.info(`SMS dev delivery to ${params.phone}: ${params.message.slice(0, 80)}…`);
    }
    await prisma.smsNotificationLog.update({
      where: { id: log.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        errorMessage: 'Dev mode – no SMS provider configured',
      },
    });
    return { success: true, logId: log.id };
  }

  const result = await deliverSms(config, params.phone, params.message);

  if (!result.ok) {
    await prisma.smsNotificationLog.update({
      where: { id: log.id },
      data: { status: 'FAILED', errorMessage: result.error },
    });
    return { success: false, logId: log.id };
  }

  await prisma.smsNotificationLog.update({
    where: { id: log.id },
    data: { status: 'SENT', sentAt: new Date() },
  });
  return { success: true, logId: log.id };
}

export function renderRentReminderMessage(
  template: string,
  params: {
    tenantName: string;
    roomNumber: string;
    dueAmount: number;
    dueDate: Date;
    ownerPhone?: string;
  }
): string {
  const dateStr = params.dueDate.toLocaleDateString('en-ET', { dateStyle: 'medium' });
  const ownerPhone = params.ownerPhone ?? '';

  return template
    .replaceAll('{tenantName}', params.tenantName)
    .replaceAll('{roomNumber}', params.roomNumber)
    .replaceAll('{amount}', formatCurrency(params.dueAmount))
    .replaceAll('{dueDate}', dateStr)
    .replaceAll('{ownerPhone}', ownerPhone)
    .replaceAll('{contactPhone}', ownerPhone);
}

export function buildRentReminderMessage(params: {
  tenantName: string;
  roomNumber: string;
  dueAmount: number;
  dueDate: Date;
  ownerPhone?: string;
  template?: string;
}): string {
  const template = params.template?.trim() || DEFAULT_SMS_MESSAGE_TEMPLATE;
  return renderRentReminderMessage(template, params);
}
