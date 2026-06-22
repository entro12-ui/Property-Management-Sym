import Link from 'next/link';
import { getBuildings, deleteBuilding } from '@/app/actions/buildings';
import { DeleteEntityButton } from '@/components/ui/TableRowActions';
import { Plus } from 'lucide-react';

export default async function BuildingsPage() {
  const buildings = await getBuildings();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Buildings</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Manage your properties</p>
        </div>
        <Link
          href="/dashboard/buildings/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add building
        </Link>
      </div>

      <div className="mt-6 table-shell">
        {buildings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No buildings yet. Add your first building to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Floors</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Units</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {buildings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                    <Link href={`/dashboard/buildings/${b.id}`} className="hover:underline">
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {b.address}, {b.city}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {b.numberOfFloors}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {b._count.units}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/buildings/${b.id}/edit`}
                        className="text-sky-500 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteEntityButton
                        action={deleteBuilding.bind(null, b.id)}
                        confirmMessage={`Delete "${b.name}"? All units and related records for this building will be permanently removed.`}
                      />
                    </div>
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
