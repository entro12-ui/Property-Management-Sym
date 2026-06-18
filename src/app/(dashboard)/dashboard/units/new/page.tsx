import { getBuildings } from '@/app/actions/buildings';
import { UnitForm } from '@/components/units/UnitForm';

export default async function NewUnitPage({
  searchParams,
}: {
  searchParams: Promise<{ buildingId?: string }>;
}) {
  const buildings = await getBuildings();
  const { buildingId } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add unit</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Create a new unit</p>
      <div className="mt-6 max-w-3xl">
        <UnitForm buildings={buildings} defaultBuildingId={buildingId ?? undefined} />
      </div>
    </div>
  );
}
