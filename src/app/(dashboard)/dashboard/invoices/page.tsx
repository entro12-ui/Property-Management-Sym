import Link from 'next/link';
import { getInvoices } from '@/app/actions/invoices';
import { getAdminPaymentProofsForReview, getTenantPaymentProofs } from '@/app/actions/payment-proofs';
import { getBuildings } from '@/app/actions/buildings';
import { getAuthUser } from '@/lib/auth';
import { INVOICE_STATUS_LABELS, PAYMENT_PROOF_STATUS_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { formatPeriodLabel } from '@/lib/billing-utils';
import { Plus } from 'lucide-react';
import { GenerateMonthlyInvoicesForm } from '@/components/invoices/GenerateMonthlyInvoicesForm';
import { GenerateQuarterlyInvoicesForm } from '@/components/invoices/GenerateQuarterlyInvoicesForm';
import { TenantInvoicesPanel } from '@/components/invoices/TenantInvoicesPanel';
import { AdminPaymentProofPanel } from '@/components/invoices/AdminPaymentProofPanel';
import {
  serializeInvoicesForClient,
  serializePaymentProofsForClient,
  serializeAdminProofsForClient,
  toLinkableInvoices,
} from '@/lib/serialize-client';
import type { InvoiceStatus } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const user = await getAuthUser();
  const isAdmin = user ? ADMIN_ROLES.includes(user.role) : false;

  const [invoices, buildings, submittedProofs, pendingProofs] = await Promise.all([
    getInvoices({ status: status || undefined }),
    isAdmin ? getBuildings().catch(() => []) : Promise.resolve([]),
    isAdmin ? Promise.resolve([]) : getTenantPaymentProofs(),
    isAdmin ? getAdminPaymentProofsForReview('PENDING') : Promise.resolve([]),
  ]);

  const clientInvoices = serializeInvoicesForClient(invoices);
  const clientSubmittedProofs = serializePaymentProofsForClient(submittedProofs);
  const clientPendingProofs = serializeAdminProofsForClient(pendingProofs);
  const linkableInvoices = toLinkableInvoices(invoices);

  if (!isAdmin) {
    return (
      <div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Invoices</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            View your rent invoices and upload payment receipts or billing links
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/dashboard/invoices" className={`rounded-lg px-3 py-1.5 text-sm ${!status ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'}`}>All</Link>
          {(['SENT', 'PARTIAL', 'OVERDUE', 'PAID'] as InvoiceStatus[]).map((s) => (
            <Link key={s} href={`/dashboard/invoices?status=${s}`} className={`rounded-lg px-3 py-1.5 text-sm ${status === s ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'}`}>
              {INVOICE_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        <TenantInvoicesPanel invoices={clientInvoices} submittedProofs={clientSubmittedProofs} activeFilter={status} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Quarterly and monthly rent invoices</p>
        </div>
        {buildings.length > 0 && (
          <Link href="/dashboard/invoices/new" className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
            <Plus className="h-4 w-4" /> New invoice
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <GenerateQuarterlyInvoicesForm />
        <GenerateMonthlyInvoicesForm />
      </div>

      <AdminPaymentProofPanel proofs={clientPendingProofs} invoices={linkableInvoices} />

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/dashboard/invoices" className={`rounded-lg px-3 py-1.5 text-sm ${!status ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'}`}>All</Link>
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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Period / Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Due date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Proof</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {clientInvoices.map((inv) => {
                const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
                const balance = Math.max(0, Number(inv.amount) - paid);
                const pendingProofCount = inv.paymentProofs.filter((p) => p.status === 'PENDING').length;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900 dark:text-white">{formatPeriodLabel(inv)}</span>
                      <span className="ml-2 text-slate-500">{inv.unit.building.name} – Room {inv.unit.unitNumber}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {formatCurrency(inv.amount)}
                      {balance > 0 && inv.status !== 'PAID' && (
                        <span className="ml-1 text-xs text-amber-600">({formatCurrency(balance)} due)</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{INVOICE_STATUS_LABELS[inv.status]}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {pendingProofCount > 0 ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          {pendingProofCount} {PAYMENT_PROOF_STATUS_LABELS.PENDING.toLowerCase()}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="text-sky-500 hover:underline">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
