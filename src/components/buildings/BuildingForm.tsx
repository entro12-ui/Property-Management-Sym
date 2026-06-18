'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createBuilding, updateBuilding } from '@/app/actions/buildings';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { uploadBuildingPhotoFile } from '@/lib/client-upload';
import { BUILDING_PHOTO_ACCEPT } from '@/lib/upload-utils';

type BuildingData = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  zipCode: string | null;
  country: string;
  numberOfFloors: number;
  numberOfRooms: number | null;
  parkingSpaces: number;
  areaHectares: number | null;
  hasSecurityRoom: boolean;
  yearBuilt: number | null;
  photoUrl: string | null;
  utilitiesInfo: string | null;
  notes: string | null;
};

type BuildingFormProps = {
  building?: BuildingData;
};

export function BuildingForm({ building }: BuildingFormProps) {
  const isEditing = !!building;
  const [photoUrl, setPhotoUrl] = useState<string | null>(building?.photoUrl ?? null);
  const [photoName, setPhotoName] = useState<string | null>(
    building?.photoUrl ? 'Building photo' : null
  );
  const [hasSecurityRoom, setHasSecurityRoom] = useState(building?.hasSecurityRoom ?? false);

  async function handlePhotoUpload(file: File) {
    const data = await uploadBuildingPhotoFile(file);
    setPhotoUrl(data.url);
    setPhotoName(data.fileName);
  }

  return (
    <form
      action={async (formData) => {
        if (photoUrl) formData.set('photoUrl', photoUrl);
        formData.set('hasSecurityRoom', hasSecurityRoom ? 'true' : 'false');
        if (isEditing) {
          await updateBuilding(building.id, formData);
        } else {
          await createBuilding(formData);
        }
      }}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Basic information</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building name</label>
            <input id="name" name="name" required defaultValue={building?.name} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="e.g. Hibr Tower" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
            <input id="address" name="address" required defaultValue={building?.address} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
            <input id="city" name="city" required defaultValue={building?.city} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Region / State</label>
            <input id="state" name="state" defaultValue={building?.state ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="e.g. Addis Ababa" />
          </div>
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Postal code</label>
            <input id="zipCode" name="zipCode" defaultValue={building?.zipCode ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
            <input id="country" name="country" defaultValue={building?.country ?? 'Ethiopia'} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Building profile</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="numberOfFloors" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Number of floors</label>
            <input id="numberOfFloors" name="numberOfFloors" type="number" min={1} defaultValue={building?.numberOfFloors ?? 1} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label htmlFor="numberOfRooms" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Number of rooms</label>
            <input id="numberOfRooms" name="numberOfRooms" type="number" min={0} defaultValue={building?.numberOfRooms ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Planned total rooms" />
            <p className="mt-1 text-xs text-slate-500">Total rentable rooms in this building (may differ from rooms added later).</p>
          </div>
          <div>
            <label htmlFor="areaHectares" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Area of coverage (hectares)</label>
            <input id="areaHectares" name="areaHectares" type="number" step="0.0001" min={0} defaultValue={building?.areaHectares ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="e.g. 0.25" />
          </div>
          <div>
            <label htmlFor="yearBuilt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Year built</label>
            <input id="yearBuilt" name="yearBuilt" type="number" min={1800} max={2100} defaultValue={building?.yearBuilt ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="e.g. 2018" />
          </div>
          <div>
            <label htmlFor="parkingSpaces" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Parking spaces</label>
            <input id="parkingSpaces" name="parkingSpaces" type="number" min={0} defaultValue={building?.parkingSpaces ?? 0} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Security room available</span>
            <div className="mt-2 flex gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="hasSecurityRoomChoice"
                  checked={hasSecurityRoom}
                  onChange={() => setHasSecurityRoom(true)}
                />
                Yes
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="hasSecurityRoomChoice"
                  checked={!hasSecurityRoom}
                  onChange={() => setHasSecurityRoom(false)}
                />
                No
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <FileUploadZone
              label="Tower / building photo"
              description="Upload a photo of the building exterior (JPG, PNG, or WEBP)."
              accept={BUILDING_PHOTO_ACCEPT}
              fileUrl={photoUrl}
              fileName={photoName}
              onUpload={handlePhotoUpload}
              onRemove={() => {
                setPhotoUrl(null);
                setPhotoName(null);
              }}
            />
            {photoUrl && <input type="hidden" name="photoUrl" value={photoUrl} />}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Additional details</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="utilitiesInfo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Utilities info</label>
            <textarea id="utilitiesInfo" name="utilitiesInfo" rows={2} defaultValue={building?.utilitiesInfo ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Water, electricity, generator, etc." />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
            <textarea id="notes" name="notes" rows={2} defaultValue={building?.notes ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Access instructions, landmarks, management notes…" />
          </div>
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <SubmitButton label={isEditing ? 'Save changes' : 'Create building'} />
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
