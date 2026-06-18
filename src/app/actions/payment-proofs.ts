'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { invoiceWhereForUser, unitWhereForUser } from '@/lib/building-scope';
import { tenantCanAccessInvoice } from '@/lib/tenant-invoice-scope';
import { logActivity } from '@/lib/activity-log';
import { detectPaymentProofType } from '@/lib/upload-utils';
import { extractPaymentProofData } from '@/lib/extract-payment-proof';
import { revalidatePath } from 'next/cache';
import type { PaymentProofStatus, PaymentProofType, Prisma } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'] as const;

export type PaymentProofSubmitResult =
  | { success: true }
  | { success: false; error: string };

async function assertInvoiceAccess(invoiceId: string) {
  const user = await requireAuth();
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    select: { tenantId: true, unitId: true },
  });
  const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);
  if (!isAdmin && !tenantCanAccessInvoice(user, invoice)) {
    throw new Error('Not authorized');
  }
  return { user, invoice };
}

export async function getTenantPaymentProofs() {
  const user = await requireAuth();
  if (!user.tenantProfileId) return [];

  return prisma.invoicePaymentProof.findMany({
    where: { tenantId: user.tenantProfileId },
    orderBy: { createdAt: 'desc' },
    include: {
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
      submittedBy: { select: { fullName: true } },
    },
  });
}

export async function getAdminPaymentProofs(status?: PaymentProofStatus) {
  const user = await requireRole(ADMIN_ROLES);
  const invoiceScope = invoiceWhereForUser(user);
  const unitScope = unitWhereForUser(user);

  const where: Prisma.InvoicePaymentProofWhereInput = {
    ...(status ? { status } : {}),
  };

  if (invoiceScope || unitScope) {
    where.OR = [
      ...(invoiceScope ? [{ invoice: invoiceScope }] : []),
      ...(unitScope ? [{ invoiceId: null, tenant: { unit: unitScope } }] : []),
    ];
  }

  return prisma.invoicePaymentProof.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      submittedBy: { select: { fullName: true, email: true } },
      tenant: {
        include: {
          user: { select: { fullName: true, email: true } },
          unit: { include: { building: { select: { name: true } } } },
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
  });
}

export async function getAdminPaymentProofsForReview(status: PaymentProofStatus = 'PENDING') {
  return getAdminPaymentProofs(status);
}

export async function linkPaymentProofToInvoice(formData: FormData) {
  const user = await requireRole(ADMIN_ROLES);
  const proofId = formData.get('proofId') as string;
  const invoiceId = formData.get('invoiceId') as string;

  if (!proofId || !invoiceId) {
    throw new Error('Proof and invoice are required');
  }

  const [proof, invoice] = await Promise.all([
    prisma.invoicePaymentProof.findUniqueOrThrow({ where: { id: proofId } }),
    prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: { unit: { include: { tenant: true } } },
    }),
  ]);

  const invoiceScope = invoiceWhereForUser(user);
  if (invoiceScope) {
    const allowed = await prisma.invoice.findFirst({ where: { id: invoiceId, ...invoiceScope } });
    if (!allowed) throw new Error('Not authorized for this invoice');
  }

  const invoiceTenantId = invoice.tenantId ?? invoice.unit.tenant?.id;
  if (invoiceTenantId && invoiceTenantId !== proof.tenantId) {
    throw new Error('This invoice belongs to a different tenant');
  }

  await prisma.invoicePaymentProof.update({
    where: { id: proofId },
    data: { invoiceId },
  });

  if (!invoice.tenantId) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { tenantId: proof.tenantId },
    });
  }

  revalidatePath('/dashboard/invoices');
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
}

export async function submitPaymentProof(formData: FormData): Promise<PaymentProofSubmitResult> {
  try {
    const user = await requireAuth();
    if (user.role !== 'TENANT' || !user.tenantProfileId) {
      return { success: false, error: 'Only tenants can submit payment proof' };
    }

    const invoiceId = (formData.get('invoiceId') as string)?.trim() || null;
    const proofMode = formData.get('proofMode') as 'file' | 'url';
    const billingUrl = (formData.get('billingUrl') as string)?.trim() || null;
    const fileUrl = (formData.get('fileUrl') as string)?.trim() || null;
    const fileName = (formData.get('fileName') as string)?.trim() || null;
    const notes = (formData.get('notes') as string)?.trim() || null;

    let unitNumber = 'your room';

    if (invoiceId) {
      const invoice = await prisma.invoice.findUniqueOrThrow({
        where: { id: invoiceId },
        include: { unit: { select: { unitNumber: true } } },
      });
      if (!tenantCanAccessInvoice(user, invoice)) {
        return { success: false, error: 'Not authorized for this invoice' };
      }
      unitNumber = invoice.unit.unitNumber;
      if (!invoice.tenantId) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { tenantId: user.tenantProfileId },
        });
      }
    }

    let proofType: PaymentProofType;
    if (proofMode === 'url') {
      if (!billingUrl) return { success: false, error: 'Billing URL is required' };
      try {
        new URL(billingUrl);
      } catch {
        return { success: false, error: 'Please enter a valid billing URL' };
      }
      proofType = 'URL';
    } else {
      if (!fileUrl) return { success: false, error: 'Please upload a receipt image or PDF first' };
      if (!fileUrl.startsWith('/uploads/payment-proof/')) {
        return { success: false, error: 'Invalid upload. Please upload your receipt again.' };
      }
      proofType = detectPaymentProofType(fileName, fileUrl);
    }

    const proof = await prisma.invoicePaymentProof.create({
      data: {
        invoiceId,
        tenantId: user.tenantProfileId,
        proofType,
        fileUrl: proofMode === 'file' ? fileUrl : null,
        fileName: proofMode === 'file' ? fileName : null,
        billingUrl: proofMode === 'url' ? billingUrl : null,
        notes,
        submittedById: user.id,
        extractionStatus: proofMode === 'file' ? 'PENDING' : 'FAILED',
      },
    });

    if (proofMode === 'file' && fileUrl) {
      extractPaymentProofData(proof.id).catch(() => {});
    }

    await logActivity({
      userId: user.id,
      action: 'SUBMIT',
      entityType: 'InvoicePaymentProof',
      entityId: invoiceId ?? user.tenantProfileId,
      description: invoiceId
        ? `Submitted rent payment proof for invoice (Room ${unitNumber})`
        : 'Submitted general rent payment proof',
    });

    revalidatePath('/dashboard/invoices');
    if (invoiceId) revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath('/dashboard/payments');

    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to submit payment proof';
    return { success: false, error: msg };
  }
}

export async function getPaymentProofsForInvoice(invoiceId: string) {
  await assertInvoiceAccess(invoiceId);
  return prisma.invoicePaymentProof.findMany({
    where: { invoiceId },
    orderBy: { createdAt: 'desc' },
    include: {
      submittedBy: { select: { fullName: true } },
    },
  });
}

export async function reExtractPaymentProof(proofId: string) {
  await requireRole(ADMIN_ROLES);
  try {
    await extractPaymentProofData(proofId);
  } catch {
    await prisma.invoicePaymentProof.update({
      where: { id: proofId },
      data: { extractionStatus: 'FAILED' },
    });
  }
  revalidatePath('/dashboard/invoices');
}

export async function updateProofExtraction(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const proofId = formData.get('proofId') as string;
  const amountRaw = formData.get('extractedAmount') as string;
  const payerName = (formData.get('extractedPayerName') as string)?.trim() || null;
  const paymentDateRaw = formData.get('extractedPaymentDate') as string;
  const transactionId = (formData.get('extractedTransactionId') as string)?.trim() || null;

  const amount = amountRaw ? parseFloat(amountRaw) : null;
  const paymentDate = paymentDateRaw ? new Date(paymentDateRaw) : null;

  await prisma.invoicePaymentProof.update({
    where: { id: proofId },
    data: {
      extractedAmount: amount,
      extractedPayerName: payerName,
      extractedPaymentDate: paymentDate,
      extractedTransactionId: transactionId,
      extractionStatus: amount && amount > 0 ? 'SUCCESS' : 'FAILED',
    },
  });

  revalidatePath('/dashboard/invoices');
}

export async function approvePaymentProof(proofId: string) {
  const user = await requireRole(ADMIN_ROLES);

  let proof = await prisma.invoicePaymentProof.findUniqueOrThrow({
    where: { id: proofId },
    include: {
      tenant: {
        include: {
          user: { select: { fullName: true } },
          unit: { include: { building: { select: { id: true, name: true } } } },
        },
      },
      invoice: { include: { payments: true } },
    },
  });

  if (proof.status !== 'PENDING') {
    throw new Error('This proof has already been reviewed');
  }

  if (!proof.extractedAmount) {
    await extractPaymentProofData(proofId);
    proof = await prisma.invoicePaymentProof.findUniqueOrThrow({
      where: { id: proofId },
      include: {
        tenant: {
          include: {
            user: { select: { fullName: true } },
            unit: { include: { building: { select: { id: true, name: true } } } },
          },
        },
        invoice: { include: { payments: true } },
      },
    });
  }

  const amount = Number(proof.extractedAmount);
  if (!amount || amount <= 0) {
    throw new Error('Payment amount is required. Re-scan the receipt or enter the amount manually.');
  }

  const buildingId = proof.tenant.unit?.buildingId;
  if (!buildingId) {
    throw new Error('Tenant has no assigned unit. Assign a unit before approving.');
  }

  const incomeDate = proof.extractedPaymentDate ?? new Date();
  const description = [
    'Rent payment from receipt',
    proof.extractedPayerName ?? proof.tenant.user.fullName,
    proof.extractedTransactionId ? `Txn ${proof.extractedTransactionId}` : null,
  ]
    .filter(Boolean)
    .join(' – ');

  const income = await prisma.income.create({
    data: {
      buildingId,
      tenantId: proof.tenantId,
      type: 'RENTAL',
      amount,
      description,
      incomeDate,
      recordedById: user.id,
    },
  });

  if (proof.invoiceId && proof.invoice) {
    await prisma.payment.create({
      data: {
        invoiceId: proof.invoiceId,
        amount,
        method: 'MOBILE_MONEY',
        receiptUrl: proof.fileUrl,
        receiptNumber: proof.extractedTransactionId,
        reference: proof.extractedTransactionId,
        paidAt: incomeDate,
        recordedById: user.id,
        notes: `Approved from payment proof ${proof.id}`,
      },
    });

    const inv = await prisma.invoice.findUniqueOrThrow({
      where: { id: proof.invoiceId },
      include: { payments: true },
    });
    const totalPaid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    const newStatus = totalPaid >= Number(inv.amount) ? 'PAID' : 'PARTIAL';
    await prisma.invoice.update({
      where: { id: proof.invoiceId },
      data: { status: newStatus },
    });
  }

  await prisma.invoicePaymentProof.update({
    where: { id: proofId },
    data: { status: 'APPROVED', incomeId: income.id },
  });

  await logActivity({
    userId: user.id,
    action: 'APPROVE',
    entityType: 'InvoicePaymentProof',
    entityId: proofId,
    description: `Approved payment proof – ${amount} ETB recorded as income`,
  });

  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard/payments');
  revalidatePath('/dashboard/income');
  revalidatePath('/dashboard/reports');
  if (proof.invoiceId) revalidatePath(`/dashboard/invoices/${proof.invoiceId}`);
}

export async function rejectPaymentProof(proofId: string) {
  await requireRole(ADMIN_ROLES);
  const proof = await prisma.invoicePaymentProof.update({
    where: { id: proofId },
    data: { status: 'REJECTED' },
    select: { invoiceId: true },
  });
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard/payments');
  if (proof.invoiceId) revalidatePath(`/dashboard/invoices/${proof.invoiceId}`);
}

/** @deprecated Use approvePaymentProof / rejectPaymentProof */
export async function updatePaymentProofStatus(proofId: string, status: 'APPROVED' | 'REJECTED') {
  if (status === 'APPROVED') {
    await approvePaymentProof(proofId);
  } else {
    await rejectPaymentProof(proofId);
  }
}
