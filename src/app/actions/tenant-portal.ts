'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAuth, type AuthUser } from '@/lib/auth';
import { tenantInvoiceWhere } from '@/lib/tenant-invoice-scope';
import { isDueWithin, isOverdue } from '@/lib/invoice-utils';
import { formatPeriodLabel } from '@/lib/billing-utils';
import { formatCurrency } from '@/lib/utils';
import type { PaymentProofStatus } from '@prisma/client';

export type TenantAlertItem = {
  id: string;
  category: 'rent' | 'payment_proof' | 'sms' | 'announcement' | 'maintenance';
  title: string;
  message: string;
  createdAt: Date;
  href?: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
};

async function requireTenant(): Promise<AuthUser & { tenantProfileId: string }> {
  const user = await requireAuth();
  if (user.role !== 'TENANT' || !user.tenantProfileId) {
    redirect('/dashboard');
  }
  return { ...user, tenantProfileId: user.tenantProfileId };
}

export async function getMyTenantProfile() {
  const user = await requireTenant();

  return prisma.tenantProfile.findUniqueOrThrow({
    where: { id: user.tenantProfileId },
    include: {
      user: { select: { id: true, fullName: true, email: true, phone: true } },
      unit: {
        include: {
          building: {
            include: {
              manager: { select: { fullName: true, email: true, phone: true } },
              owner: { select: { fullName: true, phone: true } },
            },
          },
        },
      },
      documents: {
        orderBy: [{ type: 'asc' }, { version: 'desc' }],
        include: { uploadedBy: { select: { fullName: true } } },
      },
    },
  });
}

export async function updateMyTenantProfile(formData: FormData) {
  const user = await requireTenant();
  const phone = (formData.get('phone') as string)?.trim() || null;
  const emergencyContact = (formData.get('emergencyContact') as string)?.trim() || null;
  const emergencyPhone = (formData.get('emergencyPhone') as string)?.trim() || null;

  if (phone && !/^\+?[0-9\s-]{9,15}$/.test(phone)) {
    return { success: false as const, error: 'Please enter a valid phone number for SMS alerts.' };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { phone },
    }),
    prisma.tenantProfile.update({
      where: { id: user.tenantProfileId },
      data: { emergencyContact, emergencyPhone },
    }),
  ]);

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/alerts');
  return { success: true as const };
}

export async function getMyDocuments() {
  const profile = await getMyTenantProfile();
  return profile;
}

export async function getMySmsLogs(limit = 30) {
  const user = await requireTenant();

  return prisma.smsNotificationLog.findMany({
    where: { tenantId: user.tenantProfileId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      invoice: {
        select: {
          id: true,
          year: true,
          quarter: true,
          month: true,
          periodType: true,
        },
      },
    },
  });
}

export async function getMyAlerts(limit = 40): Promise<TenantAlertItem[]> {
  const user = await requireTenant();
  const alerts: TenantAlertItem[] = [];

  const [invoices, proofs, smsLogs, announcements, maintenance, readIds] = await Promise.all([
    prisma.invoice.findMany({
      where: tenantInvoiceWhere(user),
      orderBy: { dueDate: 'asc' },
      include: { payments: true },
    }),
    prisma.invoicePaymentProof.findMany({
      where: { tenantId: user.tenantProfileId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        invoice: {
          select: {
            id: true,
            year: true,
            quarter: true,
            month: true,
            periodType: true,
          },
        },
      },
    }),
    prisma.smsNotificationLog.findMany({
      where: { tenantId: user.tenantProfileId, status: 'SENT' },
      orderBy: { sentAt: 'desc' },
      take: 15,
    }),
    prisma.announcement.findMany({
      where: user.unitId
        ? {
            OR: [
              { buildingId: null },
              { building: { units: { some: { id: user.unitId } } } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { reads: { where: { userId: user.id }, select: { id: true } } },
    }),
    prisma.maintenanceRequest.findMany({
      where: { requestedById: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      include: { unit: { select: { unitNumber: true, building: { select: { name: true } } } } },
    }),
    prisma.announcementRead.findMany({
      where: { userId: user.id },
      select: { announcementId: true },
    }),
  ]);

  const readSet = new Set(readIds.map((r) => r.announcementId));

  for (const inv of invoices) {
    const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = Math.max(0, Number(inv.amount) - paid);
    if (balance <= 0 || inv.status === 'PAID' || inv.status === 'CANCELLED') continue;

    const due = new Date(inv.dueDate);
    const period = formatPeriodLabel(inv);

    if (isOverdue(due)) {
      alerts.push({
        id: `rent-overdue-${inv.id}`,
        category: 'rent',
        title: 'Rent overdue',
        message: `${period}: ${formatCurrency(balance)} was due ${due.toLocaleDateString()}.`,
        createdAt: due,
        href: `/dashboard/invoices/${inv.id}`,
        tone: 'danger',
      });
    } else if (isDueWithin(due, 15)) {
      alerts.push({
        id: `rent-due-${inv.id}`,
        category: 'rent',
        title: 'Upcoming rent due',
        message: `${period}: ${formatCurrency(balance)} due ${due.toLocaleDateString()}.`,
        createdAt: due,
        href: `/dashboard/invoices/${inv.id}`,
        tone: 'warning',
      });
    }
  }

  for (const proof of proofs) {
    const period = proof.invoice ? formatPeriodLabel(proof.invoice) : 'General payment';
    const tone =
      proof.status === 'APPROVED' ? 'success' : proof.status === 'REJECTED' ? 'danger' : 'info';
    alerts.push({
      id: `proof-${proof.id}`,
      category: 'payment_proof',
      title: `Payment proof ${proof.status.toLowerCase()}`,
      message: `${period} — ${proof.status === 'PENDING' ? 'Waiting for admin review.' : `Status: ${proof.status}.`}`,
      createdAt: proof.createdAt,
      href: proof.invoiceId ? `/dashboard/invoices/${proof.invoiceId}` : '/dashboard/invoices',
      tone,
    });
  }

  for (const log of smsLogs) {
    alerts.push({
      id: `sms-${log.id}`,
      category: 'sms',
      title: 'SMS sent',
      message: log.message.length > 120 ? `${log.message.slice(0, 117)}…` : log.message,
      createdAt: log.sentAt ?? log.createdAt,
      tone: 'info',
    });
  }

  for (const a of announcements) {
    if (readSet.has(a.id)) continue;
    alerts.push({
      id: `announcement-${a.id}`,
      category: 'announcement',
      title: a.title,
      message: a.body.length > 140 ? `${a.body.slice(0, 137)}…` : a.body,
      createdAt: a.createdAt,
      href: `/dashboard/announcements/${a.id}`,
      tone: a.type === 'EMERGENCY' ? 'danger' : 'info',
    });
  }

  for (const req of maintenance) {
    if (req.status === 'CANCELLED') continue;
    alerts.push({
      id: `maint-${req.id}-${req.status}`,
      category: 'maintenance',
      title: `Maintenance ${req.status.replace('_', ' ').toLowerCase()}`,
      message: `${req.title} — ${req.unit.building.name}, Room ${req.unit.unitNumber}`,
      createdAt: req.updatedAt,
      href: `/dashboard/maintenance/${req.id}`,
      tone: req.status === 'COMPLETED' ? 'success' : req.status === 'PENDING' ? 'warning' : 'info',
    });
  }

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { tenantId: user.tenantProfileId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });
  for (const leave of leaveRequests) {
    if (leave.status === 'CANCELLED') continue;
    alerts.push({
      id: `leave-${leave.id}`,
      category: 'maintenance',
      title: `Leave request ${leave.status.toLowerCase()}`,
      message:
        leave.status === 'PENDING'
          ? `Move-out requested for ${leave.requestedMoveOutDate.toLocaleDateString()} — awaiting review.`
          : `Move-out on ${leave.requestedMoveOutDate.toLocaleDateString()} — ${leave.status.toLowerCase()}.`,
      createdAt: leave.updatedAt,
      href: '/dashboard/leave-request',
      tone:
        leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning',
    });
  }

  alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return alerts.slice(0, limit);
}

export async function getMyAlertCount(): Promise<number> {
  const user = await requireAuth();
  if (user.role !== 'TENANT' || !user.tenantProfileId) return 0;

  const [invoices, unreadAnnouncements, pendingProofs] = await Promise.all([
    prisma.invoice.findMany({
      where: tenantInvoiceWhere(user),
      include: { payments: true },
    }),
    prisma.announcement.count({
      where: user.unitId
        ? {
            OR: [
              { buildingId: null },
              { building: { units: { some: { id: user.unitId } } } },
            ],
            reads: { none: { userId: user.id } },
          }
        : { reads: { none: { userId: user.id } } },
    }),
    prisma.invoicePaymentProof.count({
      where: { tenantId: user.tenantProfileId, status: { in: ['PENDING', 'REJECTED'] } },
    }),
  ]);

  let rentAlerts = 0;
  for (const inv of invoices) {
    const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = Math.max(0, Number(inv.amount) - paid);
    if (balance <= 0 || inv.status === 'PAID' || inv.status === 'CANCELLED') continue;
    if (isOverdue(inv.dueDate) || isDueWithin(inv.dueDate, 15)) rentAlerts++;
  }

  return rentAlerts + unreadAnnouncements + pendingProofs;
}

export type PaymentProofStatusSummary = {
  id: string;
  status: PaymentProofStatus;
  createdAt: Date;
  invoiceLabel: string | null;
  href: string;
};

export async function getMyPaymentProofSummary(limit = 5): Promise<PaymentProofStatusSummary[]> {
  const user = await requireTenant();

  const proofs = await prisma.invoicePaymentProof.findMany({
    where: { tenantId: user.tenantProfileId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      invoice: {
        select: { id: true, year: true, quarter: true, month: true, periodType: true },
      },
    },
  });

  return proofs.map((p) => ({
    id: p.id,
    status: p.status,
    createdAt: p.createdAt,
    invoiceLabel: p.invoice ? formatPeriodLabel(p.invoice) : 'General payment',
    href: p.invoiceId ? `/dashboard/invoices/${p.invoiceId}` : '/dashboard/invoices',
  }));
}
