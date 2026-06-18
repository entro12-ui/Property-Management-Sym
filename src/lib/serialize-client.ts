/** Convert Prisma Decimal and Date values for Client Component props. */

export function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

/** Minimal unit reference safe for client components (no Prisma Decimal). */
export function serializeUnitRefForClient(unit: {
  unitNumber: string;
  building: { name: string };
}) {
  return {
    unitNumber: unit.unitNumber,
    building: { name: unit.building.name },
  };
}

/** Full unit fields for forms — converts Decimal to number. */
export function serializeUnitForClient(unit: {
  id: string;
  buildingId: string;
  unitNumber: string;
  floorNumber: number;
  unitType: import('@prisma/client').UnitType;
  sizeSqm: { toString(): string } | number;
  rentAmount: { toString(): string } | number;
  quarterlyRentDueDate: Date | null;
  leaseStart: Date | null;
  leaseEnd: Date | null;
  status: import('@prisma/client').UnitStatus;
  notes: string | null;
}) {
  return {
    id: unit.id,
    buildingId: unit.buildingId,
    unitNumber: unit.unitNumber,
    floorNumber: unit.floorNumber,
    unitType: unit.unitType,
    sizeSqm: decimalToNumber(unit.sizeSqm),
    rentAmount: decimalToNumber(unit.rentAmount),
    quarterlyRentDueDate: unit.quarterlyRentDueDate,
    leaseStart: unit.leaseStart,
    leaseEnd: unit.leaseEnd,
    status: unit.status,
    notes: unit.notes,
  };
}

type InvoiceLike = {
  amount: { toString(): string } | number;
  latePenalty?: { toString(): string } | number;
  payments?: { amount: { toString(): string } | number; [key: string]: unknown }[];
  unit: {
    unitNumber: string;
    rentAmount?: { toString(): string } | number;
    sizeSqm?: { toString(): string } | number;
    building?: { name: string };
    tenant?: { id: string } | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function serializeInvoiceForClient<T extends InvoiceLike>(invoice: T) {
  return {
    ...invoice,
    amount: decimalToNumber(invoice.amount),
    latePenalty: decimalToNumber(invoice.latePenalty),
    payments: (invoice.payments ?? []).map((payment) => ({
      ...payment,
      amount: decimalToNumber(payment.amount),
    })),
    unit: {
      ...invoice.unit,
      rentAmount: decimalToNumber(invoice.unit.rentAmount),
      sizeSqm: decimalToNumber(invoice.unit.sizeSqm),
    },
  };
}

export function serializeInvoicesForClient<T extends InvoiceLike>(invoices: T[]) {
  return invoices.map(serializeInvoiceForClient);
}

export function toLinkableInvoice<T extends InvoiceLike>(invoice: T) {
  return {
    id: invoice.id as string,
    year: invoice.year as number,
    quarter: invoice.quarter as number | null,
    month: invoice.month as number | null,
    periodType: invoice.periodType as 'MONTHLY' | 'QUARTERLY',
    amount: decimalToNumber(invoice.amount),
    tenantId: (invoice.tenantId as string | null) ?? null,
    unit: {
      unitNumber: invoice.unit.unitNumber,
      tenant: invoice.unit.tenant ?? null,
    },
  };
}

export function toLinkableInvoices<T extends InvoiceLike>(invoices: T[]) {
  return invoices.map(toLinkableInvoice);
}

export type ClientPaymentProof = {
  id: string;
  proofType: string;
  fileUrl: string | null;
  fileName: string | null;
  billingUrl: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  tenantId?: string;
  invoiceId?: string | null;
  extractedAmount: number | null;
  extractedPayerName: string | null;
  extractedPaymentDate: string | null;
  extractedTransactionId: string | null;
  extractionStatus: string | null;
  submittedBy: { fullName: string; email?: string };
  tenant?: {
    user: { fullName: string; email: string };
    unit: { unitNumber: string; building: { name: string } } | null;
  };
  invoice?: {
    id: string;
    year: number;
    quarter: number | null;
    month: number | null;
    periodType: 'MONTHLY' | 'QUARTERLY';
    unit: { unitNumber: string; building: { name: string } };
  } | null;
};

type AdminProofFromDb = {
  id: string;
  proofType: string;
  fileUrl: string | null;
  fileName: string | null;
  billingUrl: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  tenantId: string;
  invoiceId: string | null;
  extractedAmount?: { toString(): string } | number | null;
  extractedPayerName?: string | null;
  extractedPaymentDate?: Date | null;
  extractedTransactionId?: string | null;
  extractionStatus?: string | null;
  submittedBy: { fullName: string; email?: string };
  tenant?: {
    user: { fullName: string; email: string };
    unit: {
      unitNumber: string;
      building: { name: string };
    } | null;
  };
  invoice?: ClientPaymentProof['invoice'];
};

/** Plain-object shape safe for Client Components (no Prisma Decimal/Date). */
export function serializeAdminProofForClient(proof: AdminProofFromDb): ClientPaymentProof {
  return {
    id: proof.id,
    proofType: proof.proofType,
    fileUrl: proof.fileUrl,
    fileName: proof.fileName,
    billingUrl: proof.billingUrl,
    notes: proof.notes,
    status: proof.status,
    createdAt: proof.createdAt.toISOString(),
    tenantId: proof.tenantId,
    invoiceId: proof.invoiceId,
    extractedAmount:
      proof.extractedAmount != null ? decimalToNumber(proof.extractedAmount) : null,
    extractedPayerName: proof.extractedPayerName ?? null,
    extractedPaymentDate: proof.extractedPaymentDate
      ? proof.extractedPaymentDate.toISOString().slice(0, 10)
      : null,
    extractedTransactionId: proof.extractedTransactionId ?? null,
    extractionStatus: proof.extractionStatus ?? null,
    submittedBy: {
      fullName: proof.submittedBy.fullName,
      email: proof.submittedBy.email,
    },
    tenant: proof.tenant
      ? {
          user: {
            fullName: proof.tenant.user.fullName,
            email: proof.tenant.user.email,
          },
          unit: proof.tenant.unit
            ? {
                unitNumber: proof.tenant.unit.unitNumber,
                building: { name: proof.tenant.unit.building.name },
              }
            : null,
        }
      : undefined,
    invoice: proof.invoice ?? null,
  };
}

export function serializeAdminProofsForClient(proofs: AdminProofFromDb[]): ClientPaymentProof[] {
  return proofs.map(serializeAdminProofForClient);
}

type ProofLike = {
  createdAt: Date;
  extractedAmount?: { toString(): string } | number | null;
  extractedPayerName?: string | null;
  extractedPaymentDate?: Date | null;
  extractedTransactionId?: string | null;
  extractionStatus?: string | null;
  id?: string;
  proofType?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  billingUrl?: string | null;
  notes?: string | null;
  status?: string;
  submittedBy?: { fullName: string };
  invoice?: ClientPaymentProof['invoice'];
};

export function serializePaymentProofForClient<T extends ProofLike>(proof: T) {
  return {
    id: proof.id as string,
    proofType: proof.proofType as string,
    fileUrl: proof.fileUrl as string | null,
    fileName: proof.fileName as string | null,
    billingUrl: proof.billingUrl as string | null,
    notes: proof.notes as string | null,
    status: proof.status as string,
    createdAt: proof.createdAt.toISOString(),
    extractedAmount:
      proof.extractedAmount != null ? decimalToNumber(proof.extractedAmount) : null,
    extractedPayerName: proof.extractedPayerName ?? null,
    extractedPaymentDate: proof.extractedPaymentDate
      ? proof.extractedPaymentDate.toISOString().slice(0, 10)
      : null,
    extractedTransactionId: proof.extractedTransactionId ?? null,
    extractionStatus: proof.extractionStatus ?? null,
    submittedBy: (proof.submittedBy ?? { fullName: 'Unknown' }) as { fullName: string },
    invoice: proof.invoice ?? null,
  };
}

export function serializePaymentProofsForClient<T extends ProofLike>(proofs: T[]) {
  return proofs.map(serializePaymentProofForClient);
}

/** Serialize tenant profile for client components (strips Prisma Decimal, etc.). */
export function serializeTenantProfileForClient(profile: {
  emergencyContact: string | null;
  emergencyPhone: string | null;
  moveInDate: Date | null;
  moveOutDate: Date | null;
  user: { fullName: string; email: string; phone: string | null };
  unit: {
    unitNumber: string;
    floorNumber: number;
    rentAmount: { toString(): string } | number;
    sizeSqm?: { toString(): string } | number;
    leaseStart: Date | null;
    leaseEnd: Date | null;
    quarterlyRentDueDate: Date | null;
    building: {
      name: string;
      address: string;
      city: string;
      manager: { fullName: string; email: string; phone: string | null } | null;
    };
  } | null;
}) {
  return {
    emergencyContact: profile.emergencyContact,
    emergencyPhone: profile.emergencyPhone,
    moveInDate: profile.moveInDate,
    moveOutDate: profile.moveOutDate,
    user: profile.user,
    unit: profile.unit
      ? {
          unitNumber: profile.unit.unitNumber,
          floorNumber: profile.unit.floorNumber,
          rentAmount: decimalToNumber(profile.unit.rentAmount),
          leaseStart: profile.unit.leaseStart,
          leaseEnd: profile.unit.leaseEnd,
          quarterlyRentDueDate: profile.unit.quarterlyRentDueDate,
          building: profile.unit.building,
        }
      : null,
  };
}
