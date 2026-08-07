import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, ArrowRight, Download, Sparkles, Home, Bath, Sofa, Bed, Wrench, PaintRoller,
  ArrowLeft, Mail, AlertCircle, CreditCard, Package, Zap, ShieldCheck,
} from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { useLang } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { SponsorshipSection } from '@/components/SponsorshipSection';

type DonationGuideItem = {
  label: string;
  amount: number;
  description?: string;
  urgent?: boolean;
};

type Category = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  imageUrl: string | null;
  items: DonationGuideItem[];
  sortOrder: number;
  status: string;
  contactEmail: string;
  emailSubject: string;
};

type Hero = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string;
  buttonHref: string;
  pdfUrl: string | null;
  introduction: string | null;
};

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

const ICON_MAP: Record<string, typeof Heart> = {
  Heart, Home, Bath, Sofa, Bed, Wrench, PaintRoller, Sparkles,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; accent: string; ring: string }> = {
  blue: { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200', accent: 'bg-primary-600', ring: 'ring-primary-200' },
  green: { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200', accent: 'bg-success-600', ring: 'ring-success-200' },
  gold: { bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-200', accent: 'bg-warning-600', ring: 'ring-warning-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', accent: 'bg-orange-600', ring: 'ring-orange-200' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-700', border: 'border-accent-200', accent: 'bg-accent-600', ring: 'ring-accent-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', accent: 'bg-purple-600', ring: 'ring-purple-200' },
};

function buildPayPalLink(base: string, amount: number): string {
  if (!base) return '';
  const trimmed = base.trim();
  if (trimmed.endsWith('/')) return `${trimmed}${amount.toFixed(2)}`;
  return `${trimmed}/${amount.toFixed(2)}`;
}

export function DonationGuidePage() {
  const { lang } = useLang();
  const settings = useSiteSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/donation-guide?action=public`)
      .then((r) => (r.ok ? r.json() : { categories: [], hero: null }))
      .then((data: { categories: Category[]; hero: Hero | null }) => {
        setCategories(data.categories || []);
        setHero(data.hero || null);
      })
      .catch(() => {
        setCategories([]);
        setHero(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const heroImage = hero?.imageUrl || 'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=1600';
  const heroTitle = hero?.title || (lang === 'es' ? 'Guía de Donación' : 'Donation Guide');
  const heroSubtitle = hero?.subtitle || (lang === 'es'
    ? 'Mira exactamente cómo cada dólar transforma el hogar de una familia.'
    : 'See exactly how every dollar transforms a family home.');
  const ctaText = hero?.buttonText || (lang === 'es' ? 'Donar ahora' : 'Donate Now');

  const stripeDonationLink = settings.stripe?.donationLink || 'https://donate.stripe.com/test_3cI9AVgzK6fu3SU5KF1Jm00';
  const paypalLink = settings.donation?.paypalLink || 'https://paypal.me/Pintando712';

  const handleStripe = () => {
    window.open(stripeDonationLink, '_blank', 'noopener,noreferrer');
  };

  const handlePayPal = () => {
    window.open(buildPayPalLink(paypalLink, 50), '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPdf = () => {
    if (hero?.pdfUrl) {
      window.open(hero.pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const scrollToGuide = () => {
    guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const buildMailto = (cat: Category) => {
    const subject = encodeURIComponent(cat.emailSubject || cat.title);
    return `mailto:${cat.contactEmail}?subject=${subject}`;
  };

  return (
    <div id="guia-donacion" className="bg-white">
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-ink-950/80 via-ink-950/60 to-primary-950/70" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
              <Heart className="h-3.5 w-3.5" />
              {lang === 'es' ? 'Transparencia total' : 'Full transparency'}
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
          </Reveal>
          <Reveal delay={2}>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80 leading-relaxed">
              {heroSubtitle}
            </p>
          </Reveal>
          <Reveal delay={3}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleStripe}
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white shadow-glow-blue transition-all duration-300 hover:bg-primary-700 hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" />
                {ctaText}
              </button>
              {hero?.pdfUrl && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                  {lang === 'es' ? 'Descargar Guía PDF' : 'Download Donation Guide'}
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Back to Home */}
      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {lang === 'es' ? 'Volver al inicio' : 'Back to Home'}
        </Link>
      </div>

      {/* Two big cards: Financial vs Materials */}
      <Section className="py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {/* Card 1: Financial Donation */}
          <Reveal>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-gradient-to-br from-primary-50 to-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary-100/50 blur-2xl transition-opacity group-hover:opacity-80" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
                  <CreditCard className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-ink-900">
                  {lang === 'es' ? 'Haz una donación económica' : 'Make a Financial Donation'}
                </h3>
                <p className="mt-3 text-base text-ink-600 leading-relaxed">
                  {lang === 'es'
                    ? 'Apoya nuestros proyectos de renovación de hogares con una donación monetaria segura.'
                    : 'Support our home renovation projects through a secure monetary donation.'}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleStripe}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700"
                  >
                    <Zap className="h-4 w-4" />
                    {lang === 'es' ? 'Donar con Stripe' : 'Donate with Stripe'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePayPal}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#003087] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#002266]"
                  >
                    <CreditCard className="h-4 w-4" />
                    {lang === 'es' ? 'Donar con PayPal' : 'Donate with PayPal'}
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-md bg-[#635BFF] px-2.5 py-1 text-xs font-bold text-white">Stripe</span>
                  <span className="rounded-md bg-[#003087] px-2.5 py-1 text-xs font-bold text-white">PayPal</span>
                  <span className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs font-bold text-ink-700">Visa</span>
                  <span className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs font-bold text-ink-700">MC</span>
                  <span className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs font-bold text-ink-700">Amex</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 2: Donate Materials */}
          <Reveal delay={1}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-gradient-to-br from-accent-50 to-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-100/50 blur-2xl transition-opacity group-hover:opacity-80" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-600 text-white shadow-lg">
                  <Package className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-ink-900">
                  {lang === 'es' ? 'Dona materiales' : 'Donate Materials'}
                </h3>
                <p className="mt-3 text-base text-ink-600 leading-relaxed">
                  {lang === 'es'
                    ? 'Ayuda a las familias donando materiales de construcción, pintura, herramientas, tarjetas de regalo o servicios profesionales.'
                    : 'Help families by donating building materials, paint, tools, gift cards or professional services.'}
                </p>
                <button
                  type="button"
                  onClick={scrollToGuide}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-700"
                >
                  {lang === 'es' ? 'Ver guía de donación' : 'View Donation Guide'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Introduction + Categories */}
      <div ref={guideRef}>
        <Section className="py-12">
          {/* Introduction */}
          {hero?.introduction && (
            <Reveal>
              <div className="mx-auto mb-16 max-w-3xl">
                <div className="rounded-3xl border border-ink-100 bg-ink-50/50 p-8 sm:p-10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                      <Mail className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold uppercase tracking-widest text-primary-600">
                      {lang === 'es' ? 'Carta a la comunidad' : 'Dear Community Partner'}
                    </span>
                  </div>
                  <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-700 whitespace-pre-line">
                    {hero.introduction}
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* Section heading */}
          <div className="mb-12 text-center">
            <Reveal>
              <span className="text-sm font-bold uppercase tracking-widest text-primary-600">
                {lang === 'es' ? 'Qué necesitamos' : 'What We Need'}
              </span>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">
                {lang === 'es' ? 'Guía de donación de materiales' : 'Material Donation Guide'}
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600 leading-relaxed">
                {lang === 'es'
                  ? 'Explora cada categoría para ver los materiales y servicios que más necesitamos. Cada tarjeta incluye un botón de contacto directo.'
                  : 'Explore each category to see the materials and services we need most. Each card includes a direct contact button.'}
              </p>
            </Reveal>
          </div>

          {/* Categories */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-ink-500">{lang === 'es' ? 'Próximamente disponible.' : 'Coming soon.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat, idx) => {
                const Icon = ICON_MAP[cat.icon] || Heart;
                const colors = COLOR_MAP[cat.color] || COLOR_MAP.blue;
                const urgentItems = (cat.items || []).filter((i) => i.urgent);
                return (
                  <Reveal key={cat.id} delay={(idx % 3) as 0 | 1 | 2}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      {/* Image header */}
                      <div className="relative h-40 overflow-hidden">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className={`flex h-full w-full items-center justify-center ${colors.bg}`}>
                            <Icon className={`h-12 w-12 ${colors.text}`} />
                          </div>
                        )}
                        <div className={`absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl ${colors.accent} text-white shadow-lg`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {urgentItems.length > 0 && (
                          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-dream-red px-3 py-1 text-xs font-bold text-white shadow-lg">
                            <AlertCircle className="h-3 w-3" />
                            {lang === 'es' ? 'Urgente' : 'Urgent'}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="text-xl font-bold text-ink-900">{cat.title}</h3>
                        {cat.description && (
                          <p className="mt-2 text-sm text-ink-600 leading-relaxed">{cat.description}</p>
                        )}

                        {/* Items list */}
                        {Array.isArray(cat.items) && cat.items.length > 0 && (
                          <ul className="mt-5 space-y-3">
                            {cat.items.map((item, i) => (
                              <li key={i} className="flex items-start justify-between gap-3 border-b border-ink-50 pb-3 last:border-0">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-ink-800">
                                    {item.label}
                                    {item.urgent && (
                                      <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-dream-red/10 px-2 py-0.5 text-[10px] font-bold uppercase text-dream-red">
                                        <AlertCircle className="h-2.5 w-2.5" />
                                        {lang === 'es' ? 'Urgente' : 'Urgent'}
                                      </span>
                                    )}
                                  </p>
                                  {item.description && (
                                    <p className="mt-0.5 text-xs text-ink-500">{item.description}</p>
                                  )}
                                </div>
                                {item.amount > 0 && (
                                  <span className={`shrink-0 rounded-lg ${colors.bg} ${colors.text} px-2.5 py-1 text-sm font-bold`}>
                                    ${item.amount.toLocaleString()}
                                  </span>
                                )}
                                {item.amount === 0 && (
                                  <span className={`shrink-0 rounded-lg ${colors.bg} ${colors.text} px-2.5 py-1 text-xs font-bold`}>
                                    {lang === 'es' ? 'Pro bono' : 'Pro bono'}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Contact button */}
                        <a
                          href={buildMailto(cat)}
                          className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${colors.text} transition-all hover:gap-2.5`}
                        >
                          {lang === 'es' ? 'Contáctanos sobre esta donación' : 'Contact Us About This Donation'}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {/* Sponsorship Levels */}
      <SponsorshipSection />

      {/* Final CTA banner */}
      <section className="bg-primary-600">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md">
                <Heart className="h-7 w-7" />
              </span>
              <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
                {lang === 'es' ? 'Cada aporte hace la diferencia' : 'Every contribution makes a difference'}
              </h2>
              <p className="mt-3 text-lg text-primary-100 leading-relaxed">
                {lang === 'es'
                  ? 'Ya sea que dones dinero, materiales o servicios profesionales, estás ayudando a transformar hogares y vidas.'
                  : 'Whether you donate money, materials or professional services, you are helping transform homes and lives.'}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleStripe}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-50"
                >
                  <Zap className="h-4 w-4" />
                  {lang === 'es' ? 'Donar con Stripe' : 'Donate with Stripe'}
                </button>
                <button
                  type="button"
                  onClick={handlePayPal}
                  className="inline-flex items-center gap-2 rounded-full bg-[#003087] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#002266]"
                >
                  <CreditCard className="h-4 w-4" />
                  {lang === 'es' ? 'Donar con PayPal' : 'Donate with PayPal'}
                </button>
                <Link
                  to="/#contacto"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
                >
                  <Mail className="h-4 w-4" />
                  {lang === 'es' ? 'Contáctanos' : 'Contact Us'}
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary-200" />
                <span className="text-sm text-primary-100">
                  {lang === 'es' ? 'Pagos seguros y cifrados' : 'Secure and encrypted payments'}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
