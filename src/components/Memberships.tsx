import { useState, useEffect } from 'react';
import { Sparkles, Heart, Crown, Star, Zap, Gift, Award, Check, ArrowRight, CreditCard, Loader2, Clock } from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { useLang, getTranslation } from '@/i18n/LanguageContext';

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

type PublicPlan = {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  price: number;
  currency: string;
  billingInterval: string;
  stripePriceId: string | null;
  benefits: string[] | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Heart,
  Crown,
  Star,
  Zap,
  Gift,
  Award,
};

const COLOR_MAP: Record<string, string> = {
  blue: 'from-dream-blue to-primary-600',
  purple: 'from-dream-purple to-dream-blue',
  gold: 'from-amber-400 to-amber-600',
  orange: 'from-dream-orange to-dream-red',
  green: 'from-success-400 to-success-600',
  accent: 'from-accent-400 to-accent-600',
};

const DEFAULT_ICON = Sparkles;
const DEFAULT_COLOR = 'from-dream-blue to-primary-600';

function resolveColor(color: string | null): string {
  if (!color) return DEFAULT_COLOR;
  return COLOR_MAP[color] || color;
}

async function fetchPlans(): Promise<PublicPlan[]> {
  return fetch(`${API_BASE}/settings?action=plans`)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => [] as PublicPlan[]);
}

export function Memberships() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<number | null>(null);
  const [plans, setPlans] = useState<PublicPlan[]>([]);

  useEffect(() => {
    let active = true;
    fetchPlans().then((p) => {
      if (active) setPlans(p);
    });
    return () => { active = false; };
  }, []);

  const handleSubscribe = async (planIndex: number) => {
    const plan = plans[planIndex];
    const priceId = plan?.stripePriceId;
    if (!priceId) return;
    setLoading(planIndex);
    try {
      const res = await fetch(`${API_BASE}/stripe?action=create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      console.error('Stripe checkout error:', data.error);
      setLoading(null);
    } catch {
      setLoading(null);
    }
  };

  if (plans.length === 0) {
    return (
      <Section id="membresias" className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow text-primary-700 justify-center">
            <Star className="h-4 w-4" /> {t.memberships.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl text-balance">
            {t.memberships.title1} <span className="text-gradient-dream">{t.memberships.title2}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
            {t.memberships.lead}
          </p>
          <p className="mt-8 text-sm text-ink-400">{t.memberships.comingSoon}</p>
        </div>
      </Section>
    );
  }

  return (
    <Section id="membresias" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[800px] -translate-x-1/2 rounded-full bg-dream-gradient-soft blur-3xl" />

      <Reveal className="mx-auto max-w-3xl text-center">
        <span className="eyebrow text-primary-700 justify-center">
          <Star className="h-4 w-4" /> {t.memberships.eyebrow}
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl text-balance">
          {t.memberships.title1} <span className="text-gradient-dream">{t.memberships.title2}</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
          {t.memberships.lead}
        </p>
      </Reveal>

      <Reveal delay={1} className="mt-9 flex items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-ink-200 bg-ink-50 p-1.5">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              !annual ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            {t.memberships.monthly}
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              annual ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            {t.memberships.annual}
            <span className="rounded-full bg-success-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-700">
              {t.memberships.annualBadge}
            </span>
          </button>
        </div>
      </Reveal>

      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const monthly = plan.price;
          const annualPrice = Math.round(monthly * 10);
          const price = annual ? annualPrice : monthly;
          const Icon = (plan.icon && ICONS[plan.icon]) || DEFAULT_ICON;
          const color = resolveColor(plan.color);
          const isHighlighted = i === 1;
          const hasPriceId = Boolean(plan.stripePriceId);
          const isLoading = loading === i;
          const benefits = plan.benefits || [];

          return (
            <Reveal key={plan.id} delay={(i + 1) as 0 | 1 | 2 | 3 | 4 | 5} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-3xl border-2 bg-white p-7 transition-all duration-300 hover:-translate-y-1 ${
                  isHighlighted
                    ? 'border-dream-orange/40 shadow-glow-dream lg:scale-[1.04]'
                    : 'border-ink-100 shadow-card hover:shadow-card'
                }`}
              >
                {isHighlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-dream-gradient px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-glow-dream">
                    {t.memberships.popular}
                  </span>
                )}

                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 font-display text-xl font-extrabold text-ink-900">{plan.name}</h3>
                {plan.tagline && <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>}

                <div className="mt-6 flex items-end gap-1.5">
                  <span className="font-display text-4xl font-extrabold text-ink-900">${price}</span>
                  <span className="mb-1 text-sm font-medium text-ink-400">/ {annual ? t.memberships.perYear : t.memberships.perMonth}</span>
                </div>

                {benefits.length > 0 && (
                  <ul className="mt-6 flex-1 space-y-3">
                    {benefits.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-ink-700">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white`}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {hasPriceId ? (
                  <button
                    type="button"
                    onClick={() => handleSubscribe(i)}
                    disabled={isLoading}
                    className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
                      isHighlighted
                        ? 'btn-dream'
                        : 'border border-ink-200 bg-white text-ink-800 hover:border-primary-400 hover:text-primary-700'
                    }`}
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {t.memberships.processing}</>
                    ) : (
                      <><CreditCard className="h-4 w-4" /> {t.memberships.subscribe} <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-7 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-6 py-3.5 text-sm font-semibold text-ink-400"
                  >
                    <Clock className="h-4 w-4" /> {t.memberships.comingSoon}
                  </button>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={3} className="mx-auto mt-10 max-w-2xl">
        <p className="flex items-center justify-center gap-2 text-center text-xs text-ink-400">
          <Zap className="h-3.5 w-3.5 text-dream-orange" />
          {t.memberships.footer}
        </p>
      </Reveal>
    </Section>
  );
}
