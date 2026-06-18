import { redirect } from 'next/navigation';

/** Legacy route — utility bills are now on My Invoices. */
export default async function UtilityBillsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  redirect(params.size ? `/dashboard/invoices?${params}` : '/dashboard/invoices');
}
