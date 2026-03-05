import { getBuildings } from '@/app/actions/buildings';
import { AnnouncementForm } from '@/components/announcements/AnnouncementForm';

export default async function NewAnnouncementPage() {
  const buildings = await getBuildings();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New announcement</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Send a notice to tenants</p>
      <div className="mt-6 max-w-xl">
        <AnnouncementForm buildings={buildings} />
      </div>
    </div>
  );
}
