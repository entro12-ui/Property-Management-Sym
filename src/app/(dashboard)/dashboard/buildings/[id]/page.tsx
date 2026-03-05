import Link from 'next/link';
import { getBuilding } from '@/app/actions/buildings';
import { UNIT_STATUS_LABELS, UNIT_TYPE_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Pencil, DoorOpen } from 'lucide-react';

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const building = await getBuilding(id);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{building.name}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {building.address}, {building.city}, {building.state} {building.zipCode}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/buildings/${id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <Link href={`/dashboard/units/new?buildingId=${id}`} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
            <Plus className="h-4 w-4" /> Add unit
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-slate-500">Floors</dt><dd>{building.numberOfFloors}</dd></div>
            <div><dt className="text-slate-500">Parking spaces</dt><dd>{building.parkingSpaces}</dd></div>
            {building.utilitiesInfo && <div><dt className="text-slate-500">Utilities</dt><dd>{building.utilitiesInfo}</dd></div>}
            {building.notes && <div><dt className="text-slate-500">Notes</dt><dd>{building.notes}</dd></div>}
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Units</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {building.units.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No units. <Link href={`/dashboard/units/new?buildingId=${id}`} className="text-sky-500 hover:underline">Add a unit</Link>.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Rent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Lease end</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {building.units.map((u) => (
                  <tr key={u.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                      <Link href={`/dashboard/units/${u.id}`} className="hover:underline">#{u.unitNumber} (Floor {u.floorNumber})</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{UNIT_TYPE_LABELS[u.unitType]}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{Number(u.sizeSqm)} m²</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatCurrency(u.rentAmount)}</td>
                    <td className="px-4 py-3 text-sm">{UNIT_STATUS_LABELS[u.status]}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{u.leaseEnd ? formatDate(u.leaseEnd) : '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/dashboard/units/${u.id}/edit`} className="text-sky-500 hover:underline">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
