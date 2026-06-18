import { PrismaClient, type Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaLogLevels(): Prisma.LogLevel[] {
  if (process.env.PRISMA_LOG_QUERIES === 'true') {
    return ['query', 'warn', 'error'];
  }
  return ['error'];
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: getPrismaLogLevels(),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
