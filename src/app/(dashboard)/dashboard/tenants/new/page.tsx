import Link from 'next/link';
import { prisma } from '@/lib/db';
import { TenantForm } from '@/components/tenants/TenantForm';
import { getServerI18n } from '@/i18n/server';

export default async function NewTenantPage() {
  const { t } = await getServerI18n();
  const buildingsWithUnits = await prisma.building.findMany({
    include: { units: { where: { status: 'AVAILABLE' }, select: { id: true, unitNumber: true } } },
    orderBy: { name: 'asc' },
  });
  const unitOptions = buildingsWithUnits.flatMap((b) =>
    b.units.map((u) => ({ id: u.id, label: `${b.name} – Unit ${u.unitNumber}` }))
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('tenants.addTenant')}</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{t('tenants.addTenantHint')}</p>
      {unitOptions.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-300">{t('tenants.noAvailableUnits')}</p>
          <Link href="/dashboard/tenants" className="mt-4 inline-block text-sky-500 hover:underline">{t('tenants.backToTenants')}</Link>
        </div>
      ) : (
        <div className="mt-6 max-w-2xl">
          <TenantForm units={unitOptions} submitLabel={t('tenants.createTenant')} />
        </div>
      )}
    </div>
  );
}
