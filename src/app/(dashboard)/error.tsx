'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function isDatabaseError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("can't reach database") ||
    lower.includes('connection') ||
    lower.includes('econnrefused') ||
    lower.includes('timed out') ||
    lower.includes('p1001') ||
    lower.includes('p1002') ||
    lower.includes('p1017')
  );
}

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  const dbIssue = isDatabaseError(error.message ?? '');

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          {dbIssue ? 'Database is waking up' : 'Something went wrong'}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {dbIssue ? (
            <>
              On Render free tier, the database sleeps after inactivity. Wait about 30 seconds, then try again.
              The first request after idle often fails while Postgres starts.
            </>
          ) : (
            <>An unexpected server error occurred while loading this page. Please try again.</>
          )}
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-slate-400">Error reference: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
