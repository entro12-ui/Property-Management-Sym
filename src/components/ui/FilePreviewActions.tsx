import { Download, Eye } from 'lucide-react';

export function FilePreviewActions({
  fileUrl,
  fileName,
  previewLabel = 'Preview',
  downloadLabel = 'Download',
}: {
  fileUrl: string;
  fileName?: string | null;
  previewLabel?: string;
  downloadLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:border-slate-600 dark:text-sky-400 dark:hover:bg-sky-950/30"
      >
        <Eye className="h-3.5 w-3.5" /> {previewLabel}
      </a>
      <a
        href={fileUrl}
        download={fileName ?? undefined}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
      >
        <Download className="h-3.5 w-3.5" /> {downloadLabel}
      </a>
    </div>
  );
}
