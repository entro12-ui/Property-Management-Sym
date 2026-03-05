/**
 * Promote a user to SUPER_ADMIN by email.
 * Run from project root:
 *   npm run promote-admin -- your@email.com
 *   PROMOTE_ADMIN_EMAIL=your@email.com npm run promote-admin
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.PROMOTE_ADMIN_EMAIL ?? process.argv[2];
  if (!email) {
    console.error('Usage: npm run promote-admin -- your@email.com');
    console.error('   Or:  PROMOTE_ADMIN_EMAIL=your@email.com npm run promote-admin');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('No user found with email:', email);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPER_ADMIN' },
  });

  console.log('Done. %s is now SUPER_ADMIN. Sign out and sign in again to see the admin menu.', email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
