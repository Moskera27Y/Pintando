import { useEffect, useState } from 'react';
import {
  Award, Crown, Star, Medal, Gem, Trophy, Heart, Sparkles, Shield, Zap,
  Check, X, ArrowRight, CreditCard, Zap as ZapIcon,
} from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { useLang } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

type Level = {
  id: string;
  nameEn: string;
  nameEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  minAmount: number;
  maxAmount: number | null;
  buttonTextEn: string;
  buttonTextEs: string;
  buttonAction: string;
  icon: string;
  color: string;
  featured: boolean;
  displayOrder: number;
};

type Benefit = {
  id: string;
  textEn: string;
  textEs: string;
  displayOrder: number;
};

type BenefitLevel = {
  benefitId: string;
  levelId: string;
  included: boolean;
};

type SectionData = {
  titleEn: string;
  titleEs: string;
  subtitleEn: string;
  subtitleEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
};

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

const ICON_MAP: Record<string, typeof Award> = {
  Award, Crown, Star, Medal, Gem, Trophy, Heart, Sparkles, Shield, Zap,
};

const COLOR_STYLES: Record<string, {
  text: string;
  bg: string;
  border: string;
  accent: string;
  gradient: string;
  ring: string;
  badge: string;
}> = {
  blue: {
    text: 'text-primary-700',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    accent: 'bg-primary-600',
    gradient: 'from-primary-500 to-primary-700',
    ring: 'ring-primary-300',
    badge: 'bg-primary-100 text-primary-700',
  },
  green: {
    text: 'text-success-700',
    bg: 'bg-success-50',
    border: 'border-success-200',
    accent: 'bg-success-600',
    gradient: 'from-success-500 to-success-700',
    ring: 'ring-success-300',
    badge: 'bg-success-100 text-success-700',
  },
  gold: {
    text: 'text-warning-700',
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    accent: 'bg-warning-600',
    gradient: 'from-warning-500 to-warning-700',
    ring: 'ring-warning-300',
    badge: 'bg-warning-100 text-warning-700',
  },
  orange: {
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    accent: 'bg-orange-600',
    gradient: 'from-orange-500 to-orange-700',
    ring: 'ring-orange-300',
    badge: 'bg-orange-100 text-orange-700',
  },
  accent: {
    text: 'text-accent-700',
    bg: 'bg-accent-50',
    border: 'border-accent-200',
    accent: 'bg-accent-600',
    gradient: 'from-accent-500 to-accent-700',
    ring: 'ring-accent-300',
    badge: 'bg-accent-100 text-accent-700',
  },
  purple: {
    text: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    accent: 'bg-purple-600',
    gradient: 'from-purple-500 to-purple-700',
    ring: 'ring-purple-300',
    badge: 'bg-purple-100 text-purple-700',
  },
};

function buildPayPalLink(base: string, amount: number): string {
  if (!base) return '';
  const trimmed = base.trim();
  if (trimmed.endsWith('/')) return `${trimmed}${amount.toFixed(2)}`;
  return `${trimmed}/${amount.toFixed(2)}`;
}

export function SponsorshipSection() {
  const { lang } = useLang();
  const settings = useSiteSettings();
  const [levels, setLevels] = useState<Level[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [matrix, setMatrix] = useState<BenefitLevel[]>([]);
  const [section, setSection] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/donation-guide?action=sponsorship-public`)
      .then((r) => (r.ok ? r.json() : { levels: [], benefits: [], benefitLevels: [], section: null }))
      .then((data: { levels: Level[]; benefits: Benefit[]; benefitLevels: BenefitLevel[]; section: SectionData | null }) => {
        setLevels(data.levels || []);
        setBenefits(data.benefits || []);
        setMatrix(data.benefitLevels || []);
        setSection(data.section || null);
      })
      .catch(() => {
        setLevels([]);
        setBenefits([]);
        setMatrix([]);
        setSection(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const stripeDonationLink = settings.stripe?.donationLink || 'https://donate.stripe.com/test_3cI9AVgzK6fu3SU5KF1Jm00';
  const paypalLink = settings.donation?.paypalLink || 'https://paypal.me/Pintando712';

  const isEs = lang === 'es';

  const title = isEs
    ? (section?.titleEs || 'Niveles de Patrocinio')
    : (section?.titleEn || 'Become a Community Sponsor');
  const subtitle = isEs
    ? (section?.subtitleEs || 'Únase a nosotros como socio comunitario y transforme vidas.')
    : (section?.subtitleEn || 'Join us in transforming homes and changing lives.');
  const description = isEs ? (section?.descriptionEs || null) : (section?.descriptionEn || null);

  const handleStripe = () => {
    window.open(stripeDonationLink, '_blank', 'noopener,noreferrer');
  };

  const handlePayPal = (amount: number) => {
    window.open(buildPayPalLink(paypalLink, amount), '_blank', 'noopener,noreferrer');
  };

  const handleLevelButton = (level: Level) => {
    const action = level.buttonAction || 'both';
    if (action === 'stripe') {
      handleStripe();
    } else if (action === 'paypal') {
      handlePayPal(level.minAmount);
    } else if (action === 'contact') {
      window.location.hash = 'contacto';
    } else {
      handleStripe();
    }
  };

  const isCellIncluded = (benefitId: string, levelId: string): boolean => {
    const cell = matrix.find((m) => m.benefitId === benefitId && m.levelId === levelId);
    return cell ? cell.included : false;
  };

  if (loading) {
    return (
      <Section className="py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        </div>
      </Section>
    );
  }

  if (levels.length === 0) return null;

  return (
    <Section id="patrocinio" className="py-16">
      {/* Heading */}
      <div className="mb-12 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-700">
            <Award className="h-3.5 w-3.5" />
            {isEs ? 'Patrocinio Comunitario' : 'Community Sponsorship'}
          </span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-4 text-3xl font-bold text-ink-900 sm:text-4xl">{title}</h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-600 leading-relaxed">{subtitle}</p>
        </Reveal>
        {description && (
          <Reveal delay={3}>
            <p className="mx-auto mt-4 max-w-3xl text-base text-ink-500 leading-relaxed whitespace-pre-line">{description}</p>
          </Reveal>
        )}
      </div>

      {/* ── Desktop / Tablet: Comparison Table ─────────────────────────── */}
      <Reveal delay={2}>
        <div className="hidden overflow-hidden rounded-3xl border border-ink-100 shadow-soft md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-ink-50 px-6 py-5 text-left align-bottom">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink-500">
                      {isEs ? 'Beneficio' : 'Benefit'}
                    </span>
                  </th>
                  {levels.map((level) => {
                    const Icon = ICON_MAP[level.icon] || Award;
                    const styles = COLOR_STYLES[level.color] || COLOR_STYLES.blue;
                    return (
                      <th key={level.id} className={`relative px-6 py-5 text-center align-bottom ${level.featured ? styles.bg : 'bg-white'}`}>
                        {level.featured && (
                          <span className={`absolute -top-px left-0 right-0 rounded-t-2xl bg-gradient-to-r ${styles.gradient} px-3 py-1 text-xs font-bold text-white`}>
                            {isEs ? 'Destacado' : 'Featured'}
                          </span>
                        )}
                        <div className="flex flex-col items-center gap-2 pt-2">
                          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.accent} text-white shadow-lg`}>
                            <Icon className="h-6 w-6" />
                          </span>
                          <span className="text-lg font-bold text-ink-900">{isEs ? level.nameEs : level.nameEn}</span>
                          <span className="text-sm font-mono text-ink-600">
                            ${level.minAmount.toLocaleString()}{level.maxAmount != null ? ` – $${level.maxAmount.toLocaleString()}` : '+'}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {benefits.map((benefit, bIdx) => (
                  <tr key={benefit.id} className={bIdx % 2 === 0 ? 'bg-white' : 'bg-ink-50/30'}>
                    <td className="px-6 py-3.5 text-sm font-medium text-ink-700">
                      {isEs ? benefit.textEs : benefit.textEn}
                    </td>
                    {levels.map((level) => {
                      const included = isCellIncluded(benefit.id, level.id);
                      const styles = COLOR_STYLES[level.color] || COLOR_STYLES.blue;
                      return (
                        <td key={level.id} className={`px-6 py-3.5 text-center ${level.featured ? styles.bg : ''}`}>
                          {included ? (
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${styles.accent} text-white`}>
                              <Check className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 text-ink-300">
                              <X className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Donate buttons row */}
                <tr>
                  <td className="bg-ink-50 px-6 py-5"></td>
                  {levels.map((level) => {
                    const styles = COLOR_STYLES[level.color] || COLOR_STYLES.blue;
                    const btnText = isEs ? level.buttonTextEs : level.buttonTextEn;
                    return (
                      <td key={level.id} className={`px-6 py-5 text-center ${level.featured ? styles.bg : 'bg-white'}`}>
                        <div className="flex flex-col items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLevelButton(level)}
                            className={`inline-flex items-center justify-center gap-1.5 rounded-full ${styles.accent} px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5`}
                          >
                            {level.buttonAction === 'paypal' ? <CreditCard className="h-4 w-4" /> : <ZapIcon className="h-4 w-4" />}
                            {btnText}
                          </button>
                          {(level.buttonAction === 'both' || level.buttonAction === 'paypal') && (
                            <button
                              type="button"
                              onClick={() => handlePayPal(level.minAmount)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700 transition-all duration-300 hover:bg-ink-50"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              PayPal
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* ── Mobile: Cards ──────────────────────────────────────────────── */}
      <div className="space-y-5 md:hidden">
        {levels.map((level, lIdx) => {
          const Icon = ICON_MAP[level.icon] || Award;
          const styles = COLOR_STYLES[level.color] || COLOR_STYLES.blue;
          const levelBenefits = benefits.filter((b) => isCellIncluded(b.id, level.id));
          return (
            <Reveal key={level.id} delay={(lIdx % 3) as 0 | 1 | 2}>
              <article className={`relative flex flex-col overflow-hidden rounded-2xl border-2 ${level.featured ? styles.border : 'border-ink-100'} bg-white shadow-soft`}>
                {level.featured && (
                  <div className={`bg-gradient-to-r ${styles.gradient} px-4 py-1.5 text-center text-xs font-bold text-white`}>
                    {isEs ? 'Destacado' : 'Featured'}
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.accent} text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-ink-900">{isEs ? level.nameEs : level.nameEn}</h3>
                      <p className="text-sm font-mono text-ink-600">
                        ${level.minAmount.toLocaleString()}{level.maxAmount != null ? ` – $${level.maxAmount.toLocaleString()}` : '+'}
                      </p>
                    </div>
                  </div>

                  {(isEs ? level.descriptionEs : level.descriptionEn) && (
                    <p className="mt-3 text-sm text-ink-600 leading-relaxed">
                      {isEs ? level.descriptionEs : level.descriptionEn}
                    </p>
                  )}

                  {levelBenefits.length > 0 && (
                    <ul className="mt-5 space-y-2.5">
                      {levelBenefits.map((benefit) => (
                        <li key={benefit.id} className="flex items-start gap-2.5">
                          <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${styles.accent} text-white`}>
                            <Check className="h-3 w-3" />
                          </span>
                          <span className="text-sm text-ink-700">{isEs ? benefit.textEs : benefit.textEn}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleLevelButton(level)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-full ${styles.accent} px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 active:scale-95`}
                    >
                      {level.buttonAction === 'paypal' ? <CreditCard className="h-4 w-4" /> : <ZapIcon className="h-4 w-4" />}
                      {isEs ? level.buttonTextEs : level.buttonTextEn}
                    </button>
                    {(level.buttonAction === 'both' || level.buttonAction === 'paypal') && (
                      <button
                        type="button"
                        onClick={() => handlePayPal(level.minAmount)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 transition-all duration-300 active:scale-95"
                      >
                        <CreditCard className="h-4 w-4" />
                        PayPal
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* Trust line */}
      <Reveal delay={3}>
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-ink-500">
          <Shield className="h-4 w-4" />
          <span>{isEs ? 'Pagos seguros y cifrados · Stripe & PayPal' : 'Secure and encrypted payments · Stripe & PayPal'}</span>
        </div>
      </Reveal>
    </Section>
  );
}
