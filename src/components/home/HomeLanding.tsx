'use client';

import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';
import { MarketingShell } from '@/components/layout/MarketingShell';
import {
  ArrowRight,
  BarChart3,
  Building2,
  MessageSquare,
  Shield,
  Users,
  Wallet,
} from 'lucide-react';

const FEATURE_ICONS = [Users, Wallet, BarChart3, MessageSquare] as const;

export function HomeLanding() {
  const { t } = useLocale();

  const features = [
    { title: t('home.feature1Title'), desc: t('home.feature1Desc'), icon: FEATURE_ICONS[0] },
    { title: t('home.feature2Title'), desc: t('home.feature2Desc'), icon: FEATURE_ICONS[1] },
    { title: t('home.feature3Title'), desc: t('home.feature3Desc'), icon: FEATURE_ICONS[2] },
    { title: t('home.feature4Title'), desc: t('home.feature4Desc'), icon: FEATURE_ICONS[3] },
  ];

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
              <Shield className="h-4 w-4" />
              {t('home.tagline')}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              {t('home.title')}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
              {t('home.description')}
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-600/30"
              >
                {t('home.tenantLogin')}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Building2 className="h-4 w-4" />
                {t('home.adminLogin')}
              </Link>
            </div>
          </div>

          {/* Preview card */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/80">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-slate-400">{t('nav.dashboard')}</span>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-3">
                {[
                  { label: t('nav.tenants'), value: '50+', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50' },
                  { label: t('nav.invoices'), value: t('nav.rentFinancial'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' },
                  { label: t('nav.reports'), value: 'PDF / Excel', color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/50' },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
                    <p className="text-xs font-medium uppercase tracking-wide opacity-80">{stat.label}</p>
                    <p className="mt-1 text-lg font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative border-t border-slate-200/80 bg-white/60 py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('home.featuresTitle')}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{t('home.featuresSubtitle')}</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, desc, icon: Icon }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-800"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white dark:bg-sky-950 dark:text-sky-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-sky-700 px-8 py-14 text-center shadow-xl shadow-sky-600/20 sm:px-16">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('home.ctaTitle')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sky-100">{t('home.ctaSubtitle')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex min-w-[200px] items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                {t('home.tenantLogin')}
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex min-w-[200px] items-center justify-center rounded-xl border-2 border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                {t('home.adminLogin')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
