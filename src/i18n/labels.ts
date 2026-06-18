import type {
  Role,
  UnitType,
  UnitStatus,
  TenantStatus,
  DocumentType,
  BillingPeriod,
  InvoiceStatus,
  PaymentMethod,
  IncomeType,
  ExpenseCategory,
  ExpenseApprovalStatus,
  SmsNotificationType,
  SmsStatus,
  AnnouncementType,
  MaintenanceStatus,
  UrgencyLevel,
} from '@prisma/client';
import { getTranslations, type Locale } from './index';

export function getLabelMaps(locale: Locale) {
  const labels = getTranslations(locale).labels;
  return {
    role: labels.role as Record<Role, string>,
    unitType: labels.unitType as Record<UnitType, string>,
    unitStatus: labels.unitStatus as Record<UnitStatus, string>,
    tenantStatus: labels.tenantStatus as Record<TenantStatus, string>,
    documentType: labels.documentType as Record<DocumentType, string>,
    billingPeriod: labels.billingPeriod as Record<BillingPeriod, string>,
    invoiceStatus: labels.invoiceStatus as Record<InvoiceStatus, string>,
    paymentMethod: labels.paymentMethod as Record<PaymentMethod, string>,
    incomeType: labels.incomeType as Record<IncomeType, string>,
    expenseCategory: labels.expenseCategory as Record<ExpenseCategory, string>,
    expenseApproval: labels.expenseApproval as Record<ExpenseApprovalStatus, string>,
    smsType: labels.smsType as Record<SmsNotificationType, string>,
    smsStatus: labels.smsStatus as Record<SmsStatus, string>,
    announcementType: labels.announcementType as Record<AnnouncementType, string>,
    maintenanceStatus: labels.maintenanceStatus as Record<MaintenanceStatus, string>,
    urgency: labels.urgency as Record<UrgencyLevel, string>,
  };
}

export type LabelMaps = ReturnType<typeof getLabelMaps>;
