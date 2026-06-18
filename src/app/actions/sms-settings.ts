'use server';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendSms, buildRentReminderMessage } from '@/lib/sms';
import {
  getOrCreateSmsSettingsRecord,
  getSmsSettingsForAdmin,
} from '@/lib/sms-settings';
import { DEFAULT_SMS_MESSAGE_TEMPLATE, type SmsSettingsView } from '@/types';

const SETTINGS_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER'] as const;

export async function getSmsSettings(): Promise<SmsSettingsView> {
  await requireRole(SETTINGS_ROLES);
  return getSmsSettingsForAdmin();
}

export async function updateSmsSettings(formData: FormData) {
  await requireRole(SETTINGS_ROLES);

  const enabled = formData.get('enabled') === 'on';
  const remindersEnabled = formData.get('remindersEnabled') === 'on';
  const ownerPhone = (formData.get('ownerPhone') as string)?.trim() || null;
  const testTenantPhone = (formData.get('testTenantPhone') as string)?.trim() || null;
  const customMessageTemplate =
    (formData.get('customMessageTemplate') as string)?.trim() || DEFAULT_SMS_MESSAGE_TEMPLATE;
  const alertDays15 = formData.get('alertDays15') === 'on';
  const alertDays7 = formData.get('alertDays7') === 'on';
  const alertDueToday = formData.get('alertDueToday') === 'on';
  const alertOverdue = formData.get('alertOverdue') === 'on';
  const alertHourRaw = Number(formData.get('alertHour'));
  const alertHour = Number.isFinite(alertHourRaw)
    ? Math.min(23, Math.max(0, Math.round(alertHourRaw)))
    : 8;
  const smsethiopiaApiKey = (formData.get('smsethiopiaApiKey') as string)?.trim();

  const existing = await getOrCreateSmsSettingsRecord();

  await prisma.smsSettings.update({
    where: { id: existing.id },
    data: {
      enabled,
      remindersEnabled,
      ownerPhone,
      contactPhone: ownerPhone,
      testTenantPhone,
      customMessageTemplate,
      alertDays15,
      alertDays7,
      alertDueToday,
      alertOverdue,
      alertHour,
      ...(smsethiopiaApiKey ? { smsethiopiaApiKey } : {}),
    },
  });

  revalidatePath('/dashboard/notifications');
  revalidatePath('/dashboard/notifications/settings');
}

export async function sendTestSms(formData: FormData) {
  await requireRole(SETTINGS_ROLES);

  const phone = (formData.get('testPhone') as string)?.trim();
  if (!phone) {
    return { success: false, error: 'Phone number is required' };
  }

  const settings = await getSmsSettingsForAdmin();
  const message = buildRentReminderMessage({
    tenantName: 'Sample Tenant',
    roomNumber: '101',
    dueAmount: 15000,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ownerPhone: settings.ownerPhone ?? '',
    template: settings.customMessageTemplate,
  });

  const result = await sendSms({
    phone,
    message,
    type: 'MANUAL',
  });

  revalidatePath('/dashboard/notifications');
  return { success: result.success, error: result.success ? undefined : 'Failed to send test SMS' };
}
