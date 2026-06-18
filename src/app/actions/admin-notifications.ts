'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { invoiceWhereForUser, unitWhereForUser } from '@/lib/building-scope';
import { serializeAdminProofsForClient, serializeUnitRefForClient } from '@/lib/serialize-client';
import type { Prisma } from '@prisma/client';

const PAYMENT_PROOF_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;
const LEAVE_MAINTENANCE_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

function isPaymentProofAdmin(role: string) {
  return PAYMENT_PROOF_ROLES.includes(role as (typeof PAYMENT_PROOF_ROLES)[number]);
}

function isLeaveMaintenanceAdmin(role: string) {
  return LEAVE_MAINTENANCE_ROLES.includes(role as (typeof LEAVE_MAINTENANCE_ROLES)[number]);
}

async function requireAdminNotificationsAccess() {
  const user = await requireAuth();
  if (!isPaymentProofAdmin(user.role) && !isLeaveMaintenanceAdmin(user.role)) {
    redirect('/dashboard');
  }
  return user;
}

function paymentProofWhere(user: Awaited<ReturnType<typeof requireAuth>>): Prisma.InvoicePaymentProofWhereInput {
  const invoiceScope = invoiceWhereForUser(user);
  const unitScope = unitWhereForUser(user);

  const where: Prisma.InvoicePaymentProofWhereInput = { status: 'PENDING' };

  if (invoiceScope || unitScope) {
    where.OR = [
      ...(invoiceScope ? [{ invoice: invoiceScope }] : []),
      ...(unitScope ? [{ invoiceId: null, tenant: { unit: unitScope } }] : []),
    ];
  }

  return where;
}

export async function getAdminPendingCount(): Promise<number> {
  const user = await requireAuth();
  if (!isPaymentProofAdmin(user.role) && !isLeaveMaintenanceAdmin(user.role)) {
    return 0;
  }

  const unitScope = unitWhereForUser(user);
  const [paymentProofs, leaveRequests, maintenance] = await Promise.all([
    isPaymentProofAdmin(user.role)
      ? prisma.invoicePaymentProof.count({ where: paymentProofWhere(user) })
      : Promise.resolve(0),
    isLeaveMaintenanceAdmin(user.role)
      ? prisma.leaveRequest.count({
          where: { status: 'PENDING', ...(unitScope ? { unit: unitScope } : {}) },
        })
      : Promise.resolve(0),
    isLeaveMaintenanceAdmin(user.role)
      ? prisma.maintenanceRequest.count({
          where: { status: 'PENDING', ...(unitScope ? { unit: unitScope } : {}) },
        })
      : Promise.resolve(0),
  ]);

  return paymentProofs + leaveRequests + maintenance;
}

export async function getAdminPendingApprovals() {
  const user = await requireAdminNotificationsAccess();
  const unitScope = unitWhereForUser(user);

  const [paymentProofs, leaveRequests, maintenanceRequests] = await Promise.all([
    isPaymentProofAdmin(user.role)
      ? prisma.invoicePaymentProof.findMany({
          where: paymentProofWhere(user),
          orderBy: { createdAt: 'desc' },
          include: {
            submittedBy: { select: { fullName: true, email: true } },
            tenant: {
              include: {
                user: { select: { fullName: true, email: true, phone: true } },
                unit: { select: { unitNumber: true, building: { select: { name: true } } } },
              },
            },
            invoice: {
              select: {
                id: true,
                year: true,
                quarter: true,
                month: true,
                periodType: true,
                unit: { select: { unitNumber: true, building: { select: { name: true } } } },
              },
            },
          },
        })
      : Promise.resolve([]),
    isLeaveMaintenanceAdmin(user.role)
      ? prisma.leaveRequest.findMany({
          where: { status: 'PENDING', ...(unitScope ? { unit: unitScope } : {}) },
          orderBy: { createdAt: 'desc' },
          include: {
            tenant: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
            unit: { select: { unitNumber: true, building: { select: { name: true } } } },
          },
        })
      : Promise.resolve([]),
    isLeaveMaintenanceAdmin(user.role)
      ? prisma.maintenanceRequest.findMany({
          where: { status: 'PENDING', ...(unitScope ? { unit: unitScope } : {}) },
          orderBy: { createdAt: 'desc' },
          include: {
            unit: { select: { unitNumber: true, building: { select: { name: true } } } },
            requestedBy: { select: { fullName: true, email: true, phone: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    paymentProofs: serializeAdminProofsForClient(paymentProofs),
    leaveRequests: leaveRequests.map((req) => ({
      id: req.id,
      requestedMoveOutDate: req.requestedMoveOutDate.toISOString().slice(0, 10),
      reason: req.reason,
      createdAt: req.createdAt.toISOString(),
      tenant: req.tenant,
      unit: serializeUnitRefForClient(req.unit),
    })),
    maintenanceRequests: maintenanceRequests.map((req) => ({
      id: req.id,
      title: req.title,
      description: req.description,
      urgency: req.urgency,
      createdAt: req.createdAt.toISOString(),
      unit: serializeUnitRefForClient(req.unit),
      requestedBy: req.requestedBy,
    })),
    permissions: {
      paymentProofs: isPaymentProofAdmin(user.role),
      leave: isLeaveMaintenanceAdmin(user.role),
      maintenance: isLeaveMaintenanceAdmin(user.role),
    },
  };
}
