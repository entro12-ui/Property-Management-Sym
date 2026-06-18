import Link from 'next/link';
import { getAnnouncements } from '@/app/actions/announcements';
import { getAuthUser } from '@/lib/auth';
import { ANNOUNCEMENT_TYPE_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

export default async function AnnouncementsPage() {
  const [announcements, user] = await Promise.all([getAnnouncements(), getAuthUser()]);
  const isAdmin = user ? ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]) : false;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Notices and updates</p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/announcements/new"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" /> New announcement
          </Link>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {announcements.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            No announcements yet.
          </div>
        ) : (
          announcements.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/announcements/${a.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{ANNOUNCEMENT_TYPE_LABELS[a.type]}</span>
                  <h2 className="mt-0.5 font-semibold text-slate-900 dark:text-white">{a.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{a.body}</p>
                  <p className="mt-2 text-xs text-slate-500">By {a.author.fullName} · {a.building?.name ?? 'All buildings'} · {formatDate(a.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
