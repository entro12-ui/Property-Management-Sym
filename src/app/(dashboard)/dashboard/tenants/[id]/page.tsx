import Link from 'next/link';
import { getTenant } from '@/app/actions/tenants';
import { prisma } from '@/lib/db';
import { formatDate, formatCurrency } from '@/lib/utils';

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getTenant(id);
  const payments = await prisma.payment.findMany({
    where: { invoice: { tenantId: id } },
    orderBy: { paidAt: 'desc' },
    take: 20,
    include: { invoice: { select: { month: true, year: true } } },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{tenant.user.fullName}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{tenant.user.email}</p>
        </div>
        <Link href={`/dashboard/tenants/${id}/edit`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600">Edit tenant</Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Contact</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-slate-500">Phone</dt><dd>{tenant.user.phone ?? '—'}</dd></div>
            <div><dt className="text-slate-500">Emergency contact</dt><dd>{tenant.emergencyContact ?? '—'}</dd></div>
            <div><dt className="text-slate-500">Emergency phone</dt><dd>{tenant.emergencyPhone ?? '—'}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Lease</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-slate-500">Business type</dt><dd>{tenant.businessType ?? '—'}</dd></div>
            <div><dt className="text-slate-500">Unit</dt><dd>{tenant.unit ? `${tenant.unit.building.name} – Unit ${tenant.unit.unitNumber}` : '—'}</dd></div>
            <div><dt className="text-slate-500">Move-in</dt><dd>{tenant.moveInDate ? formatDate(tenant.moveInDate) : '—'}</dd></div>
            <div><dt className="text-slate-500">Move-out</dt><dd>{tenant.moveOutDate ? formatDate(tenant.moveOutDate) : '—'}</dd></div>
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white">Documents</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {tenant.idDocumentUrl ? <li><a href={tenant.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">ID / License</a></li> : <li className="text-slate-500">No ID uploaded</li>}
          {tenant.leaseAgreementUrl ? <li><a href={tenant.leaseAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">Lease agreement (PDF)</a></li> : <li className="text-slate-500">No lease uploaded</li>}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold text-slate-900 dark:text-white">Payment history</h2>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No payments yet.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm">{formatDate(p.paidAt)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-sm">{p.invoice.month}/{p.invoice.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/dashboard/tenants" className="text-sky-500 hover:underline">← Back to tenants</Link>
      </div>
    </div>
  );
}
