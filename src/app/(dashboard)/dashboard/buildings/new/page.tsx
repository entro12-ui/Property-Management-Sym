import { BuildingForm } from '@/components/buildings/BuildingForm';

export default function NewBuildingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add building</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Create a new building</p>
      <div className="mt-6 max-w-2xl">
        <BuildingForm />
      </div>
    </div>
  );
}
