import { getTenant } from '@/app/actions/tenants';
import { TenantForm } from '@/components/tenants/TenantForm';
import { updateTenant } from '@/app/actions/tenants';

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getTenant(id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit tenant</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{tenant.user.fullName}</p>
      <div className="mt-6 max-w-2xl">
        <TenantForm
          users={[]}
          units={[]}
          tenant={{
            businessType: tenant.businessType,
            emergencyContact: tenant.emergencyContact,
            emergencyPhone: tenant.emergencyPhone,
            moveInDate: tenant.moveInDate,
            moveOutDate: tenant.moveOutDate,
            idDocumentUrl: tenant.idDocumentUrl,
            leaseAgreementUrl: tenant.leaseAgreementUrl,
            userId: tenant.userId,
            unitId: tenant.unitId,
          }}
          action={(formData) => updateTenant(id, formData)}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
