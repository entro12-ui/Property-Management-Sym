/**
 * Apply property-management schema changes WITHOUT dropping unrelated tables.
 * Safe for shared PostgreSQL databases.
 *
 * Run: npm run db:sync
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statements = [
  // --- Enums (create if missing) ---
  `DO $$ BEGIN CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'PENDING', 'VACATED', 'SUSPENDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'QUARTERLY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "IncomeType" AS ENUM ('RENTAL', 'ADVANCE_PAYMENT', 'DEPOSIT', 'ADDITIONAL_CHARGE', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "ExpenseApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "SmsNotificationType" AS ENUM ('RENT_REMINDER_15_DAYS', 'RENT_REMINDER_7_DAYS', 'RENT_DUE_TODAY', 'RENT_OVERDUE', 'ANNOUNCEMENT', 'MANUAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "SmsStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // --- Extend existing enums ---
  `ALTER TYPE "UnitType" ADD VALUE IF NOT EXISTS 'ROOM'`,
  `ALTER TYPE "UnitStatus" ADD VALUE IF NOT EXISTS 'RESERVED'`,
  `ALTER TYPE "ExpenseCategory" ADD VALUE IF NOT EXISTS 'CLEANING'`,
  `ALTER TYPE "ExpenseCategory" ADD VALUE IF NOT EXISTS 'SECURITY'`,
  `ALTER TYPE "ExpenseCategory" ADD VALUE IF NOT EXISTS 'WATER'`,
  `ALTER TYPE "ExpenseCategory" ADD VALUE IF NOT EXISTS 'ELECTRICITY'`,
  `ALTER TYPE "ExpenseCategory" ADD VALUE IF NOT EXISTS 'MAINTENANCE'`,
  `ALTER TYPE "ExpenseCategory" ADD VALUE IF NOT EXISTS 'REPAIR'`,
  `ALTER TYPE "ExpenseCategory" ADD VALUE IF NOT EXISTS 'ADMINISTRATIVE'`,
  `ALTER TYPE "ExpenseCategory" ADD VALUE IF NOT EXISTS 'MISCELLANEOUS'`,
  `ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'NATIONAL_ID_FRONT'`,
  `ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'NATIONAL_ID_BACK'`,
  `ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'LEASE_AGREEMENT'`,
  `ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'RENTAL_AGREEMENT'`,
  `ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'OTHER'`,

  // --- TenantProfile ---
  `ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "address" TEXT`,
  `ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "national_id" TEXT`,
  `ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "occupation" TEXT`,
  `ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "tenant_status" "TenantStatus" DEFAULT 'ACTIVE'`,

  // --- Invoice ---
  `ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "period_type" "BillingPeriod" DEFAULT 'QUARTERLY'`,
  `ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "quarter" INTEGER`,
  `ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "period_start" DATE`,
  `ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "period_end" DATE`,
  `ALTER TABLE "Invoice" ALTER COLUMN "month" DROP NOT NULL`,

  // --- Payment ---
  `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "receipt_number" TEXT`,

  // --- Expense ---
  `ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "receipt_url" TEXT`,
  `ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "approval_status" "ExpenseApprovalStatus" DEFAULT 'PENDING'`,
  `ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "approved_by_id" TEXT`,
  `ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3)`,

  // --- New tables ---
  `CREATE TABLE IF NOT EXISTS "TenantDocument" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "uploaded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TenantDocument_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "TenantUnitHistory" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "assigned_at" DATE NOT NULL,
    "vacated_at" DATE,
    "notes" TEXT,
    CONSTRAINT "TenantUnitHistory_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "Income" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "type" "IncomeType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "income_date" DATE NOT NULL,
    "recorded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "SmsNotificationLog" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "invoice_id" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "SmsNotificationType" NOT NULL,
    "status" "SmsStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SmsNotificationLog_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
  )`,

  // --- Foreign keys (ignore if exist) ---
  `DO $$ BEGIN
    ALTER TABLE "TenantDocument" ADD CONSTRAINT "TenantDocument_tenant_id_fkey"
      FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "TenantDocument" ADD CONSTRAINT "TenantDocument_uploaded_by_id_fkey"
      FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "TenantUnitHistory" ADD CONSTRAINT "TenantUnitHistory_tenant_id_fkey"
      FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "TenantUnitHistory" ADD CONSTRAINT "TenantUnitHistory_unit_id_fkey"
      FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "Income" ADD CONSTRAINT "Income_building_id_fkey"
      FOREIGN KEY ("building_id") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "Income" ADD CONSTRAINT "Income_tenant_id_fkey"
      FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "Income" ADD CONSTRAINT "Income_recorded_by_id_fkey"
      FOREIGN KEY ("recorded_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "Expense" ADD CONSTRAINT "Expense_approved_by_id_fkey"
      FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "SmsNotificationLog" ADD CONSTRAINT "SmsNotificationLog_tenant_id_fkey"
      FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "SmsNotificationLog" ADD CONSTRAINT "SmsNotificationLog_invoice_id_fkey"
      FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // Backfill tenant_status for existing rows
  `UPDATE "TenantProfile" SET "tenant_status" = 'ACTIVE' WHERE "tenant_status" IS NULL`,
];

async function main() {
  console.log('Applying incremental schema sync…');
  let ok = 0;
  let skipped = 0;

  for (const sql of statements) {
    const label = sql.slice(0, 60).replace(/\s+/g, ' ');
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('✓', label);
      ok++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log('· skipped (exists):', label);
        skipped++;
      } else {
        console.error('✗ failed:', label);
        console.error(' ', msg);
        throw e;
      }
    }
  }

  console.log(`\nDone. ${ok} applied, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
