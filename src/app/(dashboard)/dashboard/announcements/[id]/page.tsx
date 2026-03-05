import Link from 'next/link';
import { getAnnouncement } from '@/app/actions/announcements';
import { ANNOUNCEMENT_TYPE_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import { MarkReadForm } from '@/components/announcements/MarkReadForm';

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{ANNOUNCEMENT_TYPE_LABELS[announcement.type]}</span>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{announcement.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{announcement.body}</p>
        <p className="mt-4 text-sm text-slate-500">By {announcement.author.fullName} · {announcement.building?.name ?? 'All buildings'} · {formatDate(announcement.createdAt)}</p>
        <div className="mt-6">
          <MarkReadForm announcementId={id} />
        </div>
      </div>
      <div className="mt-6">
        <Link href="/dashboard/announcements" className="text-sky-500 hover:underline">← Back to announcements</Link>
      </div>
    </div>
  );
}
