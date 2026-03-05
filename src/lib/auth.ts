import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { nextAuthOptions } from '@/lib/next-auth-options';
import { prisma } from '@/lib/db';
import type { Role } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
  avatarUrl: string | null;
  tenantProfileId: string | null;
  unitId: string | null;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenantProfile: true },
  });
  if (!dbUser) return null;

  return {
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.fullName,
    phone: dbUser.phone,
    role: dbUser.role,
    avatarUrl: dbUser.avatarUrl,
    tenantProfileId: dbUser.tenantProfile?.id ?? null,
    unitId: dbUser.tenantProfile?.unitId ?? null,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(allowedRoles: readonly Role[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) redirect('/dashboard');
  return user;
}
