import Link from 'next/link';
import { getUnits } from '@/app/actions/units';
import { UNIT_TYPE_LABELS, UNIT_STATUS_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default async function UnitsPage() {
  const units = await getUnits();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Units</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">All units across buildings</p>
        </div>
        <Link
          href="/dashboard/units/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          <Plus className="h-4 w-4" /> Add unit
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {units.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No units yet. Add a building first, then add units.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Building / Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Rent</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Tenant</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/units/${u.id}`} className="font-medium text-slate-900 dark:text-white hover:underline">
                      {u.building.name} – #{u.unitNumber}
                    </Link>
                    <span className="ml-1 text-slate-500">(Floor {u.floorNumber})</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{UNIT_TYPE_LABELS[u.unitType]}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatCurrency(u.rentAmount)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{UNIT_STATUS_LABELS[u.status]}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {u.tenant?.user?.fullName ?? '—'}
                  </td>
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
  );
}
