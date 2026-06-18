import { prisma } from '@/lib/db';

export async function logActivity(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
}) {
  try {
    await prisma.activityLog.create({ data: params });
  } catch {
    // Non-critical; don't block main operations
  }
}
