'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createBuilding } from '@/app/actions/buildings';

type BuildingData = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  zipCode: string | null;
  numberOfFloors: number;
  parkingSpaces: number;
  utilitiesInfo: string | null;
  notes: string | null;
};

type BuildingFormProps = {
  building?: BuildingData;
  buildings?: { id: string; name: string }[];
  formAction?: (formData: FormData) => void;
};

export function BuildingForm({ building, formAction }: BuildingFormProps) {
  const isEditing = !!building;

  return (
    <form
      action={isEditing ? formAction : (formData) => createBuilding(formData)}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
          <input id="name" name="name" required defaultValue={building?.name} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="e.g. Tower A" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
          <input id="address" name="address" required defaultValue={building?.address} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
          <input id="city" name="city" required defaultValue={building?.city} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
          <input id="state" name="state" defaultValue={building?.state ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300">ZIP</label>
          <input id="zipCode" name="zipCode" defaultValue={building?.zipCode ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="numberOfFloors" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Floors</label>
          <input id="numberOfFloors" name="numberOfFloors" type="number" min={1} defaultValue={building?.numberOfFloors ?? 1} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="parkingSpaces" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Parking spaces</label>
          <input id="parkingSpaces" name="parkingSpaces" type="number" min={0} defaultValue={building?.parkingSpaces ?? 0} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="utilitiesInfo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Utilities info</label>
          <textarea id="utilitiesInfo" name="utilitiesInfo" rows={2} defaultValue={building?.utilitiesInfo ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" placeholder="Water, electricity, etc." />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
          <textarea id="notes" name="notes" rows={2} defaultValue={building?.notes ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <SubmitButton label={isEditing ? 'Save' : 'Create building'} />
        <Link href="/dashboard/buildings" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300">Cancel</Link>
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
