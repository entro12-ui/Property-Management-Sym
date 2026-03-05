import { prisma } from '@/lib/db';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

export default async function NewInvoicePage() {
  const buildingsWithUnits = await prisma.building.findMany({
    include: { units: { select: { id: true, unitNumber: true, floorNumber: true } } },
    orderBy: { name: 'asc' },
  });
  const unitOptions = buildingsWithUnits.flatMap((b) =>
    b.units.map((u) => ({ id: u.id, label: `${b.name} – Unit ${u.unitNumber}`, buildingName: b.name }))
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New invoice</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Create a rent invoice</p>
      <div className="mt-6 max-w-xl">
        <InvoiceForm unitOptions={unitOptions} />
      </div>
    </div>
  );
}
