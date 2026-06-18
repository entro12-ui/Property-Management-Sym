import { getMyDocuments } from '@/app/actions/tenant-portal';
import { TenantDocumentsList } from '@/components/tenant/TenantDocumentsList';

export default async function TenantDocumentsPage() {
  const profile = await getMyDocuments();

  const legacyDocs = [
    profile.leaseAgreementUrl
      ? { label: 'Lease agreement (on file)', url: profile.leaseAgreementUrl }
      : null,
    profile.idDocumentUrl ? { label: 'ID document (on file)', url: profile.idDocumentUrl } : null,
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Documents</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        View and download your lease agreements and other documents on file.
      </p>
      <div className="mt-6">
        <TenantDocumentsList documents={profile.documents} legacyDocs={legacyDocs} />
      </div>
    </div>
  );
}
