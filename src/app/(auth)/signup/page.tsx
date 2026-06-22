'use client';

import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function SignUpPage() {
  const { t } = useLocale();

  return (
    <div className="w-full max-w-lg">
      <Link
        href="/"
        className="mb-6 inline-block text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        {t('common.backToHome')}
      </Link>
      <SignUpForm />
    </div>
  );
}
