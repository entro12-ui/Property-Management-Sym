'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, signOut, getSession } from 'next-auth/react';
import { useLocale } from '@/components/providers/LocaleProvider';

export type LoginFormVariant = 'user' | 'admin';

type LoginFormProps = {
  variant: LoginFormVariant;
  successMessage?: string | null;
  redirectTo?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ variant, successMessage = null, redirectTo = '/dashboard' }: LoginFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const validate = useCallback(
    (email: string, password: string): string | null => {
      const e = email.trim();
      if (!e) return t('auth.emailRequired');
      if (!emailRegex.test(e)) return t('auth.emailInvalid');
      if (!password) return t('auth.passwordRequired');
      if (password.length < 6) return t('auth.passwordMin');
      return null;
    },
    [t]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim() ?? '';
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value ?? '';

    const validationError = validate(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? t('auth.invalidCredentials') : result.error);
        return;
      }
      if (result?.ok) {
        const session = await getSession();
        const role = (session?.user as { role?: string } | undefined)?.role;

        if (variant === 'admin' && role === 'TENANT') {
          await signOut({ redirect: false });
          setError(t('auth.adminOnlyError'));
          return;
        }

        router.push(redirectTo);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isUser = variant === 'user';
  const title = isUser ? t('auth.tenantPortal') : t('auth.adminPortal');
  const subtitle = isUser ? t('auth.tenantSubtitle') : t('auth.adminSubtitle');

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/20 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
      <div className="p-8 sm:p-10">
        <div className="mb-8">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white"
            aria-hidden
          >
            <span className="text-xl font-bold">{isUser ? 'T' : 'A'}</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t('auth.roleHint')}</p>
        </div>

        {successMessage && (
          <div
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20"
            role="alert"
          >
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('auth.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={isSubmitting}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
              placeholder="you@example.com"
              aria-invalid={touched.email && error ? true : undefined}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('auth.password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              minLength={6}
              disabled={isSubmitting}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
              placeholder="••••••••"
              aria-invalid={touched.password && error ? true : undefined}
            />
          </div>

          {error && (
            <div
              id="login-error"
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
            {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <div className="mt-8 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-700">
          {isUser && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {t('auth.tenantAccountNote')}
            </p>
          )}
          {!isUser && (
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              {t('auth.noOwnerAccount')}{' '}
              <Link
                href="/signup"
                className="font-medium text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
              >
                {t('auth.ownerSignUp')}
              </Link>
            </p>
          )}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {isUser ? (
              <>
                {t('auth.staffAdmin')}{' '}
                <Link
                  href="/admin/login"
                  className="font-medium text-slate-700 hover:underline dark:text-slate-300"
                >
                  {t('auth.adminOnly')}
                </Link>
              </>
            ) : (
              <>
                {t('auth.tenantQuestion')}{' '}
                <Link
                  href="/login"
                  className="font-medium text-slate-700 hover:underline dark:text-slate-300"
                >
                  {t('auth.userLogin')}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
