'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function AdminLoginPage() {
  const { t } = useLocale();

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="mb-6 inline-block text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        {t('common.backToHome')}
      </Link>
      <LoginForm variant="admin" />
    </div>
  );
}
