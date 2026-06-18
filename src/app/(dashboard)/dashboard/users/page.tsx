import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getUsers } from '@/app/actions/users';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { ShieldCheck } from 'lucide-react';

export default async function UserManagementPage() {
  const user = await requireAuth();
  if (user.role !== 'SUPER_ADMIN') redirect('/dashboard');

  const users = await getUsers();

  return (
    <div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-7 w-7 text-indigo-500" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User management</h1>
      </div>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Create login credentials and assign roles for staff and tenants.
      </p>
      <div className="mt-6">
        <UserManagementPanel users={users} />
      </div>
    </div>
  );
}
