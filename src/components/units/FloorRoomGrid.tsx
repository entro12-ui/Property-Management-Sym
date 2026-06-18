'use client';

import Link from 'next/link';
import { UNIT_STATUS_LABELS } from '@/types';
import { floorLabel } from '@/types';
import { formatCurrency } from '@/lib/utils';
import type { UnitStatus } from '@prisma/client';

type Unit = {
  id: string;
  unitNumber: string;
  floorNumber: number;
  rentAmount: { toString(): string } | number;
  status: UnitStatus;
  tenant?: { user: { fullName: string } } | null;
};

export function FloorRoomGrid({ units, buildingId }: { units: Unit[]; buildingId: string }) {
  const floors = [...new Set(units.map((u) => u.floorNumber))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {floors.map((floor) => {
        const floorUnits = units.filter((u) => u.floorNumber === floor);
        const occupied = floorUnits.filter((u) => u.status === 'OCCUPIED').length;
        return (
          <div key={floor} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">{floorLabel(floor)}</h3>
              <span className="text-sm text-slate-500">{occupied}/{floorUnits.length} occupied</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {floorUnits.map((u) => (
                <Link
                  key={u.id}
                  href={`/dashboard/units/${u.id}`}
                  className={`rounded-lg border p-3 text-sm transition hover:shadow-md ${statusColor(u.status)}`}
                >
                  <div className="font-medium">Room {u.unitNumber}</div>
                  <div className="mt-1 text-xs opacity-80">{UNIT_STATUS_LABELS[u.status]}</div>
                  <div className="mt-1 text-xs">{formatCurrency(u.rentAmount)}/mo</div>
                  {u.tenant && <div className="mt-1 truncate text-xs font-medium">{u.tenant.user.fullName}</div>}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function statusColor(status: UnitStatus): string {
  switch (status) {
    case 'OCCUPIED':
      return 'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-900/20';
    case 'AVAILABLE':
      return 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800';
    case 'RESERVED':
      return 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20';
    case 'MAINTENANCE':
      return 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20';
    default:
      return 'border-slate-200 bg-white';
  }
}
