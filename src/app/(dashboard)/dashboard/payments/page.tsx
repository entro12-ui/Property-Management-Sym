import Link from 'next/link';
import { getPayments } from '@/app/actions/payments';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Payment history</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {payments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No payments recorded yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Unit / Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Recorded by</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatDate(p.paidAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">{formatCurrency(p.amount)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{PAYMENT_METHOD_LABELS[p.method]}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {p.invoice.unit.building.name} – {p.invoice.unit.unitNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{p.recordedBy?.fullName ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/dashboard/invoices/${p.invoiceId}`} className="text-sky-500 hover:underline">View invoice</Link>
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
