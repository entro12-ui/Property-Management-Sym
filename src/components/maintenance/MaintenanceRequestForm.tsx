'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createMaintenanceRequest } from '@/app/actions/maintenance';
import { URGENCY_LABELS } from '@/types';
import type { UrgencyLevel } from '@prisma/client';

const URGENCIES: UrgencyLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function MaintenanceRequestForm({
  unitOptions,
  defaultUnitId,
}: {
  unitOptions: { id: string; label: string }[];
  defaultUnitId?: string;
}) {
  return (
    <form action={createMaintenanceRequest} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      {unitOptions.length > 0 && (
        <div>
          <label htmlFor="unitId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unit (if not your unit)</label>
          <select id="unitId" name="unitId" defaultValue={defaultUnitId} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
            <option value="">My unit</option>
            {unitOptions.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
        <input id="title" name="title" required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="e.g. Leaking faucet" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
        <textarea id="description" name="description" required rows={4} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
      </div>
      <div>
        <label htmlFor="urgency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Urgency</label>
        <select id="urgency" name="urgency" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
          {URGENCIES.map((u) => (
            <option key={u} value={u}>{URGENCY_LABELS[u]}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <SubmitButton />
        <Link href="/dashboard/maintenance" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300">Cancel</Link>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50">
      {pending ? 'Submitting…' : 'Submit request'}
    </button>
  );
}
