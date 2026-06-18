import Link from 'next/link';
import { getLeaveRequests } from '@/app/actions/leave-requests';
import { LeaveRequestReviewPanel } from '@/components/tenant/LeaveRequestReviewPanel';
import { LEAVE_REQUEST_STATUS_LABELS } from '@/types';
import type { LeaveRequestStatus } from '@prisma/client';

export default async function AdminLeaveRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const requests = await getLeaveRequests(
    status ? (status as LeaveRequestStatus) : undefined
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave requests</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Review tenant requests to vacate. Approved requests set the tenant move-out date.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/dashboard/leave-requests"
          className={`rounded-lg px-3 py-1.5 text-sm ${!status ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'}`}
        >
          All
        </Link>
        {(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as LeaveRequestStatus[]).map((s) => (
          <Link
            key={s}
            href={`/dashboard/leave-requests?status=${s}`}
            className={`rounded-lg px-3 py-1.5 text-sm ${status === s ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'}`}
          >
            {LEAVE_REQUEST_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <LeaveRequestReviewPanel requests={requests} />
      </div>
    </div>
  );
}
