'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { reviewLeaveRequest } from '@/app/actions/leave-requests';
import { reviewMaintenanceRequest } from '@/app/actions/maintenance';
import { PaymentProofAdminReview } from '@/components/invoices/PaymentProofAdminReview';
import { formatDate } from '@/lib/utils';
import { URGENCY_LABELS } from '@/types';
import type { ClientPaymentProof } from '@/lib/serialize-client';
import {
  Bell,
  CalendarOff,
  CheckCircle2,
  Clock,
  CreditCard,
  Wrench,
  XCircle,
} from 'lucide-react';

type LeaveRequestRow = {
  id: string;
  requestedMoveOutDate: string;
  reason: string | null;
  createdAt: string;
  tenant: { user: { fullName: string; email: string; phone: string | null } };
  unit: { unitNumber: string; building: { name: string } };
};

type MaintenanceRequestRow = {
  id: string;
  title: string;
  description: string;
  urgency: keyof typeof URGENCY_LABELS;
  createdAt: string;
  unit: { unitNumber: string; building: { name: string } };
  requestedBy: { fullName: string; email: string; phone: string | null };
};

type Filter = 'all' | 'payment' | 'leave' | 'maintenance';

const urgencyTone: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  MEDIUM: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

export function AdminApprovalsPanel({
  paymentProofs,
  leaveRequests,
  maintenanceRequests,
  permissions,
}: {
  paymentProofs: ClientPaymentProof[];
  leaveRequests: LeaveRequestRow[];
  maintenanceRequests: MaintenanceRequestRow[];
  permissions: { paymentProofs: boolean; leave: boolean; maintenance: boolean };
}) {
  const [filter, setFilter] = useState<Filter>('all');

  const total =
    (permissions.paymentProofs ? paymentProofs.length : 0) +
    (permissions.leave ? leaveRequests.length : 0) +
    (permissions.maintenance ? maintenanceRequests.length : 0);

  const filters = useMemo(() => {
    const items: { id: Filter; label: string; count: number }[] = [{ id: 'all', label: 'All', count: total }];
    if (permissions.paymentProofs) {
      items.push({ id: 'payment', label: 'Payment proofs', count: paymentProofs.length });
    }
    if (permissions.leave) {
      items.push({ id: 'leave', label: 'Leave requests', count: leaveRequests.length });
    }
    if (permissions.maintenance) {
      items.push({ id: 'maintenance', label: 'Maintenance', count: maintenanceRequests.length });
    }
    return items;
  }, [permissions, total, paymentProofs.length, leaveRequests.length, maintenanceRequests.length]);

  const showPayment = filter === 'all' || filter === 'payment';
  const showLeave = filter === 'all' || filter === 'leave';
  const showMaintenance = filter === 'all' || filter === 'maintenance';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {permissions.paymentProofs && (
          <SummaryCard
            icon={CreditCard}
            label="Payment proofs"
            count={paymentProofs.length}
            tone="amber"
            active={filter === 'payment'}
            onClick={() => setFilter('payment')}
          />
        )}
        {permissions.leave && (
          <SummaryCard
            icon={CalendarOff}
            label="Leave requests"
            count={leaveRequests.length}
            tone="violet"
            active={filter === 'leave'}
            onClick={() => setFilter('leave')}
          />
        )}
        {permissions.maintenance && (
          <SummaryCard
            icon={Wrench}
            label="Maintenance"
            count={maintenanceRequests.length}
            tone="sky"
            active={filter === 'maintenance'}
            onClick={() => setFilter('maintenance')}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === item.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
            }`}
          >
            {item.label}
            {item.count > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{item.count}</span>
            )}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-12 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">All caught up</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            No tenant requests are waiting for your review.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {permissions.paymentProofs && showPayment && paymentProofs.length > 0 && (
            <section>
              <SectionHeader icon={CreditCard} title="Payment proof submissions" count={paymentProofs.length} />
              <div className="mt-4 space-y-4">
                {paymentProofs.map((proof) => (
                  <NotificationCard
                    key={proof.id}
                    badge="Payment proof"
                    badgeTone="amber"
                    title={proof.tenant?.user.fullName ?? proof.submittedBy.fullName}
                    subtitle={
                      proof.tenant?.unit
                        ? `${proof.tenant.unit.building.name} · Room ${proof.tenant.unit.unitNumber}`
                        : proof.invoice
                          ? `${proof.invoice.unit.building.name} · Room ${proof.invoice.unit.unitNumber}`
                          : undefined
                    }
                    submittedAt={proof.createdAt}
                    footer={
                      <Link
                        href="/dashboard/invoices"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        View all on Invoices page →
                      </Link>
                    }
                  >
                    <PaymentProofAdminReview proof={proof} />
                  </NotificationCard>
                ))}
              </div>
            </section>
          )}

          {permissions.leave && showLeave && leaveRequests.length > 0 && (
            <section>
              <SectionHeader icon={CalendarOff} title="Leave requests" count={leaveRequests.length} />
              <div className="mt-4 space-y-4">
                {leaveRequests.map((req) => (
                  <NotificationCard
                    key={req.id}
                    badge="Leave request"
                    badgeTone="violet"
                    title={req.tenant.user.fullName}
                    subtitle={`${req.unit.building.name} · Room ${req.unit.unitNumber}`}
                    submittedAt={req.createdAt}
                  >
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <p>
                        <span className="font-medium text-slate-800 dark:text-slate-200">Requested move-out:</span>{' '}
                        {formatDate(req.requestedMoveOutDate)}
                      </p>
                      {req.reason && <p>{req.reason}</p>}
                      {req.tenant.user.phone && (
                        <p className="text-slate-500">Phone: {req.tenant.user.phone}</p>
                      )}
                    </div>
                    <form
                      action={async (formData) => {
                        await reviewLeaveRequest(req.id, formData);
                      }}
                      className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700"
                    >
                      <textarea
                        name="adminNotes"
                        rows={2}
                        placeholder="Optional note to tenant…"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      />
                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          name="status"
                          value="APPROVED"
                          label="Approve"
                          icon={CheckCircle2}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        />
                        <ActionButton
                          name="status"
                          value="REJECTED"
                          label="Reject"
                          icon={XCircle}
                          className="border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        />
                      </div>
                    </form>
                  </NotificationCard>
                ))}
              </div>
            </section>
          )}

          {permissions.maintenance && showMaintenance && maintenanceRequests.length > 0 && (
            <section>
              <SectionHeader icon={Wrench} title="Maintenance requests" count={maintenanceRequests.length} />
              <div className="mt-4 space-y-4">
                {maintenanceRequests.map((req) => (
                  <NotificationCard
                    key={req.id}
                    badge="Maintenance"
                    badgeTone="sky"
                    title={req.title}
                    subtitle={`${req.unit.building.name} · Room ${req.unit.unitNumber} · ${req.requestedBy.fullName}`}
                    submittedAt={req.createdAt}
                    extra={
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgencyTone[req.urgency]}`}>
                        {URGENCY_LABELS[req.urgency]}
                      </span>
                    }
                  >
                    <p className="text-sm text-slate-600 dark:text-slate-300">{req.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                      <form action={reviewMaintenanceRequest.bind(null, req.id, 'ACCEPT')}>
                        <PendingButton
                          idleLabel="Accept & assign"
                          pendingLabel="Accepting…"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        />
                      </form>
                      <form action={reviewMaintenanceRequest.bind(null, req.id, 'REJECT')}>
                        <PendingButton
                          idleLabel="Reject"
                          pendingLabel="Rejecting…"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        />
                      </form>
                      <Link
                        href={`/dashboard/maintenance/${req.id}`}
                        className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        View details
                      </Link>
                    </div>
                  </NotificationCard>
                ))}
              </div>
            </section>
          )}

          {filter !== 'all' &&
            ((filter === 'payment' && paymentProofs.length === 0) ||
              (filter === 'leave' && leaveRequests.length === 0) ||
              (filter === 'maintenance' && maintenanceRequests.length === 0)) && (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                No pending items in this category.
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  count,
  tone,
  active,
  onClick,
}: {
  icon: typeof Bell;
  label: string;
  count: number;
  tone: 'amber' | 'violet' | 'sky';
  active: boolean;
  onClick: () => void;
}) {
  const tones = {
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
    violet: 'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/20',
    sky: 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-900/20',
  };
  const iconTones = {
    amber: 'text-amber-600',
    violet: 'text-violet-600',
    sky: 'text-sky-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition hover:shadow-md ${tones[tone]} ${
        active ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : ''
      }`}
    >
      <Icon className={`h-5 w-5 ${iconTones[tone]}`} />
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  count,
}: {
  icon: typeof Bell;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-indigo-500" />
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
        {count}
      </span>
    </div>
  );
}

function NotificationCard({
  badge,
  badgeTone,
  title,
  subtitle,
  submittedAt,
  extra,
  footer,
  children,
}: {
  badge: string;
  badgeTone: 'amber' | 'violet' | 'sky';
  title: string;
  subtitle?: string;
  submittedAt: string;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const badgeStyles = {
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
    sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${badgeStyles[badgeTone]}`}>
              {badge}
            </span>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">{title}</p>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {extra}
            <Clock className="h-3.5 w-3.5" />
            <time>{formatDate(submittedAt)}</time>
          </div>
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-700">{footer}</div>}
    </article>
  );
}

function ActionButton({
  name,
  value,
  label,
  icon: Icon,
  className,
}: {
  name: string;
  value: string;
  label: string;
  icon: typeof CheckCircle2;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${className}`}
    >
      <Icon className="h-4 w-4" />
      {pending ? '…' : label}
    </button>
  );
}

function PendingButton({
  idleLabel,
  pendingLabel,
  className,
}: {
  idleLabel: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
