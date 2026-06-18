'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/auth';
import { useLocale } from '@/components/providers/LocaleProvider';
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
  Menu,
  X,
  DollarSign,
  Receipt,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function isNavItemActive(pathname: string, href: string, allHrefs: string[]): boolean {
  const matches =
    pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
  if (!matches) return false;

  const matchingHrefs = allHrefs.filter(
    (h) => pathname === h || (h !== '/dashboard' && pathname.startsWith(`${h}/`))
  );
  const bestMatch = matchingHrefs.sort((a, b) => b.length - a.length)[0];
  return bestMatch === href;
}

export function DashboardSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t, labels } = useLocale();

  const isAdmin =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'BUILDING_OWNER' ||
    user.role === 'PROPERTY_MANAGER' ||
    user.role === 'ACCOUNTANT';

  const canManageSmsSettings =
    user.role === 'SUPER_ADMIN' || user.role === 'BUILDING_OWNER';

  const adminNavSections = useMemo(
    () => [
      {
        title: t('nav.buildingManagement'),
        items: [
          { href: '/dashboard/buildings', label: t('nav.buildings'), icon: Building2 },
          { href: '/dashboard/units', label: t('nav.units'), icon: DoorOpen },
        ],
      },
      {
        title: t('nav.tenantManagement'),
        items: [{ href: '/dashboard/tenants', label: t('nav.tenants'), icon: Users }],
      },
      {
        title: t('nav.rentFinancial'),
        items: [
          { href: '/dashboard/invoices', label: t('nav.invoices'), icon: FileText },
          { href: '/dashboard/payments', label: t('nav.payments'), icon: CreditCard },
          { href: '/dashboard/income', label: t('nav.income'), icon: DollarSign },
          { href: '/dashboard/expenses', label: t('nav.expenses'), icon: Receipt },
          { href: '/dashboard/reports', label: t('nav.reports'), icon: BarChart3 },
          { href: '/dashboard/notifications', label: t('nav.smsLogs'), icon: MessageSquare },
          ...(canManageSmsSettings
            ? [{ href: '/dashboard/notifications/settings', label: t('nav.smsSettings'), icon: Settings }]
            : []),
        ],
      },
      {
        title: '',
        items: [
          { href: '/dashboard/announcements', label: t('nav.announcements'), icon: Megaphone },
          { href: '/dashboard/maintenance', label: t('nav.maintenance'), icon: Wrench },
        ],
      },
    ],
    [t, canManageSmsSettings]
  );

  const tenantNav = useMemo(
    () => [
      { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
      { href: '/dashboard/invoices', label: t('nav.myInvoices'), icon: FileText },
      { href: '/dashboard/payments', label: t('nav.myPayments'), icon: CreditCard },
      { href: '/dashboard/announcements', label: t('nav.announcements'), icon: Megaphone },
      { href: '/dashboard/maintenance', label: t('nav.maintenance'), icon: Wrench },
    ],
    [t]
  );

  const adminNavHrefs = useMemo(
    () => adminNavSections.flatMap((section) => section.items.map((item) => item.href)),
    [adminNavSections]
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-xl border border-emerald-700/50 bg-emerald-900 p-2.5 text-emerald-50 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-800 lg:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-emerald-800/50 bg-gradient-to-b from-emerald-950 via-teal-950 to-emerald-950 shadow-xl shadow-emerald-950/30 lg:static lg:z-0 lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-emerald-800/50 px-5 py-5">
            <Link href="/dashboard" className="font-semibold text-white">
              {t('common.appName')}
            </Link>
            <p className="mt-1 text-xs font-medium text-amber-300/90">
              {labels.role[user.role]}
            </p>
          </div>
          <nav className="flex-1 space-y-5 overflow-y-auto p-4">
            {isAdmin ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    pathname === '/dashboard'
                      ? 'bg-amber-500 text-emerald-950 shadow-md shadow-amber-500/25'
                      : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                  {t('nav.dashboard')}
                </Link>
                {adminNavSections.map((section) => (
                  <div key={section.title || 'other'}>
                    {section.title && (
                      <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-400/70">
                        {section.title}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isNavItemActive(pathname, item.href, adminNavHrefs);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                              active
                                ? 'bg-amber-500 text-emerald-950 shadow-md shadow-amber-500/25'
                                : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
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
                <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-400/70">
                  {t('nav.tenantPortal')}
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
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                        active
                          ? 'bg-amber-500 text-emerald-950 shadow-md shadow-amber-500/25'
                          : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
                <p className="mt-4 px-3 text-xs text-emerald-300/60">
                  {t('nav.tenantPortalHint')}
                </p>
              </>
            )}
          </nav>
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
