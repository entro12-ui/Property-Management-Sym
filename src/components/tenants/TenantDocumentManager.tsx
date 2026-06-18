'use client';

import { useCallback, useState } from 'react';
import { uploadTenantDocument } from '@/app/actions/tenants';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { DocumentType } from '@prisma/client';
import { Download, Eye, FileStack } from 'lucide-react';
import { FileUploadZone } from '@/components/ui/FileUploadZone';

const DOC_TYPES: DocumentType[] = [
  'NATIONAL_ID_FRONT',
  'NATIONAL_ID_BACK',
  'LEASE_AGREEMENT',
  'RENTAL_AGREEMENT',
  'OTHER',
];

type Doc = {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  version: number;
  createdAt: Date;
  uploadedBy?: { fullName: string } | null;
};

export function TenantDocumentManager({ tenantId, documents }: { tenantId: string; documents: Doc[] }) {
  const { t, labels } = useLocale();
  const [docs, setDocs] = useState(documents);
  const [docType, setDocType] = useState<DocumentType>('LEASE_AGREEMENT');

  const handleUpload = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('type', 'tenant-doc');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();

      const uploadFd = new FormData();
      uploadFd.set('tenantId', tenantId);
      uploadFd.set('type', docType);
      uploadFd.set('fileName', file.name);
      uploadFd.set('fileUrl', url);
      uploadFd.set('mimeType', file.type);
      const doc = await uploadTenantDocument(uploadFd);
      setDocs((prev) => [doc as Doc, ...prev]);
    },
    [tenantId, docType]
  );

  const grouped = DOC_TYPES.map((type) => ({
    type,
    items: docs.filter((d) => d.type === type).sort((a, b) => b.version - a.version),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-4">
          <label htmlFor="doc-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('upload.documentType')}
          </label>
          <select
            id="doc-type"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            className="mt-1.5 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>{labels.documentType[type]}</option>
            ))}
          </select>
        </div>
        <FileUploadZone
          label={t('upload.uploadDocument')}
          description={`${labels.documentType[docType]} — ${t('upload.version').toLowerCase()}`}
          accept=".pdf,image/jpeg,image/png,image/jpg"
          onUpload={handleUpload}
        />
      </div>

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-700">
          <FileStack className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">{t('upload.noDocuments')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('upload.noDocumentsHint')}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ type, items }) => (
            <div key={type}>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{labels.documentType[type]}</h3>
              <ul className="mt-2 space-y-2">
                {items.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-white">{doc.fileName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t('upload.version')} {doc.version}
                        {doc.uploadedBy && <> · {t('upload.uploadedBy')} {doc.uploadedBy.fullName}</>}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:border-slate-600 dark:text-sky-400 dark:hover:bg-sky-950/30"
                      >
                        <Eye className="h-3.5 w-3.5" /> {t('common.preview')}
                      </a>
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                      >
                        <Download className="h-3.5 w-3.5" /> {t('common.download')}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
