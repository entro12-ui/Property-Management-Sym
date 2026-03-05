'use client';

import { useFormStatus } from 'react-dom';
import { markAnnouncementRead } from '@/app/actions/announcements';

export function MarkReadForm({ announcementId }: { announcementId: string }) {
  return (
    <form action={(formData) => markAnnouncementRead(announcementId, formData.get('reply') as string)} className="space-y-3">
      <label htmlFor="reply" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm read / Reply (optional)</label>
      <textarea id="reply" name="reply" rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="Your reply or question..." />
      <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
        Confirm read
      </button>
    </form>
  );
}
