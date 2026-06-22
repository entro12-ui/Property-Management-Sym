'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { useLocale } from '@/components/providers/LocaleProvider';

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const successMessage =
    searchParams.get('registered') === '1' ? t('auth.registeredOwnerSuccess') : null;

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="mb-6 inline-block text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        {t('common.backToHome')}
      </Link>
      <LoginForm variant="admin" successMessage={successMessage} />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
