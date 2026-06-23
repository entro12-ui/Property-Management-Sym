import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaLogLevels(): Prisma.LogLevel[] {
  if (process.env.PRISMA_LOG_QUERIES === 'true') {
    return ['query', 'warn', 'error'];
  }
  return ['error'];
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: getPrismaLogLevels(),
  });
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const model = Prisma.dmmf.datamodel.models.find((m) => m.name === 'SmsSettings');
  const hasSmsSettingsFields = !!model?.fields.some((field) => field.name === 'ownerPhone');
  const hasPaymentProofs = Prisma.dmmf.datamodel.models.some((m) => m.name === 'InvoicePaymentProof');

  if (cached && 'smsSettings' in cached && hasSmsSettingsFields && hasPaymentProofs) {
    return cached;
  }

  const client = createPrismaClient();
  // Reuse one client in all environments to avoid exhausting DB connections on Render.
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
