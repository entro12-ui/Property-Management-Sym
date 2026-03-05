import { getUnit } from '@/app/actions/units';
import { getBuildings } from '@/app/actions/buildings';
import { updateUnit } from '@/app/actions/units';
import { UnitForm } from '@/components/units/UnitForm';

export default async function EditUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [unit, buildings] = await Promise.all([getUnit(id), getBuildings()]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit unit</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{unit.building.name} – Unit {unit.unitNumber}</p>
      <div className="mt-6 max-w-2xl">
        <UnitForm
          buildings={buildings}
          unit={{
            id: unit.id,
            buildingId: unit.buildingId,
            unitNumber: unit.unitNumber,
            floorNumber: unit.floorNumber,
            unitType: unit.unitType,
            sizeSqm: unit.sizeSqm,
            rentAmount: unit.rentAmount,
            leaseStart: unit.leaseStart,
            leaseEnd: unit.leaseEnd,
            status: unit.status,
            notes: unit.notes,
          }}
          formAction={(formData) => updateUnit(id, formData)}
        />
      </div>
    </div>
  );
}
