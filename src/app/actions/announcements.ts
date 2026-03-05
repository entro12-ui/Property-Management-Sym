'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { AnnouncementType } from '@prisma/client';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER'] as const;

export async function getAnnouncements() {
  const user = await requireAuth();
  const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);

  if (isAdmin) {
    return prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { fullName: true } },
        building: { select: { name: true } },
      },
    });
  }

  return prisma.announcement.findMany({
    where: { buildingId: user.unitId ? undefined : undefined },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { fullName: true } },
      building: { select: { name: true } },
    },
  });
}

export async function getAnnouncement(id: string) {
  await requireAuth();
  return prisma.announcement.findUniqueOrThrow({
    where: { id },
    include: {
      author: { select: { fullName: true, email: true } },
      building: { select: { name: true } },
    },
  });
}

export async function createAnnouncement(formData: FormData) {
  const user = await requireRole(ADMIN_ROLES);
  const buildingId = (formData.get('buildingId') as string) || undefined;
  const type = (formData.get('type') as AnnouncementType) || 'GENERAL';
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const sendSms = formData.get('sendSms') === 'on';

  await prisma.announcement.create({
    data: {
      buildingId: buildingId || null,
      authorId: user.id,
      type,
      title,
      body,
      sendSms,
    },
  });
  revalidatePath('/dashboard/announcements');
  revalidatePath('/dashboard');
}

export async function markAnnouncementRead(announcementId: string, reply?: string) {
  const user = await requireAuth();
  const existing = await prisma.announcementRead.findFirst({
    where: { announcementId, userId: user.id },
  });
  if (existing) {
    await prisma.announcementRead.update({
      where: { id: existing.id },
      data: { readAt: new Date(), reply: reply ?? undefined },
    });
  } else {
    await prisma.announcementRead.create({
      data: { announcementId, userId: user.id, reply: reply ?? undefined },
    });
  }
  revalidatePath('/dashboard/announcements');
}
