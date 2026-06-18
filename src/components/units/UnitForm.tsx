'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createUnit, updateUnit } from '@/app/actions/units';
import { UNIT_TYPE_LABELS, UNIT_STATUS_LABELS } from '@/types';
import { formatQuarterlySchedule } from '@/lib/billing-utils';
import type { UnitType, UnitStatus } from '@prisma/client';

type UnitData = {
  id: string;
  unitNumber: string;
  floorNumber: number;
  unitType: UnitType;
  sizeSqm: number;
  rentAmount: number;
  quarterlyRentDueDate: Date | null;
  leaseStart: Date | null;
  leaseEnd: Date | null;
  status: UnitStatus;
  notes: string | null;
  buildingId: string;
};

type UnitFormProps = {
  buildings: { id: string; name: string }[];
  unit?: UnitData;
  defaultBuildingId?: string;
};

const unitTypes: UnitType[] = ['ROOM', 'SHOP', 'OFFICE', 'RESTAURANT', 'CLINIC', 'APARTMENT'];
const statuses: UnitStatus[] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];

function toInputDate(d: Date | null): string {
  if (!d) return '';
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
}

export function UnitForm({ buildings, unit, defaultBuildingId }: UnitFormProps) {
  const isEditing = !!unit;
  const schedulePreview = unit?.quarterlyRentDueDate
    ? formatQuarterlySchedule(new Date(unit.quarterlyRentDueDate))
    : null;

  return (
    <form
      action={isEditing ? (formData) => updateUnit(unit.id, formData) : createUnit}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      {!isEditing && (
        <div>
          <label htmlFor="buildingId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building</label>
          <select
            id="buildingId"
            name="buildingId"
            required
            defaultValue={defaultBuildingId}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="">Select building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Unit details</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="unitNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unit number</label>
            <input id="unitNumber" name="unitNumber" required defaultValue={unit?.unitNumber} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="e.g. 101" />
          </div>
          <div>
            <label htmlFor="floorNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Floor</label>
            <input id="floorNumber" name="floorNumber" type="number" min={0} defaultValue={unit?.floorNumber ?? 0} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label htmlFor="unitType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select id="unitType" name="unitType" defaultValue={unit?.unitType ?? 'ROOM'} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
              {unitTypes.map((t) => (
                <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select id="status" name="status" defaultValue={unit?.status ?? 'AVAILABLE'} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
              {statuses.map((s) => (
                <option key={s} value={s}>{UNIT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sizeSqm" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Size (m²)</label>
            <input id="sizeSqm" name="sizeSqm" type="number" step="0.01" min={0} defaultValue={unit?.sizeSqm ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label htmlFor="rentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monthly rent amount (ETB)</label>
            <input id="rentAmount" name="rentAmount" type="number" step="0.01" min={0} defaultValue={unit?.rentAmount ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
            <p className="mt-1 text-xs text-slate-500">Quarterly invoices use monthly rent × 3.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quarterly rent schedule</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          When rent is due every 3 months. Used for quarterly invoice due dates and automated SMS reminders (15 days, 7 days, due today, overdue).
        </p>
        <div className="mt-3">
          <label htmlFor="quarterlyRentDueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Quarterly rent due date
          </label>
          <input
            id="quarterlyRentDueDate"
            name="quarterlyRentDueDate"
            type="date"
            defaultValue={unit ? toInputDate(unit.quarterlyRentDueDate) : ''}
            className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-slate-500">
            Pick the next due date. The same day repeats every 3 months (e.g. 5 Mar → 5 Jun, 5 Sep, 5 Dec).
          </p>
          {schedulePreview && (
            <p className="mt-2 text-xs text-sky-600 dark:text-sky-400">
              Upcoming due dates: {schedulePreview}
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Lease & notes</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="leaseStart" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lease start</label>
            <input id="leaseStart" name="leaseStart" type="date" defaultValue={unit ? toInputDate(unit.leaseStart) : ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label htmlFor="leaseEnd" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lease end</label>
            <input id="leaseEnd" name="leaseEnd" type="date" defaultValue={unit ? toInputDate(unit.leaseEnd) : ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
            <textarea id="notes" name="notes" rows={2} defaultValue={unit?.notes ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <SubmitButton label={isEditing ? 'Save changes' : 'Create unit'} />
        <Link href="/dashboard/units" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300">Cancel</Link>
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50">
      {pending ? 'Saving…' : label}
    </button>
  );
}
