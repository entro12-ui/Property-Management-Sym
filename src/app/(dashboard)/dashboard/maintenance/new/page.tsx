import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MaintenanceRequestForm } from '@/components/maintenance/MaintenanceRequestForm';

export default async function NewMaintenancePage() {
  const user = await requireAuth();
  const tenantProfile = user.tenantProfileId
    ? await prisma.tenantProfile.findUnique({
        where: { id: user.tenantProfileId },
        include: { unit: { include: { building: true } } },
      })
    : null;

  const buildings = await prisma.building.findMany({
    include: { units: { select: { id: true, unitNumber: true, floorNumber: true } } },
    orderBy: { name: 'asc' },
  });
  const unitOptions = buildings.flatMap((b) =>
    b.units.map((u) => ({ id: u.id, label: `${b.name} – Unit ${u.unitNumber}` }))
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New maintenance request</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Report an issue</p>
      <div className="mt-6 max-w-xl">
        <MaintenanceRequestForm
          unitOptions={unitOptions}
          defaultUnitId={tenantProfile?.unitId ?? undefined}
        />
      </div>
    </div>
  );
}
