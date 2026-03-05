import Link from 'next/link';
import { getUsersWithoutTenant } from '@/app/actions/tenants';
import { prisma } from '@/lib/db';
import { TenantForm } from '@/components/tenants/TenantForm';
import { createTenant } from '@/app/actions/tenants';

export default async function NewTenantPage() {
  const [users, buildingsWithUnits] = await Promise.all([
    getUsersWithoutTenant(),
    prisma.building.findMany({
      include: { units: { where: { status: 'AVAILABLE' }, select: { id: true, unitNumber: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);
  const unitOptions = buildingsWithUnits.flatMap((b) =>
    b.units.map((u) => ({ id: u.id, label: `${b.name} – Unit ${u.unitNumber}` }))
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add tenant</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Assign a user to a unit and set profile</p>
      {users.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-300">No users available. Every registered user already has a tenant profile.</p>
          <p className="mt-2 text-sm text-slate-500">Ask new users to sign up first, then assign them to a unit here.</p>
          <Link href="/dashboard/tenants" className="mt-4 inline-block text-sky-500 hover:underline">← Back to tenants</Link>
        </div>
      ) : unitOptions.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-300">No available units. All units are occupied or you have no units yet.</p>
          <Link href="/dashboard/tenants" className="mt-4 inline-block text-sky-500 hover:underline">← Back to tenants</Link>
        </div>
      ) : (
        <div className="mt-6 max-w-2xl">
          <TenantForm users={users} units={unitOptions} action={createTenant} submitLabel="Create tenant" />
        </div>
      )}
    </div>
  );
}
