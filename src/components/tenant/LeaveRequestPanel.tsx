'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { submitLeaveRequest, cancelMyLeaveRequest } from '@/app/actions/leave-requests';
import { LEAVE_NOTICE_MONTHS, minimumLeaveDateInput, daysUntilMoveOut } from '@/lib/leave-utils';
import { LEAVE_REQUEST_STATUS_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import type { LeaveRequestStatus } from '@prisma/client';
import { CalendarOff, Info } from 'lucide-react';

type LeaveRequestRow = {
  id: string;
  requestedMoveOutDate: Date;
  reason: string | null;
  status: LeaveRequestStatus;
  adminNotes: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  unit: { unitNumber: string; building: { name: string } };
  reviewedBy: { fullName: string } | null;
};

export function LeaveRequestPanel({
  requests,
  hasUnit,
}: {
  requests: LeaveRequestRow[];
  hasUnit: boolean;
}) {
  const pending = requests.find((r) => r.status === 'PENDING');
  const minDate = minimumLeaveDateInput();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-800 dark:bg-sky-900/20">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div className="text-sm text-sky-900 dark:text-sky-100">
            <p className="font-medium">Two-month notice required</p>
            <p className="mt-1 text-sky-800 dark:text-sky-200">
              You must submit your request to leave at least {LEAVE_NOTICE_MONTHS} months before your intended
              move-out date. Management will review and confirm your vacate date.
            </p>
          </div>
        </div>
      </div>

      {!hasUnit ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
          No room is assigned to your account. Contact property management if this is incorrect.
        </div>
      ) : pending ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
          <h2 className="font-semibold text-amber-900 dark:text-amber-100">Pending request</h2>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
            Move-out requested: {formatDate(pending.requestedMoveOutDate)} (
            {daysUntilMoveOut(pending.requestedMoveOutDate)} days from now)
          </p>
          {pending.reason && <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">{pending.reason}</p>}
          <form
            action={async () => {
              await cancelMyLeaveRequest(pending.id);
            }}
            className="mt-4"
          >
            <CancelButton />
          </form>
        </div>
      ) : (
        <LeaveRequestForm minDate={minDate} />
      )}

      {requests.length > 0 && (
        <div className="table-shell">
          <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">Request history</h2>
          </div>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {requests.map((req) => (
              <li key={req.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {req.unit.building.name} – Room {req.unit.unitNumber}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Move-out: {formatDate(req.requestedMoveOutDate)}
                    </p>
                    {req.reason && <p className="mt-1 text-sm text-slate-500">{req.reason}</p>}
                    {req.adminNotes && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Management note: {req.adminNotes}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : req.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {LEAVE_REQUEST_STATUS_LABELS[req.status]}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">Submitted {formatDate(req.createdAt)}</p>
                    {req.reviewedBy && (
                      <p className="text-xs text-slate-500">Reviewed by {req.reviewedBy.fullName}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LeaveRequestForm({ minDate }: { minDate: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <form
      action={async (formData) => {
        setError(null);
        setSuccess(false);
        const result = await submitLeaveRequest(formData);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setSuccess(true);
      }}
      className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex items-center gap-2">
        <CalendarOff className="h-5 w-5 text-sky-500" />
        <h2 className="font-semibold text-slate-900 dark:text-white">Submit leave request</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Request to vacate your room. Earliest move-out date: {minDate}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="requestedMoveOutDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Intended move-out date
          </label>
          <input
            id="requestedMoveOutDate"
            name="requestedMoveOutDate"
            type="date"
            required
            min={minDate}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Reason (optional)
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          placeholder="Brief reason for leaving…"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && (
        <p className="mt-3 text-sm text-emerald-600">Leave request submitted. Management will review it shortly.</p>
      )}

      <div className="mt-4">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
    >
      {pending ? 'Submitting…' : 'Submit leave request'}
    </button>
  );
}

function CancelButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-amber-600 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 dark:text-amber-200"
    >
      {pending ? 'Cancelling…' : 'Cancel request'}
    </button>
  );
}
