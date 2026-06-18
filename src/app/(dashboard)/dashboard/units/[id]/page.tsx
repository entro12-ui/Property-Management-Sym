import Link from 'next/link';
import { getUnit } from '@/app/actions/units';
import { UNIT_TYPE_LABELS, UNIT_STATUS_LABELS, INVOICE_STATUS_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { formatQuarterlySchedule } from '@/lib/billing-utils';

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const unit = await getUnit(id);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {unit.building.name} – Unit {unit.unitNumber}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Floor {unit.floorNumber} · {UNIT_TYPE_LABELS[unit.unitType]} · {UNIT_STATUS_LABELS[unit.status]}
          </p>
        </div>
        <Link href={`/dashboard/units/${id}/edit`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600">
          Edit unit
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-slate-500">Size</dt><dd>{Number(unit.sizeSqm)} m²</dd></div>
            <div><dt className="text-slate-500">Rent</dt><dd>{formatCurrency(unit.rentAmount)} / month</dd></div>
            <div><dt className="text-slate-500">Quarterly rent due</dt><dd>{unit.quarterlyRentDueDate ? formatDate(unit.quarterlyRentDueDate) : '—'}</dd></div>
            {unit.quarterlyRentDueDate && (
              <div><dt className="text-slate-500">Upcoming due dates</dt><dd className="text-slate-700 dark:text-slate-300">{formatQuarterlySchedule(new Date(unit.quarterlyRentDueDate))}</dd></div>
            )}
            <div><dt className="text-slate-500">Lease start</dt><dd>{unit.leaseStart ? formatDate(unit.leaseStart) : '—'}</dd></div>
            <div><dt className="text-slate-500">Lease end</dt><dd>{unit.leaseEnd ? formatDate(unit.leaseEnd) : '—'}</dd></div>
            {unit.notes && <div><dt className="text-slate-500">Notes</dt><dd>{unit.notes}</dd></div>}
          </dl>
        </div>
        {unit.tenant && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Tenant</h2>
            <p className="mt-1 font-medium">{unit.tenant.user.fullName}</p>
            <p className="text-sm text-slate-500">{unit.tenant.user.email}</p>
            {unit.tenant.businessType && <p className="mt-1 text-sm text-slate-600">Business: {unit.tenant.businessType}</p>}
            <Link href={`/dashboard/tenants/${unit.tenant.id}`} className="mt-2 inline-block text-sm text-sky-500 hover:underline">View tenant</Link>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent invoices</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {unit.invoices && unit.invoices.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {unit.invoices.slice(0, 10).map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 text-sm">{inv.month}/{inv.year}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3 text-sm">{INVOICE_STATUS_LABELS[inv.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500">No invoices for this unit yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
