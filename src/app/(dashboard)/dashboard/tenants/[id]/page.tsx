import Link from 'next/link';
import { getTenant } from '@/app/actions/tenants';
import { prisma } from '@/lib/db';
import { formatDate, formatCurrency } from '@/lib/utils';
import { formatPeriodLabel } from '@/lib/billing-utils';
import { getServerI18n } from '@/i18n/server';
import { TenantDocumentManager } from '@/components/tenants/TenantDocumentManager';

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, labels } = await getServerI18n();
  const tenant = await getTenant(id);
  const payments = await prisma.payment.findMany({
    where: { invoice: { tenantId: id } },
    orderBy: { paidAt: 'desc' },
    take: 20,
    include: { invoice: true },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{tenant.user.fullName}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{tenant.user.email}</p>
          <span className="mt-2 inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
            {labels.tenantStatus[tenant.tenantStatus]}
          </span>
        </div>
        <Link href={`/dashboard/tenants/${id}/edit`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600">{t('tenants.editTenant')}</Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">{t('tenants.contactIdentity')}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-slate-500">{t('common.phone')}</dt><dd>{tenant.user.phone ?? '—'}</dd></div>
            <div><dt className="text-slate-500">{t('common.address')}</dt><dd>{tenant.address ?? '—'}</dd></div>
            <div><dt className="text-slate-500">{t('tenants.nationalId')}</dt><dd>{tenant.nationalId ?? '—'}</dd></div>
            <div><dt className="text-slate-500">{t('tenants.occupation')}</dt><dd>{tenant.occupation ?? '—'}</dd></div>
            <div><dt className="text-slate-500">{t('tenants.emergencyContact')}</dt><dd>{tenant.emergencyContact ?? '—'}</dd></div>
            <div><dt className="text-slate-500">{t('tenants.emergencyPhone')}</dt><dd>{tenant.emergencyPhone ?? '—'}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">{t('tenants.roomAssignment')}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-slate-500">{t('tenants.currentRoom')}</dt><dd>{tenant.unit ? `${tenant.unit.building.name} – ${t('common.room')} ${tenant.unit.unitNumber} (${t('common.floor')} ${tenant.unit.floorNumber})` : '—'}</dd></div>
            <div><dt className="text-slate-500">{t('tenants.moveIn')}</dt><dd>{tenant.moveInDate ? formatDate(tenant.moveInDate) : '—'}</dd></div>
            <div><dt className="text-slate-500">{t('tenants.moveOut')}</dt><dd>{tenant.moveOutDate ? formatDate(tenant.moveOutDate) : '—'}</dd></div>
          </dl>
        </div>
      </div>

      <div id="documents" className="mt-6 scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white">{t('tenants.leaseDocuments')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('tenants.leaseDocumentsHint')}</p>
        {(tenant.leaseAgreementUrl || tenant.idDocumentUrl) && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="font-medium text-amber-900 dark:text-amber-200">{t('tenants.previouslyUploaded')}</p>
            <ul className="mt-2 space-y-1">
              {tenant.leaseAgreementUrl && (
                <li>
                  <a href={tenant.leaseAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline dark:text-sky-400">
                    {t('tenants.leaseAgreementFile')}
                  </a>
                </li>
              )}
              {tenant.idDocumentUrl && (
                <li>
                  <a href={tenant.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline dark:text-sky-400">
                    {t('tenants.idDocumentFile')}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <TenantDocumentManager tenantId={id} documents={tenant.documents} />
        </div>
      </div>

      {tenant.unitHistory.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">{t('tenants.roomHistory')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {tenant.unitHistory.map((h) => (
              <li key={h.id} className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
                <span>{t('common.room')} {h.unit.unitNumber} – {h.unit.building.name}</span>
                <span className="text-slate-500">{formatDate(h.assignedAt)}{h.vacatedAt ? ` → ${formatDate(h.vacatedAt)}` : ' (current)'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-semibold text-slate-900 dark:text-white">{t('tenants.paymentHistory')}</h2>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t('tenants.noPayments')}</p>
        ) : (
          <div className="mt-4 table-shell">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">{t('common.date')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">{t('common.amount')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">{t('tenants.period')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">{t('tenants.receiptNumber')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm">{formatDate(p.paidAt)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-sm">{formatPeriodLabel(p.invoice)}</td>
                    <td className="px-4 py-3 text-sm">{p.receiptNumber ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/dashboard/tenants" className="text-sky-500 hover:underline">{t('tenants.backToTenants')}</Link>
      </div>
    </div>
  );
}
