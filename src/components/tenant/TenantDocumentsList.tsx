import Link from 'next/link';
import { DOCUMENT_TYPE_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import type { DocumentType } from '@prisma/client';
import { Download, Eye, FileStack } from 'lucide-react';

type DocumentRow = {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  version: number;
  createdAt: Date;
  uploadedBy?: { fullName: string } | null;
};

type LegacyDoc = {
  label: string;
  url: string;
};

export function TenantDocumentsList({
  documents,
  legacyDocs,
}: {
  documents: DocumentRow[];
  legacyDocs: LegacyDoc[];
}) {
  const grouped = Object.entries(
    documents.reduce<Record<string, DocumentRow[]>>((acc, doc) => {
      const key = doc.type;
      acc[key] = acc[key] ?? [];
      acc[key].push(doc);
      return acc;
    }, {})
  ).map(([type, items]) => ({
    type: type as DocumentType,
    items: items.sort((a, b) => b.version - a.version),
  }));

  const hasContent = grouped.length > 0 || legacyDocs.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
        <FileStack className="mx-auto h-10 w-10 text-slate-400" />
        <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">No documents available yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Lease agreements and ID documents uploaded by your property manager will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {legacyDocs.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">On file</h2>
          <ul className="mt-4 space-y-2">
            {legacyDocs.map((doc) => (
              <li key={doc.url}>
                <DocLink label={doc.label} url={doc.url} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {grouped.map(({ type, items }) => (
        <section
          key={type}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-700/50">
            <h2 className="font-semibold text-slate-900 dark:text-white">{DOCUMENT_TYPE_LABELS[type]}</h2>
          </div>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {items.map((doc) => (
              <li key={doc.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{doc.fileName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Version {doc.version} · {formatDate(doc.createdAt)}
                    {doc.uploadedBy ? ` · ${doc.uploadedBy.fullName}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Eye className="h-4 w-4" /> View
                  </a>
                  <a
                    href={doc.fileUrl}
                    download={doc.fileName}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-600"
                  >
                    <Download className="h-4 w-4" /> Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-600">
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</span>
      <div className="flex gap-2">
        <Link
          href={url}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-sky-500 hover:underline"
        >
          <Eye className="h-4 w-4" /> View
        </Link>
        <a href={url} download className="inline-flex items-center gap-1 text-sm text-sky-500 hover:underline">
          <Download className="h-4 w-4" /> Download
        </a>
      </div>
    </div>
  );
}
