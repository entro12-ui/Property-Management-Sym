import type { Role, UnitType, UnitStatus, InvoiceStatus, PaymentMethod, AnnouncementType, MaintenanceStatus, UrgencyLevel } from '@prisma/client';

export type { Role, UnitType, UnitStatus, InvoiceStatus, PaymentMethod, AnnouncementType, MaintenanceStatus, UrgencyLevel };

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  BUILDING_OWNER: 'Building Owner',
  PROPERTY_MANAGER: 'Property Manager',
  ACCOUNTANT: 'Accountant',
  TENANT: 'Tenant',
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  SHOP: 'Shop',
  OFFICE: 'Office',
  RESTAURANT: 'Restaurant',
  CLINIC: 'Clinic',
  APARTMENT: 'Apartment',
};

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  MAINTENANCE: 'Maintenance',
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
