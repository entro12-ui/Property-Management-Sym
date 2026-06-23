'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/providers/LocaleProvider';
import { CheckCircle2, FileText, ImageIcon, Loader2, UploadCloud, X, AlertCircle } from 'lucide-react';
import { isImageProof } from '@/lib/upload-utils';

export type FileUploadZoneProps = {
  label: string;
  description?: string;
  accept?: string;
  hint?: string;
  disabled?: boolean;
  fileUrl?: string | null;
  fileName?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
};

export function FileUploadZone({
  label,
  description,
  accept = '.pdf,image/jpeg,image/png,image/jpg',
  hint,
  disabled = false,
  fileUrl,
  fileName,
  onUpload,
  onRemove,
}: FileUploadZoneProps) {
  const { t } = useLocale();
  const uploadHint = hint ?? t('upload.hint');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<{ name: string; size: number } | null>(null);

  const hasFile = Boolean(fileUrl);

  const processFile = useCallback(
    async (file: File) => {
      if (disabled || uploading) return;
      setError(null);

      const maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(t('upload.fileTooLarge'));
        return;
      }

      setUploading(true);
      setLastFile({ name: file.name, size: file.size });
      try {
        await onUpload(file);
      } catch {
        setError(t('upload.uploadFailed'));
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [disabled, uploading, onUpload, t]
  );

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!disabled && !uploading) setDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  const displayName = fileName ?? lastFile?.name;
  const showImagePreview = Boolean(fileUrl && isImageProof(displayName, fileUrl));

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>

      {hasFile && !uploading ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          {showImagePreview ? (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-emerald-200 bg-white dark:border-emerald-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileUrl!} alt={displayName ?? 'Receipt preview'} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              {fileUrl && isImageProof(displayName, fileUrl) ? (
                <ImageIcon className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{displayName ?? 'Uploaded file'}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">{t('upload.readyToSave')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/50"
              >
                {t('common.preview')}
              </a>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('common.replace')}
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/80 hover:text-red-500 dark:hover:bg-slate-800"
                aria-label={t('common.remove')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            'group relative w-full rounded-xl border-2 border-dashed px-6 py-8 text-center transition',
            dragging
              ? 'border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/40'
              : 'border-slate-200 bg-slate-50/50 hover:border-sky-300 hover:bg-sky-50/50 dark:border-slate-600 dark:bg-slate-800/30 dark:hover:border-sky-600 dark:hover:bg-sky-950/20',
            (disabled || uploading) && 'cursor-not-allowed opacity-60'
          )}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:ring-sky-200 dark:bg-slate-800 dark:ring-slate-600 dark:group-hover:ring-sky-800">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
            ) : dragging ? (
              <CheckCircle2 className="h-6 w-6 text-sky-500" />
            ) : (
              <UploadCloud className="h-6 w-6 text-slate-400 transition group-hover:text-sky-500" />
            )}
          </div>
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            {uploading ? t('upload.uploading') : dragging ? t('upload.dropHere') : t('upload.dragDrop')}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {uploading ? t('upload.uploadingHint') : (
              <>{t('common.or')} <span className="font-medium text-sky-600 dark:text-sky-400">{t('upload.browse')}</span></>
            )}
          </p>
          {!uploading && <p className="mt-2 text-xs text-slate-400">{uploadHint}</p>}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled || uploading}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
