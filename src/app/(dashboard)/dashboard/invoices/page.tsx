import Link from 'next/link';
import { getInvoices } from '@/app/actions/invoices';
import { getBuildings } from '@/app/actions/buildings';
import { INVOICE_STATUS_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { GenerateMonthlyInvoicesForm } from '@/components/invoices/GenerateMonthlyInvoicesForm';
import type { InvoiceStatus } from '@prisma/client';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [invoices, buildings] = await Promise.all([
    getInvoices({ status: status || undefined }),
    getBuildings().catch(() => []),
  ]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Rent invoices and status</p>
        </div>
        {buildings.length > 0 && (
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" /> New invoice
          </Link>
        )}
      </div>

      <div className="mt-6">
        <GenerateMonthlyInvoicesForm />
      </div>

      <div className="mt-6 flex gap-2">
        <Link href="/dashboard/invoices" className={`rounded-lg px-3 py-1.5 text-sm ${!status ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'}`}>
          All
        </Link>
        {(['SENT', 'PARTIAL', 'OVERDUE', 'PAID'] as InvoiceStatus[]).map((s) => (
          <Link key={s} href={`/dashboard/invoices?status=${s}`} className={`rounded-lg px-3 py-1.5 text-sm ${status === s ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'}`}>
            {INVOICE_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No invoices match your filters.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Period / Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900 dark:text-white">{inv.month}/{inv.year}</span>
                    <span className="ml-2 text-slate-500">{inv.unit.building.name} – {inv.unit.unitNumber}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatCurrency(inv.amount)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{INVOICE_STATUS_LABELS[inv.status]}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="text-sky-500 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
