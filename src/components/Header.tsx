import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, Sparkles, Languages } from 'lucide-react';
import { useLang, getTranslation } from '@/i18n/LanguageContext';
import type { Lang } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

function Logo() {
  const settings = useSiteSettings();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      className="group flex items-center"
      aria-label={`${settings.siteName} inicio`}
    >
      <img
        src={settings.logo}
        alt={`${settings.siteName} — Respaldado por RAM Painting & Remodeling LLC`}
        className="h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
      />
    </button>
  );
}

function LangToggle({ scrolled }: { scrolled: boolean }) {
  const { lang, setLang } = useLang();
  const next: Lang = lang === 'es' ? 'en' : 'es';
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 ${
        scrolled
          ? 'border-ink-200 bg-white text-ink-700 hover:border-primary-400 hover:text-primary-700'
          : 'border-white/25 bg-white/10 text-white hover:bg-white/20'
      }`}
      aria-label={lang === 'es' ? 'Switch to English' : 'Cambiar a español'}
    >
      <Languages className="h-3.5 w-3.5" />
      {lang === 'es' ? 'EN' : 'ES'}
    </button>
  );
}

export function Header() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isGuidePage = location.pathname === '/donation-guide';

  const handleNavClick = (href: string) => {
    setOpen(false);
    if (href.startsWith('#')) {
      if (isGuidePage) {
        navigate('/' + href);
      } else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? 'border-b border-ink-100 bg-white/90 backdrop-blur-xl shadow-soft'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4 lg:px-12 xl:px-20">
        <Logo />

        <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Principal">
          {t.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                if (link.href.startsWith('#')) {
                  e.preventDefault();
                  handleNavClick(link.href);
                }
              }}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                solid
                  ? 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2.5 lg:flex">
          <LangToggle scrolled={solid} />
          <a
            href="#postulacion"
            className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold backdrop-blur transition-all duration-300 hover:-translate-y-0.5 ${
              solid
                ? 'border-ink-200 bg-white text-ink-800 hover:border-primary-400 hover:text-primary-700'
                : 'border-white/25 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {t.nav.applyFamily}
          </a>
          <a
            href="#donacion"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-blue transition-all duration-300 hover:bg-primary-700 hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" />
            {t.nav.beAlly}
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LangToggle scrolled={solid} />
          <button
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
              solid
                ? 'border-ink-200 text-ink-800 hover:bg-ink-50'
                : 'border-white/25 text-white hover:bg-white/10'
            }`}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden overflow-hidden bg-white transition-[max-height,opacity] duration-400 ease-out ${
          open ? 'max-h-[640px] border-t border-ink-100 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-px flex flex-col gap-1 py-5">
          {t.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2.5">
            <a href="#postulacion" onClick={() => setOpen(false)} className="btn-ghost w-full">
              {t.nav.applyFamily}
            </a>
            <a href="#donacion" onClick={() => setOpen(false)} className="btn-primary w-full">
              <Sparkles className="h-4 w-4" />
              {t.nav.beAllyStrategic}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
