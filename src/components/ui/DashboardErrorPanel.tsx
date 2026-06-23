'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { formatServerError, reloadPage } from '@/lib/format-server-error';

const PAGE_LABELS: Record<string, string> = {
  '/dashboard/tenants': 'Tenants',
  '/dashboard/units': 'Units',
  '/dashboard/invoices': 'Invoices',
  '/dashboard': 'Dashboard',
};

function pageLabelFromPath(pathname: string): string | undefined {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  const match = Object.entries(PAGE_LABELS).find(([path]) => pathname.startsWith(`${path}/`));
  return match?.[1];
}

export function DashboardErrorPanel({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const pathname = usePathname();

  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  const formatted = formatServerError(error, pageLabelFromPath(pathname ?? ''));

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{formatted.title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{formatted.message}</p>
        {formatted.hint && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{formatted.hint}</p>
        )}
        {error.digest && (
          <p className="mt-3 text-xs text-slate-400">Error reference: {error.digest}</p>
        )}
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
