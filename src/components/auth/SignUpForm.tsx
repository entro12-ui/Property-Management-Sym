'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2 } from 'lucide-react';
import { signUp } from '@/app/actions/auth';
import { useLocale } from '@/components/providers/LocaleProvider';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpForm() {
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(
    (data: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
      terms: boolean;
    }): string | null => {
      if (!data.fullName.trim()) return t('auth.fullNameRequired');
      if (!data.email.trim()) return t('auth.emailRequired');
      if (!emailRegex.test(data.email.trim())) return t('auth.emailInvalid');
      if (!data.password) return t('auth.passwordRequired');
      if (data.password.length < 6) return t('auth.passwordMin');
      if (data.password !== data.confirmPassword) return t('auth.passwordMismatch');
      if (!data.terms) return t('auth.termsRequired');
      return null;
    },
    [t]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement)?.value ?? '';
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value ?? '';
    const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value ?? '';
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value ?? '';
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement)?.value ?? '';
    const terms = (form.elements.namedItem('terms') as HTMLInputElement)?.checked ?? false;

    const validationError = validate({ fullName, email, phone, password, confirmPassword, terms });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('fullName', fullName.trim());
      formData.set('email', email.trim());
      formData.set('phone', phone.trim());
      formData.set('password', password);
      const result = await signUp(formData);
      if (result?.error) setError(result.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const benefits = [
    t('auth.signUpBenefit1'),
    t('auth.signUpBenefit2'),
    t('auth.signUpBenefit3'),
    t('auth.signUpBenefit4'),
  ];

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/20 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
      <div className="p-8 sm:p-10">
        <div className="mb-8">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white"
            aria-hidden
          >
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {t('auth.signUpTitle')}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('auth.signUpSubtitle')}</p>
        </div>

        <ul className="mb-8 space-y-2 rounded-xl border border-sky-100 bg-sky-50/80 p-4 dark:border-sky-900 dark:bg-sky-950/30">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
              {benefit}
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('auth.fullName')} <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
              placeholder={t('auth.fullNamePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('auth.email')} <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('auth.phone')}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
              placeholder="+251 9XX XXX XXX"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('auth.password')} <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                disabled={isSubmitting}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('auth.passwordHint')}</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('auth.confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                disabled={isSubmitting}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">{t('auth.termsAgree')}</span>
          </label>

          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
              role="alert"
            >
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-slate-800"
          >
            {isSubmitting ? t('auth.creatingAccount') : t('auth.createOwnerAccount')}
          </button>
        </form>

        <div className="mt-8 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-700">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            {t('auth.hasAccount')}{' '}
            <Link
              href="/admin/login"
              className="font-medium text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
            >
              {t('auth.signIn')}
            </Link>
          </p>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t('auth.tenantQuestion')}{' '}
            <Link href="/login" className="font-medium text-slate-700 hover:underline dark:text-slate-300">
              {t('auth.userLogin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
