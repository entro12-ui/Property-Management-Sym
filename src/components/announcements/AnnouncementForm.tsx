'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createAnnouncement } from '@/app/actions/announcements';
import { ANNOUNCEMENT_TYPE_LABELS } from '@/types';
import type { AnnouncementType } from '@prisma/client';

const TYPES: AnnouncementType[] = ['GENERAL', 'MAINTENANCE_NOTICE', 'EMERGENCY', 'RENT_REMINDER'];

export function AnnouncementForm({ buildings }: { buildings: { id: string; name: string }[] }) {
  return (
    <form action={createAnnouncement} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div>
        <label htmlFor="buildingId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building (optional – leave empty for all)</label>
        <select id="buildingId" name="buildingId" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
          <option value="">All buildings</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
        <select id="type" name="type" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
          {TYPES.map((t) => (
            <option key={t} value={t}>{ANNOUNCEMENT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
        <input id="title" name="title" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
        <textarea id="body" name="body" required rows={5} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
      </div>
      <div className="flex items-center gap-2">
        <input id="sendSms" name="sendSms" type="checkbox" className="rounded border-slate-300" />
        <label htmlFor="sendSms" className="text-sm text-slate-700 dark:text-slate-300">Send SMS (optional)</label>
      </div>
      <div className="flex gap-3 pt-2">
        <SubmitButton />
        <Link href="/dashboard/announcements" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300">Cancel</Link>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50">
      {pending ? 'Sending…' : 'Send announcement'}
    </button>
  );
}
