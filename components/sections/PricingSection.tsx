'use client';
import { CheckCircle2, Sparkles, ArrowRight, Zap } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: '0',
    period: 'forever',
    badge: 'Free Forever',
    desc: 'Perfect for occasional job seekers.',
    features: [
      '5 analyses per month',
      'Basic match score',
      'Keyword suggestions',
      'Email support',
    ],
    cta: 'Get Started Free',
    popular: false,
    gradient: 'from-slate-600 to-slate-700',
  },
  {
    name: 'Pro',
    price: '19',
    period: 'month',
    badge: '🔥 Most Popular',
    desc: 'For active job seekers who want an edge.',
    features: [
      'Unlimited analyses',
      'Advanced AI insights',
      'ATS optimization score',
      'Priority support',
      'Export PDF reports',
      'Progress history',
    ],
    cta: 'Start 7-Day Free Trial',
    popular: true,
    gradient: 'from-violet-500 to-cyan-500',
  },
  {
    name: 'Enterprise',
    price: '49',
    period: 'month',
    badge: 'For Teams',
    desc: 'Full power for career coaches & recruiters.',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Bulk resume analysis',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-indigo-500 to-violet-600',
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 md:py-40 flex flex-col items-center bg-black">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="badge mb-4">
            <Zap className="w-3 h-3" /> Simple Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Start Free.{' '}
            <span className="gradient-text">Upgrade Anytime.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            No hidden fees. No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`glass-panel p-8 bg-white/[0.01] border-white/5 relative flex flex-col transition-all duration-500 animate-fade-in-up ${
                plan.popular
                  ? 'border-violet-500/40 shadow-2xl shadow-violet-900/30 -translate-y-2 md:-translate-y-4'
                  : 'hover:-translate-y-1'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-lg shadow-violet-900/40 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r ${plan.gradient} rounded-lg mb-3`}>
                  <span className="text-xs font-bold text-white">{!plan.popular ? plan.badge : 'PRO'}</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{plan.desc}</p>
              </div>

              {/* Price */}
              <div className="flex items-end gap-1 mb-8">
                <span className="text-gray-500 text-xl self-start mt-1.5 font-bold">$</span>
                <span className="text-6xl font-black text-white">{plan.price}</span>
                <span className="text-gray-500 text-sm mb-2.5 font-bold tracking-tight">/{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5'
                    : 'btn-secondary'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <p className="text-center text-slate-500 text-sm mt-10">
          🔒 30-day money-back guarantee · Secure HTTPS payments · Cancel anytime
        </p>
      </div>
    </section>
  );
}
