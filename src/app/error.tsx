'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { formatServerError, reloadPage } from '@/lib/format-server-error';

export default function RootError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const formatted = formatServerError(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-900">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{formatted.title}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{formatted.message}</p>
        {formatted.hint && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{formatted.hint}</p>
        )}
        {error.digest && (
          <p className="mt-3 text-xs text-slate-400">Error reference: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reloadPage}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}
