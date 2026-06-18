'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { sendSms as deliverSms } from '@/lib/sms';
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

  let buildingId: string | undefined;
  if (user.unitId) {
    const unit = await prisma.unit.findUnique({ where: { id: user.unitId }, select: { buildingId: true, floorNumber: true } });
    buildingId = unit?.buildingId;
  }

  const announcements = await prisma.announcement.findMany({
    where: buildingId ? { OR: [{ buildingId }, { buildingId: null }] } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { fullName: true } },
      building: { select: { name: true } },
    },
  });

  if (!user.unitId) return announcements;

  const unit = await prisma.unit.findUnique({ where: { id: user.unitId } });
  if (!unit) return announcements;

  return announcements.filter((a) => {
    if (a.targetUnitIds.length > 0 && !a.targetUnitIds.includes(user.unitId!)) return false;
    if (a.targetFloors.length > 0 && !a.targetFloors.includes(unit.floorNumber)) return false;
    return true;
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
  const shouldSendSms = formData.get('sendSms') === 'on';

  await prisma.announcement.create({
    data: {
      buildingId: buildingId || null,
      authorId: user.id,
      type,
      title,
      body,
      sendSms: shouldSendSms,
    },
  });

  if (shouldSendSms && buildingId) {
    const tenants = await prisma.tenantProfile.findMany({
      where: { unit: { buildingId }, tenantStatus: 'ACTIVE' },
      include: { user: true, unit: true },
    });
    const contactPhone = process.env.BUILDING_CONTACT_PHONE ?? '';
    for (const t of tenants) {
      if (!t.user.phone) continue;
      const msg = `${title}: ${body.slice(0, 140)}${contactPhone ? ` Contact: ${contactPhone}` : ''}`;
      await deliverSms({
        phone: t.user.phone,
        message: msg,
        type: 'ANNOUNCEMENT',
        tenantId: t.id,
      });
    }
  }

  revalidatePath('/dashboard/announcements');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/notifications');
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
