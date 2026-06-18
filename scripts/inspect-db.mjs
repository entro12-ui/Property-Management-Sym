import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const enums = await prisma.$queryRaw`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname IN ('ExpenseCategory', 'DocumentType', 'UnitType', 'UnitStatus', 'TenantStatus', 'BillingPeriod', 'IncomeType', 'ExpenseApprovalStatus', 'SmsNotificationType', 'SmsStatus')
    ORDER BY t.typname, e.enumsortorder`;
  console.log(JSON.stringify(enums, null, 2));

  const paymentCols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'Payment'`;
  console.log('Payment:', paymentCols);

  const unitCols = await prisma.$queryRaw`
    SELECT column_name, udt_name FROM information_schema.columns WHERE table_name = 'Unit'`;
  console.log('Unit:', unitCols);
}

main().finally(() => prisma.$disconnect());
