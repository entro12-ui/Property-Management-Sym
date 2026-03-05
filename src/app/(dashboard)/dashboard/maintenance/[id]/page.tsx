import Link from 'next/link';
import { getMaintenanceRequest } from '@/app/actions/maintenance';
import { MAINTENANCE_STATUS_LABELS, URGENCY_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { UpdateMaintenanceStatusForm } from '@/components/maintenance/UpdateMaintenanceStatusForm';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();
  const request = await getMaintenanceRequest(id);
  const isAdmin = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'].includes(user.role);
  const managers = isAdmin
    ? await prisma.user.findMany({
        where: { role: { in: ['PROPERTY_MANAGER', 'BUILDING_OWNER', 'SUPER_ADMIN'] } },
        select: { id: true, fullName: true },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{request.title}</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        {request.unit.building.name} – Unit {request.unit.unitNumber} · {URGENCY_LABELS[request.urgency]} · {MAINTENANCE_STATUS_LABELS[request.status]}
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">{request.description}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Requested by</dt>
            <dd>{request.requestedBy?.fullName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Created</dt>
            <dd>{formatDate(request.createdAt)}</dd>
          </div>
          {request.assignedTo && (
            <div>
              <dt className="text-slate-500">Assigned to</dt>
              <dd>{request.assignedTo.fullName}</dd>
            </div>
          )}
          {request.cost != null && (
            <div>
              <dt className="text-slate-500">Cost</dt>
              <dd>{formatCurrency(request.cost)}</dd>
            </div>
          )}
          {request.completedAt && (
            <div>
              <dt className="text-slate-500">Completed</dt>
              <dd>{formatDate(request.completedAt)}</dd>
            </div>
          )}
        </dl>
      </div>

      {isAdmin && (
        <div className="mt-8">
          <UpdateMaintenanceStatusForm requestId={id} currentStatus={request.status} technicians={managers} />
        </div>
      )}

      <div className="mt-6">
        <Link href="/dashboard/maintenance" className="text-sky-500 hover:underline">
          ← Back to maintenance
        </Link>
      </div>
    </div>
  );
}
