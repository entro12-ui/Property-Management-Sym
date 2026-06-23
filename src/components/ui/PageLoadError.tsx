'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { reloadPage } from '@/lib/format-server-error';

type PageLoadErrorProps = {
  title: string;
  message: string;
  hint?: string;
  reference?: string;
};

export function PageLoadError({ title, message, hint, reference }: PageLoadErrorProps) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        {hint && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
        {reference && <p className="mt-3 text-xs text-slate-400">Error reference: {reference}</p>}
        <button
          type="button"
          onClick={reloadPage}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
