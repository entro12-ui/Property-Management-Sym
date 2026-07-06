'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { COMPANY } from '@/lib/company';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';
type ProfessionalKey =
  | 'individualLandlords'
  | 'propertyManagement'
  | 'realEstateAgencies'
  | 'buildingDevelopers'
  | 'commercialLandlords';

const PRICING_ETB = {
  starter: { monthly: 5000, yearly: 4200 },
  pro: { monthly: 8000, yearly: 6700 },
} as const;

const PROFESSIONAL_KEYS: ProfessionalKey[] = [
  'individualLandlords',
  'propertyManagement',
  'realEstateAgencies',
  'buildingDevelopers',
  'commercialLandlords',
];

function formatBirr(amount: number) {
  return `${amount.toLocaleString('en-US')} ETB`;
}

export function PricingLanding() {
  const { t } = useLocale();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [professional, setProfessional] = useState<ProfessionalKey>('individualLandlords');
  const [openFaq, setOpenFaq] = useState(0);

  const plans = useMemo(
    () => [
      {
        key: 'starter' as const,
        featured: false,
        name: t('pricing.starterName'),
        subtitle: t('pricing.starterSubtitle'),
        price: formatBirr(PRICING_ETB.starter[billingCycle]),
        ctaLabel: t('pricing.startFreeTrial'),
        ctaHref: '/signup',
        ctaFilled: false,
        features: [
          t('pricing.starterLimitBuildings'),
          t('pricing.starterLimitUnits'),
          t('pricing.starterLimitRoles'),
          t('pricing.starterFeature1'),
          t('pricing.starterFeature2'),
          t('pricing.starterFeature3'),
          t('pricing.starterFeature4'),
        ],
      },
      {
        key: 'pro' as const,
        featured: true,
        badge: t('pricing.proBadge'),
        name: t('pricing.proName'),
        subtitle: t('pricing.proSubtitle'),
        price: formatBirr(PRICING_ETB.pro[billingCycle]),
        ctaLabel: t('pricing.startFreeTrial'),
        ctaHref: '/signup',
        ctaFilled: true,
        features: [
          t('pricing.proLimitBuildings'),
          t('pricing.proLimitUnits'),
          t('pricing.proLimitRoles'),
          t('pricing.proFeature1'),
          t('pricing.proFeature2'),
          t('pricing.proFeature3'),
          t('pricing.proFeature4'),
          t('pricing.proFeature5'),
          t('pricing.proFeature6'),
        ],
      },
      {
        key: 'enterprise' as const,
        featured: false,
        name: t('pricing.enterpriseName'),
        subtitle: t('pricing.enterpriseSubtitle'),
        price: t('pricing.customQuote'),
        ctaLabel: t('pricing.contactSales'),
        ctaHref: `mailto:${COMPANY.email}?subject=${encodeURIComponent('Enterprise pricing inquiry')}`,
        ctaFilled: false,
        features: [
          t('pricing.enterpriseLimitBuildings'),
          t('pricing.enterpriseLimitUnits'),
          t('pricing.enterpriseLimitRoles'),
          t('pricing.enterpriseFeature1'),
          t('pricing.enterpriseFeature2'),
          t('pricing.enterpriseFeature3'),
          t('pricing.enterpriseFeature4'),
          t('pricing.enterpriseFeature5'),
        ],
      },
    ],
    [billingCycle, t]
  );

  const comparisonRows = useMemo(
    () => [
      { label: t('pricing.rowBuildings'), starter: '1', pro: '5', enterprise: t('pricing.unlimited') },
      { label: t('pricing.rowUnits'), starter: '20', pro: '150', enterprise: t('pricing.unlimited') },
      { label: t('pricing.rowRoleAccounts'), starter: '2', pro: t('pricing.unlimited'), enterprise: t('pricing.unlimited') },
      { label: t('pricing.rowPortal'), starter: t('pricing.statusIncluded'), pro: t('pricing.statusIncluded'), enterprise: t('pricing.statusIncluded') },
      { label: t('pricing.rowInvoices'), starter: t('pricing.statusIncluded'), pro: t('pricing.statusIncluded'), enterprise: t('pricing.statusIncluded') },
      { label: t('pricing.rowOcr'), starter: '—', pro: t('pricing.statusIncluded'), enterprise: t('pricing.statusIncluded') },
      { label: t('pricing.rowApprovals'), starter: '—', pro: t('pricing.statusIncluded'), enterprise: t('pricing.statusIncluded') },
      { label: t('pricing.rowSms'), starter: t('pricing.statusBasic'), pro: t('pricing.statusIncluded'), enterprise: t('pricing.statusIncluded') },
      { label: t('pricing.rowExports'), starter: t('pricing.statusBasic'), pro: t('pricing.statusIncluded'), enterprise: t('pricing.statusIncluded') },
      { label: t('pricing.rowOnboarding'), starter: '—', pro: t('pricing.statusOptional'), enterprise: t('pricing.statusIncluded') },
    ],
    [t]
  );

  const faqs = useMemo(
    () => [
      { question: t('pricing.faq1Q'), answer: t('pricing.faq1A') },
      { question: t('pricing.faq2Q'), answer: t('pricing.faq2A') },
      { question: t('pricing.faq3Q'), answer: t('pricing.faq3A') },
      { question: t('pricing.faq4Q'), answer: t('pricing.faq4A') },
    ],
    [t]
  );

  const recommendedPlan = useMemo(() => {
    switch (professional) {
      case 'individualLandlords':
        return t('pricing.recommendStarter');
      case 'propertyManagement':
      case 'realEstateAgencies':
        return t('pricing.recommendPro');
      case 'buildingDevelopers':
      case 'commercialLandlords':
        return t('pricing.recommendEnterprise');
      default:
        return t('pricing.recommendPro');
    }
  }, [professional, t]);

  return (
    <div className="relative overflow-hidden">
      {/* Hero + professional segments */}
      <section className="relative bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('pricing.title')}</h1>
            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">{t('pricing.subtitle')}</p>
          </div>

          <div className="mt-10">
            <p className="text-center text-sm font-medium text-slate-400">{t('pricing.professionalsLabel')}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {PROFESSIONAL_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setProfessional(key)}
                  className={cn(
                    'rounded-full border px-4 py-2.5 text-sm font-medium transition',
                    professional === key
                      ? 'border-indigo-400 bg-indigo-600 text-white'
                      : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500 hover:text-white'
                  )}
                  aria-pressed={professional === key}
                >
                  {t(`pricing.professional.${key}`)}
                </button>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-indigo-200">{recommendedPlan}</p>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="inline-flex rounded-full bg-slate-900 p-1 ring-1 ring-slate-700">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-semibold transition',
                  billingCycle === 'monthly' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                )}
                aria-pressed={billingCycle === 'monthly'}
              >
                {t('pricing.monthly')}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-semibold transition',
                  billingCycle === 'yearly' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                )}
                aria-pressed={billingCycle === 'yearly'}
              >
                {t('pricing.yearly')}
              </button>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
              {t('pricing.save')}
            </span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="mt-3 text-center text-xs text-slate-500">{t('pricing.billingHint')}</p>
          )}
        </div>
      </section>

      {/* Pricing cards */}
      <section className="relative -mt-8 pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.key}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-white p-8 shadow-xl transition dark:bg-slate-900',
                  plan.featured
                    ? 'border-indigo-500 shadow-indigo-200/40 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:shadow-none'
                    : 'border-slate-200 dark:border-slate-700'
                )}
              >
                {plan.featured && plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    {plan.badge}
                  </div>
                )}

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h2>

                <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-4xl font-bold tracking-tight text-indigo-700 dark:text-indigo-400">
                    {plan.price}
                  </span>
                  {plan.key !== 'enterprise' && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">{t('pricing.perMonth')}</span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{plan.subtitle}</p>

                <ul className="mt-8 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href={plan.ctaHref}
                    className={cn(
                      'inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition',
                      plan.ctaFilled
                        ? 'bg-indigo-700 text-white hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500'
                        : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800'
                    )}
                  >
                    {plan.ctaLabel}
                    {!plan.ctaFilled && plan.key === 'enterprise' && <ArrowRight className="h-4 w-4" />}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-y border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-900/50 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('pricing.compareTitle')}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{t('pricing.compareSubtitle')}</p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{t('pricing.compareHeaderFeature')}</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{t('pricing.starterName')}</th>
                    <th className="px-6 py-4 font-semibold text-indigo-700 dark:text-indigo-400">{t('pricing.proName')}</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{t('pricing.enterpriseName')}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr
                      key={row.label}
                      className={index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/80 dark:bg-slate-900/60'}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.label}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.starter}</td>
                      <td className="px-6 py-4 font-medium text-indigo-700 dark:text-indigo-300">{row.pro}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('pricing.faqTitle')}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{t('pricing.faqSubtitle')}</p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{faq.question}</span>
                    <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-500 transition', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-200 px-5 py-4 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-indigo-900 px-6 py-10 text-white sm:px-10 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('pricing.finalTitle')}</h2>
                <p className="mt-4 text-indigo-100">{t('pricing.finalSubtitle')}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-indigo-900 transition hover:bg-indigo-50"
                  >
                    {t('nav.getStartedFree')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={`mailto:${COMPANY.email}?subject=${encodeURIComponent('Pricing consultation')}`}
                    className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    {t('pricing.contactSales')}
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">{t('pricing.contactTitle')}</p>
                <div className="mt-4 space-y-2 text-sm text-indigo-100">
                  <p>{COMPANY.legalName}</p>
                  <a href={`mailto:${COMPANY.email}`} className="block hover:text-white">
                    {COMPANY.email}
                  </a>
                  <a href={COMPANY.phoneHref} className="block hover:text-white">
                    {COMPANY.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
