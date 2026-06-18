'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { updateSmsSettings, sendTestSms } from '@/app/actions/sms-settings';
import { DEFAULT_SMS_MESSAGE_TEMPLATE, type SmsSettingsView } from '@/types';
import { formatCurrency } from '@/lib/utils';

type SmsSettingsFormProps = {
  settings: SmsSettingsView;
};

function previewMessage(template: string, ownerPhone: string): string {
  const sampleDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const dateStr = sampleDate.toLocaleDateString('en-ET', { dateStyle: 'medium' });

  return (template.trim() || DEFAULT_SMS_MESSAGE_TEMPLATE)
    .replaceAll('{tenantName}', 'Sample Tenant')
    .replaceAll('{roomNumber}', '205')
    .replaceAll('{amount}', formatCurrency(45000))
    .replaceAll('{dueDate}', dateStr)
    .replaceAll('{ownerPhone}', ownerPhone)
    .replaceAll('{contactPhone}', ownerPhone);
}

export function SmsSettingsForm({ settings }: SmsSettingsFormProps) {
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [customMessage, setCustomMessage] = useState(settings.customMessageTemplate);
  const [ownerPhone, setOwnerPhone] = useState(settings.ownerPhone ?? '');

  const messagePreview = useMemo(
    () => previewMessage(customMessage, ownerPhone),
    [customMessage, ownerPhone]
  );

  return (
    <div className="space-y-6">
      <form
        action={updateSmsSettings}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">General</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enable SMS notifications via SMS Ethiopia.
          </p>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={settings.enabled}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            Enable SMS notifications
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              name="remindersEnabled"
              defaultChecked={settings.remindersEnabled}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            Enable automated rent reminders
          </label>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
          <h3 className="font-medium text-slate-900 dark:text-white">Message &amp; contact numbers</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Customize the rent reminder sent to tenants. Tenant phone numbers are taken from each tenant&apos;s profile when reminders run.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ownerPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Owner phone number
              </label>
              <input
                id="ownerPhone"
                name="ownerPhone"
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="e.g. 0923427064"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-slate-500">Shown in messages so tenants can contact the owner.</p>
            </div>
            <div>
              <label htmlFor="testTenantPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Sample tenant phone
              </label>
              <input
                id="testTenantPhone"
                name="testTenantPhone"
                type="tel"
                defaultValue={settings.testTenantPhone ?? ''}
                placeholder="e.g. 0911639555"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-slate-500">Default number for the test SMS form below.</p>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="customMessageTemplate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Custom message to tenants
            </label>
            <textarea
              id="customMessageTemplate"
              name="customMessageTemplate"
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500">
              Placeholders: {'{tenantName}'}, {'{roomNumber}'}, {'{amount}'}, {'{dueDate}'}, {'{ownerPhone}'}
            </p>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/40">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Preview</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{messagePreview}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
          <h3 className="font-medium text-slate-900 dark:text-white">Alert schedule</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose when rent reminders are sent. Schedule your cron job to run daily at the preferred hour.
          </p>

          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                name="alertDays15"
                defaultChecked={settings.alertDays15}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              15 days before due date
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                name="alertDays7"
                defaultChecked={settings.alertDays7}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              7 days before due date
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                name="alertDueToday"
                defaultChecked={settings.alertDueToday}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              On due date
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                name="alertOverdue"
                defaultChecked={settings.alertOverdue}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              When overdue
            </label>
          </div>

          <div className="mt-4">
            <label htmlFor="alertHour" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Preferred send hour (24h, local time)
            </label>
            <input
              id="alertHour"
              name="alertHour"
              type="number"
              min={0}
              max={23}
              defaultValue={settings.alertHour}
              className="mt-1 w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500">
              Example cron: daily at {String(settings.alertHour).padStart(2, '0')}:00 —{' '}
              <code className="rounded bg-slate-100 px-1 dark:bg-slate-900">0 {settings.alertHour} * * *</code>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
          <h3 className="font-medium text-slate-900 dark:text-white">SMS Ethiopia</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            API key from{' '}
            <a href="https://smsethiopia.et" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
              smsethiopia.et
            </a>
            . Leave blank to keep the current key.
          </p>
          <div className="mt-3">
            <label htmlFor="smsethiopiaApiKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              API key {settings.hasSmsethiopiaApiKey && <span className="text-emerald-600">(configured)</span>}
            </label>
            <input
              id="smsethiopiaApiKey"
              name="smsethiopiaApiKey"
              type="password"
              autoComplete="off"
              placeholder={settings.hasSmsethiopiaApiKey ? '••••••••••••' : 'Enter your SMS Ethiopia API key'}
              className="mt-1 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton label="Save settings" />
          <Link
            href="/dashboard/notifications"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300"
          >
            View SMS logs
          </Link>
        </div>
      </form>

      <form
        action={async (formData) => {
          const result = await sendTestSms(formData);
          setTestResult(result);
        }}
        className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Send test SMS</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sends your custom tenant message to verify delivery.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="testPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tenant phone number
            </label>
            <input
              id="testPhone"
              name="testPhone"
              type="tel"
              required
              defaultValue={settings.testTenantPhone ?? ''}
              placeholder="0911639555 or 251911639555"
              className="mt-1 w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <TestSubmitButton />
        </div>
        {testResult && (
          <p
            className={`mt-3 text-sm ${testResult.success ? 'text-emerald-600' : 'text-red-600'}`}
          >
            {testResult.success ? 'Test SMS sent successfully.' : testResult.error ?? 'Failed to send test SMS.'}
          </p>
        )}
      </form>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
    >
      {pending ? 'Saving…' : label}
    </button>
  );
}

function TestSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-sky-500 px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50 disabled:opacity-50 dark:text-sky-400 dark:hover:bg-sky-900/20"
    >
      {pending ? 'Sending…' : 'Send test'}
    </button>
  );
}
