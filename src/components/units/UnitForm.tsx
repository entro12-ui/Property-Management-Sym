'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createUnit, updateUnit } from '@/app/actions/units';
import { UNIT_TYPE_LABELS, UNIT_STATUS_LABELS } from '@/types';
import type { UnitType, UnitStatus } from '@prisma/client';

type UnitData = {
  id: string;
  unitNumber: string;
  floorNumber: number;
  unitType: UnitType;
  sizeSqm: number;
  rentAmount: number;
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

  return (
    <form
      action={isEditing ? (formData) => updateUnit(unit.id, formData) : createUnit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      {!isEditing && (
        <div>
          <label htmlFor="buildingId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building</label>
          <select
            id="buildingId"
            name="buildingId"
            required
            defaultValue={defaultBuildingId}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white"
          >
            <option value="">Select building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="unitNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unit number</label>
          <input id="unitNumber" name="unitNumber" required defaultValue={unit?.unitNumber} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="e.g. 101" />
        </div>
        <div>
          <label htmlFor="floorNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Floor</label>
          <input id="floorNumber" name="floorNumber" type="number" min={0} defaultValue={unit?.floorNumber ?? 0} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="unitType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
          <select id="unitType" name="unitType" defaultValue={unit?.unitType ?? 'ROOM'} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
            {unitTypes.map((t) => (
              <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
          <select id="status" name="status" defaultValue={unit?.status ?? 'AVAILABLE'} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white">
            {statuses.map((s) => (
              <option key={s} value={s}>{UNIT_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sizeSqm" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Size (m²)</label>
          <input id="sizeSqm" name="sizeSqm" type="number" step="0.01" min={0} defaultValue={unit?.sizeSqm ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="rentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rent amount</label>
          <input id="rentAmount" name="rentAmount" type="number" step="0.01" min={0} defaultValue={unit?.rentAmount ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="leaseStart" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lease start</label>
          <input id="leaseStart" name="leaseStart" type="date" defaultValue={unit ? toInputDate(unit.leaseStart) : ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="leaseEnd" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lease end</label>
          <input id="leaseEnd" name="leaseEnd" type="date" defaultValue={unit ? toInputDate(unit.leaseEnd) : ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
          <textarea id="notes" name="notes" rows={2} defaultValue={unit?.notes ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <SubmitButton label={isEditing ? 'Save' : 'Create unit'} />
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