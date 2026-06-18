'use client';

import { useFormStatus } from 'react-dom';
import { markInvoiceSent } from '@/app/actions/invoices';

export function MarkInvoiceSentButton({ invoiceId }: { invoiceId: string }) {
  const action = markInvoiceSent.bind(null, invoiceId);

  return (
    <form action={action}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
    >
      {pending ? 'Sending…' : 'Send invoice to tenant'}
    </button>
  );
}
