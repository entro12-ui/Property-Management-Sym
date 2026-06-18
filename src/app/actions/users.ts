'use server';

import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { logActivity } from '@/lib/activity-log';
import type { Role } from '@prisma/client';

const SALT_ROUNDS = 10;
const MANAGEABLE_ROLES: Role[] = [
  'SUPER_ADMIN',
  'BUILDING_OWNER',
  'PROPERTY_MANAGER',
  'ACCOUNTANT',
  'TENANT',
];

export type UserActionResult = { success: true } | { success: false; error: string };

function parseRole(value: string | null): Role | null {
  if (!value || !MANAGEABLE_ROLES.includes(value as Role)) return null;
  return value as Role;
}

function validatePassword(password: string): string | null {
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export async function getUsers() {
  await requireRole(['SUPER_ADMIN']);

  return prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      createdAt: true,
      tenantProfile: { select: { id: true, unit: { select: { unitNumber: true, building: { select: { name: true } } } } } },
    },
  });
}

export async function createUser(formData: FormData): Promise<UserActionResult> {
  const actor = await requireRole(['SUPER_ADMIN']);

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const fullName = (formData.get('fullName') as string)?.trim();
  const password = formData.get('password') as string;
  const phone = (formData.get('phone') as string)?.trim() || null;
  const role = parseRole(formData.get('role') as string);

  if (!email || !fullName || !password) {
    return { success: false, error: 'Email, full name, and password are required.' };
  }
  if (!role) return { success: false, error: 'Please select a valid role.' };

  const passwordError = validatePassword(password);
  if (passwordError) return { success: false, error: passwordError };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: 'A user with this email already exists.' };

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.create({
    data: { email, fullName, passwordHash, phone, role },
  });

  await logActivity({
    userId: actor.id,
    action: 'CREATE',
    entityType: 'User',
    description: `Created user ${email} with role ${role}`,
  });

  revalidatePath('/dashboard/users');
  return { success: true };
}

export async function updateUserAccount(userId: string, formData: FormData): Promise<UserActionResult> {
  const actor = await requireRole(['SUPER_ADMIN']);

  const fullName = (formData.get('fullName') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const phone = (formData.get('phone') as string)?.trim() || null;
  const role = parseRole(formData.get('role') as string);
  const newPassword = (formData.get('newPassword') as string)?.trim() || '';

  if (!fullName || !email) {
    return { success: false, error: 'Full name and email are required.' };
  }
  if (!role) return { success: false, error: 'Please select a valid role.' };

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (target.id === actor.id && role !== 'SUPER_ADMIN') {
    return { success: false, error: 'You cannot remove your own Super Admin role.' };
  }

  if (target.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
    const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    if (superAdminCount <= 1) {
      return { success: false, error: 'At least one Super Admin account must remain.' };
    }
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (emailTaken) return { success: false, error: 'Another user already uses this email.' };

  const data: {
    fullName: string;
    email: string;
    phone: string | null;
    role: Role;
    passwordHash?: string;
  } = { fullName, email, phone, role };

  if (newPassword) {
    const passwordError = validatePassword(newPassword);
    if (passwordError) return { success: false, error: passwordError };
    data.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }

  await prisma.user.update({ where: { id: userId }, data });

  await logActivity({
    userId: actor.id,
    action: 'UPDATE',
    entityType: 'User',
    entityId: userId,
    description: `Updated account ${email}${newPassword ? ' (password reset)' : ''}`,
  });

  revalidatePath('/dashboard/users');
  return { success: true };
}
