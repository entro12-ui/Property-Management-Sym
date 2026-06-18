'use client';

import { useFormStatus } from 'react-dom';
import { reviewLeaveRequest } from '@/app/actions/leave-requests';
import { formatDate } from '@/lib/utils';
import { LEAVE_REQUEST_STATUS_LABELS } from '@/types';
import type { LeaveRequestStatus } from '@prisma/client';

type LeaveRequestAdminRow = {
  id: string;
  requestedMoveOutDate: Date;
  reason: string | null;
  status: LeaveRequestStatus;
  adminNotes: string | null;
  createdAt: Date;
  tenant: { user: { fullName: string; email: string; phone: string | null } };
  unit: { unitNumber: string; building: { name: string } };
};

export function LeaveRequestReviewPanel({ requests }: { requests: LeaveRequestAdminRow[] }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
        No leave requests yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div
          key={req.id}
          className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{req.tenant.user.fullName}</p>
              <p className="text-sm text-slate-500">{req.tenant.user.email}</p>
              {req.tenant.user.phone && <p className="text-sm text-slate-500">{req.tenant.user.phone}</p>}
              <p className="mt-2 text-sm">
                {req.unit.building.name} – Room {req.unit.unitNumber}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                Move-out: {formatDate(req.requestedMoveOutDate)}
              </p>
              {req.reason && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{req.reason}</p>}
              <p className="mt-1 text-xs text-slate-500">Submitted {formatDate(req.createdAt)}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              {LEAVE_REQUEST_STATUS_LABELS[req.status]}
            </span>
          </div>

          {req.status === 'PENDING' && (
            <form
              action={async (formData) => {
                await reviewLeaveRequest(req.id, formData);
              }}
              className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Admin notes</label>
                <textarea
                  name="adminNotes"
                  rows={2}
                  placeholder="Optional message to tenant…"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <ReviewButton status="APPROVED" label="Approve" className="bg-emerald-600 hover:bg-emerald-700" />
                <ReviewButton status="REJECTED" label="Reject" className="bg-red-600 hover:bg-red-700" />
              </div>
            </form>
          )}

          {req.adminNotes && req.status !== 'PENDING' && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Note: {req.adminNotes}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ReviewButton({
  status,
  label,
  className,
}: {
  status: 'APPROVED' | 'REJECTED';
  label: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="status"
      value={status}
      disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${className}`}
    >
      {pending ? 'Saving…' : label}
    </button>
  );
}
