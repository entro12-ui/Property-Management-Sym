import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { HomeLanding } from '@/components/home/HomeLanding';

export default async function HomePage() {
  const user = await getAuthUser();
  if (user) redirect('/dashboard');

  return <HomeLanding />;
}
