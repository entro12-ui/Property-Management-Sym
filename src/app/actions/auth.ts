'use server';

import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const SALT_ROUNDS = 10;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFormValue(formData: FormData, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = formData.get(key);
    if (v && typeof v === 'string') return v;
  }
  return null;
}

export async function signUp(formData: FormData) {
  const email = getFormValue(formData, 'email', '1_email')?.trim().toLowerCase();
  const password = getFormValue(formData, 'password', '1_password');
  const fullName = getFormValue(formData, 'fullName', '1_fullName')?.trim() ?? '';
  const phone = getFormValue(formData, 'phone', '1_phone')?.trim() ?? '';

  if (!fullName) return { error: 'Full name is required.' };
  if (!email || !password) return { error: 'Email and password are required.' };
  if (!emailRegex.test(email)) return { error: 'Please enter a valid email address.' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' };

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  if (existing) {
    if (existing.passwordHash) return { error: 'An account with this email already exists.' };
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        fullName: fullName || existing.fullName,
        ...(phone ? { phone } : {}),
      },
    });
  } else {
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'SUPER_ADMIN' : 'BUILDING_OWNER';

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone || null,
        role,
      },
    });
  }

  revalidatePath('/', 'layout');
  redirect('/admin/login?registered=1');
}
