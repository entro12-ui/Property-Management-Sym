'use client';

import { useFormStatus } from 'react-dom';
import { updateMaintenanceStatus } from '@/app/actions/maintenance';
import { MAINTENANCE_STATUS_LABELS } from '@/types';
import type { MaintenanceStatus } from '@prisma/client';

const STATUSES: MaintenanceStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export function UpdateMaintenanceStatusForm({
  requestId,
  currentStatus,
  technicians,
}: {
  requestId: string;
  currentStatus: MaintenanceStatus;
  technicians: { id: string; fullName: string }[];
}) {
  return (
    <form action={(formData) => updateMaintenanceStatus(requestId, formData)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-semibold text-slate-900 dark:text-white">Update status</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
          <select id="status" name="status" defaultValue={currentStatus} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{MAINTENANCE_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="assignedToId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign to</label>
          <select id="assignedToId" name="assignedToId" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
            <option value="">—</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.fullName}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cost</label>
          <input id="cost" name="cost" type="number" step="0.01" min={0} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
      </div>
      <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
        Update
      </button>
    </form>
  );
}
