'use client';

import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';
import { MarketingShell } from '@/components/layout/MarketingShell';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  MessageSquare,
  Shield,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

const FEATURE_ICONS = [Users, BarChart3, MessageSquare] as const;

export function HomeLanding() {
  const { t } = useLocale();

  const features = [
    { title: t('home.feature1Title'), desc: t('home.feature1Desc'), icon: FEATURE_ICONS[0] },
    { title: t('home.feature2Title'), desc: t('home.feature2Desc'), icon: FEATURE_ICONS[1] },
    { title: t('home.feature3Title'), desc: t('home.feature3Desc'), icon: FEATURE_ICONS[2] },
  ];

  const adminPortalFeatures = [
    t('home.adminPortalFeature1'),
    t('home.adminPortalFeature2'),
    t('home.adminPortalFeature3'),
    t('home.adminPortalFeature4'),
    t('home.adminPortalFeature5'),
    t('home.adminPortalFeature6'),
    t('home.adminPortalFeature7'),
  ];

  const tenantPortalFeatures = [
    t('home.tenantPortalFeature1'),
    t('home.tenantPortalFeature2'),
    t('home.tenantPortalFeature3'),
    t('home.tenantPortalFeature4'),
    t('home.tenantPortalFeature5'),
    t('home.tenantPortalFeature6'),
    t('home.tenantPortalFeature7'),
  ];

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 sm:mb-6 sm:px-4 sm:text-sm dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
              <Shield className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('home.tagline')}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {t('home.title')}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:mt-6 sm:text-lg md:text-xl">
              {t('home.description')}
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-600/30"
              >
                {t('home.ownerGetStarted')}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Building2 className="h-4 w-4" />
                {t('home.adminLogin')}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {t('home.tenantLogin')}
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t('home.ownerGetStartedDesc')}</p>
            <div className="mt-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
              >
                {t('nav.pricing')}
                <ArrowRight className="h-4 w-4" />
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
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
                {[
                  { label: t('nav.tenants'), value: '50+', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50' },
                  { label: t('nav.income'), value: t('nav.rentFinancial'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' },
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
      <section id="features" className="relative border-t border-slate-200/80 bg-white/60 py-12 sm:py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {t('home.featuresTitle')}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{t('home.featuresSubtitle')}</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Portals */}
      <section className="relative border-t border-slate-200/80 py-12 sm:py-20 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {t('home.portalsTitle')}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{t('home.portalsSubtitle')}</p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Admin Portal */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-6 py-6 dark:border-slate-700 dark:from-indigo-950/50 dark:to-sky-950/50">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {t('home.adminPortalTitle')}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      {t('home.adminPortalSubtitle')}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {t('home.adminPortalDesc')}
                </p>
              </div>
              <ul className="flex-1 space-y-3 px-6 py-6">
                {adminPortalFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-200 px-6 py-5 dark:border-slate-700">
                <Link
                  href="/admin/login"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
                >
                  {t('home.adminPortalCta')}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Tenant Portal */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-6 dark:border-slate-700 dark:from-emerald-950/50 dark:to-teal-950/50">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {t('home.tenantPortalTitle')}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {t('home.tenantPortalSubtitle')}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {t('home.tenantPortalDesc')}
                </p>
              </div>
              <ul className="flex-1 space-y-3 px-6 py-6">
                {tenantPortalFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-200 px-6 py-5 dark:border-slate-700">
                <Link
                  href="/login"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                >
                  {t('home.tenantPortalCta')}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-sky-700 px-5 py-10 text-center shadow-xl shadow-sky-600/20 sm:px-8 sm:py-14 md:px-16">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">{t('home.ctaTitle')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-sky-100 sm:mt-4 sm:text-base">{t('home.ctaSubtitle')}</p>
            <div className="mt-6 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-sky-700 transition hover:bg-sky-50 sm:w-auto sm:min-w-[200px]"
              >
                {t('home.ownerGetStarted')}
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:min-w-[200px]"
              >
                {t('home.adminLogin')}
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-white/20 px-6 py-3 font-semibold text-white/90 transition hover:bg-white/10 sm:w-auto sm:min-w-[200px]"
              >
                {t('home.tenantLogin')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
