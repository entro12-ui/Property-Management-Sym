import type {
  Role,
  UnitType,
  UnitStatus,
  InvoiceStatus,
  PaymentMethod,
  AnnouncementType,
  MaintenanceStatus,
  UrgencyLevel,
  TenantStatus,
  DocumentType,
  BillingPeriod,
  IncomeType,
  ExpenseCategory,
  ExpenseApprovalStatus,
  SmsNotificationType,
  SmsStatus,
  PaymentProofType,
  PaymentProofStatus,
} from '@prisma/client';

export type {
  Role,
  UnitType,
  UnitStatus,
  InvoiceStatus,
  PaymentMethod,
  AnnouncementType,
  MaintenanceStatus,
  UrgencyLevel,
  TenantStatus,
  DocumentType,
  BillingPeriod,
  IncomeType,
  ExpenseCategory,
  ExpenseApprovalStatus,
  SmsNotificationType,
  SmsStatus,
  PaymentProofType,
  PaymentProofStatus,
};

export type SmsSettingsView = {
  enabled: boolean;
  remindersEnabled: boolean;
  ownerPhone: string | null;
  testTenantPhone: string | null;
  customMessageTemplate: string;
  alertDays15: boolean;
  alertDays7: boolean;
  alertDueToday: boolean;
  alertOverdue: boolean;
  alertHour: number;
  hasSmsethiopiaApiKey: boolean;
};

export const DEFAULT_SMS_MESSAGE_TEMPLATE =
  'Dear {tenantName}, rent reminder for Room {roomNumber}: {amount} due {dueDate}. Contact: {ownerPhone}.';

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  BUILDING_OWNER: 'Building Owner',
  PROPERTY_MANAGER: 'Property Manager',
  ACCOUNTANT: 'Accountant',
  TENANT: 'Tenant',
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  ROOM: 'Room',
  SHOP: 'Shop',
  OFFICE: 'Office',
  RESTAURANT: 'Restaurant',
  CLINIC: 'Clinic',
  APARTMENT: 'Apartment',
};

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  AVAILABLE: 'Vacant',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  MAINTENANCE: 'Under Maintenance',
};

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  VACATED: 'Vacated',
  SUSPENDED: 'Suspended',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  NATIONAL_ID_FRONT: 'National ID (Front)',
  NATIONAL_ID_BACK: 'National ID (Back)',
  LEASE_AGREEMENT: 'Lease Agreement',
  RENTAL_AGREEMENT: 'Rental Agreement',
  OTHER: 'Other Document',
  ID: 'ID Document',
  TRADE_LICENSE: 'Trade License',
  CIVIL_DEFENSE_APPROVAL: 'Civil Defense Approval',
  NOTICE: 'Notice',
  NOC_LETTER: 'NOC Letter',
};

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PARTIAL: 'Partial',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK: 'Bank Transfer',
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Card',
  OTHER: 'Other',
};

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  RENTAL: 'Rental Income',
  ADVANCE_PAYMENT: 'Advance Payment',
  DEPOSIT: 'Deposit',
  ADDITIONAL_CHARGE: 'Additional Charge',
  OTHER: 'Other Income',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  CLEANING: 'Cleaner Salaries',
  SECURITY: 'Security Guard Salaries',
  WATER: 'Water Bills',
  ELECTRICITY: 'Electricity Bills',
  MAINTENANCE: 'Maintenance Costs',
  REPAIR: 'Repair Costs',
  ADMINISTRATIVE: 'Administrative Expenses',
  MISCELLANEOUS: 'Miscellaneous',
  UTILITIES: 'Utilities',
  INSURANCE: 'Insurance',
  TAXES: 'Taxes',
  OTHER: 'Other',
};

export const EXPENSE_APPROVAL_LABELS: Record<ExpenseApprovalStatus, string> = {
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const SMS_TYPE_LABELS: Record<SmsNotificationType, string> = {
  RENT_REMINDER_15_DAYS: '15-Day Reminder',
  RENT_REMINDER_7_DAYS: '7-Day Reminder',
  RENT_DUE_TODAY: 'Due Today',
  RENT_OVERDUE: 'Overdue Notice',
  ANNOUNCEMENT: 'Announcement',
  MANUAL: 'Manual',
};

export const SMS_STATUS_LABELS: Record<SmsStatus, string> = {
  PENDING: 'Pending',
  SENT: 'Sent',
  FAILED: 'Failed',
  SKIPPED: 'Skipped',
};

export const PAYMENT_PROOF_TYPE_LABELS: Record<PaymentProofType, string> = {
  IMAGE: 'Image receipt',
  DOCUMENT: 'PDF document',
  URL: 'Billing link',
};

export const PAYMENT_PROOF_STATUS_LABELS: Record<PaymentProofStatus, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  GENERAL: 'General',
  MAINTENANCE_NOTICE: 'Maintenance Notice',
  EMERGENCY: 'Emergency',
  RENT_REMINDER: 'Rent Reminder',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const FLOOR_LABELS: Record<number, string> = {
  0: 'Ground Floor',
  1: '1st Floor',
  2: '2nd Floor',
  3: '3rd Floor',
  4: '4th Floor',
  5: '5th Floor',
  6: '6th Floor',
  7: '7th Floor',
  8: '8th Floor',
};

export function floorLabel(floor: number): string {
  return FLOOR_LABELS[floor] ?? `Floor ${floor}`;
}
