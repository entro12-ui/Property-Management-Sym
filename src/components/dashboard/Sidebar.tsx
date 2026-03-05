'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/auth';
import { ROLE_LABELS } from '@/types';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Megaphone,
  Wrench,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

// Admin nav grouped: Building Management, Unit Management, Tenant Management, Rent & Financial, then rest
const adminNavSections: { title: string; items: { href: string; label: string; icon: typeof Building2 }[] }[] = [
  {
    title: 'Building Management',
    items: [
      { href: '/dashboard/buildings', label: 'Buildings', icon: Building2 },
      { href: '/dashboard/units', label: 'Units', icon: DoorOpen },
    ],
  },
  {
    title: 'Tenant Management',
    items: [{ href: '/dashboard/tenants', label: 'Tenants', icon: Users }],
  },
  {
    title: 'Rent & Financial',
    items: [
      { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
      { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
      { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    title: '',
    items: [
      { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
      { href: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
    ],
  },
];

const tenantNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'My Invoices', icon: FileText },
  { href: '/dashboard/payments', label: 'My Payments', icon: CreditCard },
  { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
];

export function DashboardSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'BUILDING_OWNER' ||
    user.role === 'PROPERTY_MANAGER' ||
    user.role === 'ACCOUNTANT';

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-800 p-2 text-white lg:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:static lg:z-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 p-4 dark:border-slate-700">
            <Link href="/dashboard" className="font-semibold text-slate-900 dark:text-white">
              Property Manager
            </Link>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <nav className="flex-1 space-y-4 overflow-y-auto p-4">
            {isAdmin ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                    pathname === '/dashboard'
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  )}
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                  Dashboard
                </Link>
                {adminNavSections.map((section) => (
                  <div key={section.title || 'other'}>
                    {section.title && (
                      <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {section.title}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                              active
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                            )}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Tenant portal
                </p>
                {tenantNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                        active
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
                <p className="mt-4 px-3 text-xs text-slate-500 dark:text-slate-400">
                  Building management, units, tenants, and financial reports are available for Property Manager and Admin roles.
                </p>
              </>
            )}
          </nav>
          <div className="border-t border-slate-200 p-4 dark:border-slate-700">
            <p className="truncate text-sm text-slate-600 dark:text-slate-400">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-500">
              {user.email}
            </p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
