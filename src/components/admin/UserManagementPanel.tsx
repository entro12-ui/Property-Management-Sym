'use client';

import { useFormStatus } from 'react-dom';
import { createUser, updateUserAccount } from '@/app/actions/users';
import { ROLE_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import type { Role } from '@prisma/client';
import { Shield, UserPlus } from 'lucide-react';

const ASSIGNABLE_ROLES: Role[] = [
  'SUPER_ADMIN',
  'BUILDING_OWNER',
  'PROPERTY_MANAGER',
  'ACCOUNTANT',
  'TENANT',
];

type UserRow = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
  createdAt: Date;
  tenantProfile: {
    id: string;
    unit: { unitNumber: string; building: { name: string } } | null;
  } | null;
};

export function UserManagementPanel({ users }: { users: UserRow[] }) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create user account</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add staff or tenant login credentials and assign a role.
        </p>
        <form
          action={async (formData) => {
            await createUser(formData);
          }}
          className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Field label="Full name" name="fullName" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone" name="phone" type="tel" />
          <Field label="Temporary password" name="password" type="password" required minLength={6} />
          <div>
            <label htmlFor="create-role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Role
            </label>
            <select
              id="create-role"
              name="role"
              required
              defaultValue="PROPERTY_MANAGER"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <SubmitButton label="Create account" pendingLabel="Creating…" />
          </div>
        </form>
      </section>

      <section>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">User accounts</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {users.length}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  {user.phone && <p className="text-sm text-slate-500">{user.phone}</p>}
                  {user.tenantProfile?.unit && (
                    <p className="mt-1 text-xs text-slate-500">
                      Tenant · {user.tenantProfile.unit.building.name} · Room {user.tenantProfile.unit.unitNumber}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">Joined {formatDate(user.createdAt)}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>

              <form
                action={async (formData) => {
                  await updateUserAccount(user.id, formData);
                }}
                className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-700"
              >
                <Field label="Full name" name="fullName" defaultValue={user.fullName} required />
                <Field label="Email" name="email" type="email" defaultValue={user.email} required />
                <Field label="Phone" name="phone" type="tel" defaultValue={user.phone ?? ''} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  >
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </div>
                <Field
                  label="New password"
                  name="newPassword"
                  type="password"
                  placeholder="Leave blank to keep current"
                  minLength={6}
                  className="sm:col-span-2"
                />
                <div className="flex items-end sm:col-span-2 lg:col-span-4">
                  <SubmitButton label="Save changes" pendingLabel="Saving…" />
                </div>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  placeholder,
  minLength,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  minLength?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={`${name}-field`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        id={`${name}-field`}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        minLength={minLength}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      />
    </div>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
