import { prisma } from '@/lib/db';
import type { ResolvedSmsConfig } from '@/lib/sms-providers';
import { DEFAULT_SMS_MESSAGE_TEMPLATE, type SmsSettingsView } from '@/types';

export type { SmsSettingsView };

const SETTINGS_ID = 'default';

export type ReminderSchedule = {
  alertDays15: boolean;
  alertDays7: boolean;
  alertDueToday: boolean;
  alertOverdue: boolean;
  alertHour: number;
};

function maskSecret(value: string | null | undefined): boolean {
  return !!value?.trim();
}

function resolveFromEnv(): ResolvedSmsConfig | null {
  const apiKey =
    process.env.SMSETIOPIA_API_KEY?.trim() ?? process.env.SMS_ETHIOPIA_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey };
}

function resolveFromRecord(record: { smsethiopiaApiKey: string | null }): ResolvedSmsConfig | null {
  const apiKey =
    record.smsethiopiaApiKey?.trim() ||
    process.env.SMSETIOPIA_API_KEY?.trim() ||
    process.env.SMS_ETHIOPIA_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey };
}

export async function getOrCreateSmsSettingsRecord() {
  return prisma.smsSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID },
    update: {},
  });
}

export async function getSmsSettingsForAdmin(): Promise<SmsSettingsView> {
  const record = await getOrCreateSmsSettingsRecord();
  const ownerPhone = record.ownerPhone?.trim() || record.contactPhone?.trim() || null;

  return {
    enabled: record.enabled,
    remindersEnabled: record.remindersEnabled,
    ownerPhone,
    testTenantPhone: record.testTenantPhone,
    customMessageTemplate: record.customMessageTemplate?.trim() || DEFAULT_SMS_MESSAGE_TEMPLATE,
    alertDays15: record.alertDays15,
    alertDays7: record.alertDays7,
    alertDueToday: record.alertDueToday,
    alertOverdue: record.alertOverdue,
    alertHour: record.alertHour,
    hasSmsethiopiaApiKey:
      maskSecret(record.smsethiopiaApiKey) ||
      maskSecret(process.env.SMSETIOPIA_API_KEY) ||
      maskSecret(process.env.SMS_ETHIOPIA_API_KEY),
  };
}

export async function resolveSmsConfig(): Promise<{ config: ResolvedSmsConfig | null; enabled: boolean }> {
  const record = await getOrCreateSmsSettingsRecord();
  if (!record.enabled) {
    return { config: null, enabled: false };
  }

  const config = resolveFromRecord(record);
  if (config) {
    return { config, enabled: true };
  }

  return { config: resolveFromEnv(), enabled: true };
}

export async function getOwnerPhone(): Promise<string | undefined> {
  const record = await getOrCreateSmsSettingsRecord();
  return (
    record.ownerPhone?.trim() ||
    record.contactPhone?.trim() ||
    process.env.BUILDING_CONTACT_PHONE?.trim() ||
    undefined
  );
}

/** @deprecated Use getOwnerPhone */
export async function getContactPhone(): Promise<string | undefined> {
  return getOwnerPhone();
}

export async function getCustomMessageTemplate(): Promise<string> {
  const record = await getOrCreateSmsSettingsRecord();
  return record.customMessageTemplate?.trim() || DEFAULT_SMS_MESSAGE_TEMPLATE;
}

export async function getReminderSchedule(): Promise<ReminderSchedule> {
  const record = await getOrCreateSmsSettingsRecord();
  return {
    alertDays15: record.alertDays15,
    alertDays7: record.alertDays7,
    alertDueToday: record.alertDueToday,
    alertOverdue: record.alertOverdue,
    alertHour: record.alertHour,
  };
}

export async function areRemindersEnabled(): Promise<boolean> {
  const record = await getOrCreateSmsSettingsRecord();
  return record.enabled && record.remindersEnabled;
}
