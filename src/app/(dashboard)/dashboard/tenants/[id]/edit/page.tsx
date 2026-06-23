import { getTenant } from '@/app/actions/tenants';
import { TenantForm } from '@/components/tenants/TenantForm';
import { getServerI18n } from '@/i18n/server';

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getServerI18n();
  const tenant = await getTenant(id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('tenants.editTenant')}</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{tenant.user.email}</p>
      <div className="mt-6 max-w-2xl">
        <TenantForm
          users={[]}
          units={[]}
          tenant={{
            id: tenant.id,
            fullName: tenant.user.fullName,
            email: tenant.user.email,
            phone: tenant.user.phone,
            address: tenant.address,
            nationalId: tenant.nationalId,
            tinNumber: tenant.tinNumber,
            occupation: tenant.occupation,
            businessType: tenant.businessType,
            tenantStatus: tenant.tenantStatus,
            emergencyContact: tenant.emergencyContact,
            emergencyPhone: tenant.emergencyPhone,
            moveInDate: tenant.moveInDate,
            moveOutDate: tenant.moveOutDate,
            idDocumentUrl: tenant.idDocumentUrl,
            leaseAgreementUrl: tenant.leaseAgreementUrl,
            licenseUrl: tenant.licenseUrl,
            userId: tenant.userId,
            unitId: tenant.unitId,
          }}
          submitLabel={t('tenants.saveChanges')}
        />
      </div>
    </div>
  );
}
