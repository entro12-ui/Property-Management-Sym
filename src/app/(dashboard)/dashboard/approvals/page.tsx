import { getAdminPendingApprovals } from '@/app/actions/admin-notifications';
import { AdminApprovalsPanel } from '@/components/admin/AdminApprovalsPanel';
import { Bell } from 'lucide-react';

export default async function AdminApprovalsPage() {
  const data = await getAdminPendingApprovals();
  const total =
    data.paymentProofs.length + data.leaveRequests.length + data.maintenanceRequests.length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-7 w-7 text-indigo-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pending approvals</h1>
          </div>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Review payment proofs, leave requests, and maintenance submissions from tenants.
          </p>
        </div>
        {total > 0 && (
          <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
            {total} awaiting review
          </span>
        )}
      </div>
      <div className="mt-6">
        <AdminApprovalsPanel {...data} />
      </div>
    </div>
  );
}
