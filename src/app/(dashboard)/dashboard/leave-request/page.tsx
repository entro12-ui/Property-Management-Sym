import { getMyLeaveRequests } from '@/app/actions/leave-requests';
import { requireAuth } from '@/lib/auth';
import { LeaveRequestPanel } from '@/components/tenant/LeaveRequestPanel';
import { redirect } from 'next/navigation';

export default async function LeaveRequestPage() {
  const user = await requireAuth();
  if (user.role !== 'TENANT') redirect('/dashboard');

  const requests = await getMyLeaveRequests();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave request</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Request to vacate your room with at least two months notice.
      </p>
      <div className="mt-6">
        <LeaveRequestPanel requests={requests} hasUnit={!!user.unitId} />
      </div>
    </div>
  );
}
