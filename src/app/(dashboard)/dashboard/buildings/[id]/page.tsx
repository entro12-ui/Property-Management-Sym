import Link from 'next/link';
import { getBuilding, getBuildingFloorSummary } from '@/app/actions/buildings';
import { formatCurrency, toNumber } from '@/lib/utils';
import { floorLabel } from '@/types';
import { Plus, Pencil } from 'lucide-react';
import { FloorRoomGrid } from '@/components/units/FloorRoomGrid';
import { FloorOccupancyChart } from '@/components/dashboard/FinancialCharts';
import { isImageProofUrl } from '@/lib/upload-utils';

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [building, floorSummary] = await Promise.all([getBuilding(id), getBuildingFloorSummary(id)]);

  const chartData = Object.entries(floorSummary).map(([floor, stats]) => ({
    floor: floorLabel(Number(floor)),
    occupied: stats.occupied,
    vacant: stats.vacant,
    reserved: stats.reserved,
    maintenance: stats.maintenance,
  }));

  const totalUnits = building.units.length;
  const occupied = building.units.filter((u) => u.status === 'OCCUPIED').length;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{building.name}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {building.address}, {building.city}, {building.state} {building.zipCode}
          </p>
          <p className="mt-1 text-sm text-sky-600 dark:text-sky-400">
            {occupied}/{totalUnits} rooms occupied ({totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0}%)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/buildings/${id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <Link href={`/dashboard/units/new?buildingId=${id}`} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
            <Plus className="h-4 w-4" /> Add room
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {building.photoUrl && isImageProofUrl(building.photoUrl) && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={building.photoUrl}
              alt={`${building.name} photo`}
              className="max-h-80 w-full object-cover"
            />
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Building details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-slate-500">Floors</dt><dd>{building.numberOfFloors} (Ground + {Math.max(0, building.numberOfFloors - 1)})</dd></div>
            <div><dt className="text-slate-500">Planned rooms</dt><dd>{building.numberOfRooms ?? '—'}</dd></div>
            <div><dt className="text-slate-500">Rooms added</dt><dd>{totalUnits}</dd></div>
            <div><dt className="text-slate-500">Area</dt><dd>{building.areaHectares != null ? `${toNumber(building.areaHectares)} ha` : '—'}</dd></div>
            <div><dt className="text-slate-500">Security room</dt><dd>{building.hasSecurityRoom ? 'Yes' : 'No'}</dd></div>
            {building.yearBuilt && <div><dt className="text-slate-500">Year built</dt><dd>{building.yearBuilt}</dd></div>}
            <div><dt className="text-slate-500">Parking spaces</dt><dd>{building.parkingSpaces}</dd></div>
            <div><dt className="text-slate-500">Country</dt><dd>{building.country}</dd></div>
            {building.utilitiesInfo && <div><dt className="text-slate-500">Utilities</dt><dd>{building.utilitiesInfo}</dd></div>}
            {building.notes && <div><dt className="text-slate-500">Notes</dt><dd>{building.notes}</dd></div>}
          </dl>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Floor occupancy overview</h2>
          <div className="mt-4">
            <FloorOccupancyChart data={chartData} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Rooms by floor</h2>
        <div className="mt-4">
          <FloorRoomGrid
            units={building.units.map((u) => ({
              id: u.id,
              unitNumber: u.unitNumber,
              floorNumber: u.floorNumber,
              rentAmount: toNumber(u.rentAmount),
              status: u.status,
              tenant: u.tenant,
            }))}
            buildingId={id}
          />
        </div>
      </div>
    </div>
  );
}
