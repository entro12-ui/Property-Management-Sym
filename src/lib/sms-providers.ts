import { logger } from '@/lib/logger';

export type ResolvedSmsConfig = {
  apiKey: string;
};

export type SmsDeliveryResult =
  | { ok: true }
  | { ok: false; error: string };

/** Normalize phone numbers for SMS Ethiopia (msisdn: 251XXXXXXXXX). */
export function normalizeEthiopianMsisdn(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('251')) return digits;
  if (digits.startsWith('0')) return `251${digits.slice(1)}`;
  if (digits.length === 9) return `251${digits}`;
  return digits;
}

export async function sendViaSmsEthiopia(
  config: ResolvedSmsConfig,
  phone: string,
  message: string
): Promise<SmsDeliveryResult> {
  try {
    const msisdn = normalizeEthiopianMsisdn(phone);
    const res = await fetch('https://smsethiopia.et/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        KEY: config.apiKey,
      },
      body: JSON.stringify({ msisdn, text: message }),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.warn('SMS Ethiopia delivery failed', { phone: msisdn, status: res.status, error: errText.slice(0, 200) });
      return { ok: false, error: errText.slice(0, 500) };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    logger.error('SMS Ethiopia delivery error', { phone, error: msg });
    return { ok: false, error: msg };
  }
}

export async function deliverSms(
  config: ResolvedSmsConfig,
  phone: string,
  message: string
): Promise<SmsDeliveryResult> {
  return sendViaSmsEthiopia(config, phone, message);
}

export function isSmsConfigured(config: ResolvedSmsConfig | null | undefined): boolean {
  return !!config?.apiKey?.trim();
}
