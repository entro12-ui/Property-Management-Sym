import { getBuilding } from '@/app/actions/buildings';
import { BuildingForm } from '@/components/buildings/BuildingForm';

export default async function EditBuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const building = await getBuilding(id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit building</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{building.name}</p>
      <div className="mt-6 max-w-2xl">
        <BuildingForm
          building={{
            id: building.id,
            name: building.name,
            address: building.address,
            city: building.city,
            state: building.state,
            zipCode: building.zipCode,
            numberOfFloors: building.numberOfFloors,
            parkingSpaces: building.parkingSpaces,
            utilitiesInfo: building.utilitiesInfo,
            notes: building.notes,
          }}
        />
      </div>
    </div>
  );
}
