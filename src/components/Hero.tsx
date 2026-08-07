import { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Sparkles, ArrowRight, TrendingUp, X, Film } from 'lucide-react';
import { IMAGES } from '@/data/content';
import { useLang, getTranslation } from '@/i18n/LanguageContext';
import { useMediaByCategory, type MediaItem } from '@/hooks/useMedia';

const FALLBACK_SLIDES = [IMAGES.heroFamily, IMAGES.heroSlider4, IMAGES.heroSlider3, IMAGES.heroSlider2];
const FALLBACK_SHOWCASE = [
  IMAGES.showFamilyReaction, IMAGES.showLuxuryKitchen, IMAGES.showRenovationTeam,
  IMAGES.showPaintRoller, IMAGES.showCommunity, IMAGES.showBeforeAfter,
];

function HeroSlider() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const [index, setIndex] = useState(0);
  const media = useMediaByCategory('hero');

  const slides = media.length > 0
    ? media.slice(0, 6).map((m) => m.blobUrl)
    : FALLBACK_SLIDES;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((src, i) => (
        <div
          key={src + i}
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <img
            src={src}
            alt={t.hero.slides[i % t.hero.slides.length]}
            className="h-full w-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
            style={{ transform: i === index ? 'scale(1.06)' : 'scale(1)', transition: 'transform 7s linear' }}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute inset-0 bg-noise opacity-60 mix-blend-overlay" />
    </div>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl font-extrabold text-white md:text-3xl">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-white/60">{label}</span>
    </div>
  );
}

function ShowcaseStrip() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const [active, setActive] = useState(0);
  const media = useMediaByCategory('hero');

  const showcase = media.length > 0
    ? media.slice(0, 6).map((m) => m.blobUrl)
    : FALLBACK_SHOWCASE;

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % showcase.length), 3200);
    return () => clearInterval(id);
  }, [showcase.length]);

  return (
    <div className="relative hidden w-full max-w-md flex-col gap-3 lg:flex">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
        {showcase.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={t.hero.showcase[i % t.hero.showcase.length]}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out"
            style={{
              opacity: i === active ? 1 : 0,
              transform: i === active ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">{t.hero.showcaseLabel}</span>
          <p className="mt-1 font-display text-lg font-extrabold text-white">{t.hero.showcase[active % t.hero.showcase.length]}</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {showcase.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
              i === active ? 'border-white scale-105' : 'border-white/20 opacity-50 hover:opacity-90'
            }`}
            aria-label={t.hero.showcase[i % t.hero.showcase.length]}
          >
            <img src={src} alt={t.hero.showcase[i % t.hero.showcase.length]} loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const [videoOpen, setVideoOpen] = useState(false);
  const promoMedia = useMediaByCategory('promotional-video');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const promoVideo: MediaItem | null =
    promoMedia.find((m) => m.featured) || promoMedia[0] || null;

  const openVideo = useCallback(() => setVideoOpen(true), []);
  const closeVideo = useCallback(() => {
    setVideoOpen(false);
    if (videoRef.current) videoRef.current.pause();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeVideo();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeVideo]);

  useEffect(() => {
    if (videoOpen && videoRef.current && promoVideo) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoOpen, promoVideo]);

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-ink-950">
      <HeroSlider />

      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-dream-purple/30 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-primary-600/30 blur-3xl animate-float" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-5 pt-28 pb-16 sm:px-8 lg:px-12 xl:px-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-dream-green" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-dream-green" />
              </span>
              {t.hero.badge}
            </div>

            <h1
              className="animate-fade-up mt-6 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{ animationDelay: '0.08s' }}
            >
              {t.hero.title1}
              <span className="mt-2 block bg-dream-gradient bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-pan">
                {t.hero.title2}
              </span>
              <span className="block">{t.hero.title3}</span>
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
              style={{ animationDelay: '0.16s' }}
            >
              {t.hero.lead} <strong className="font-semibold text-white">{t.hero.leadBold}</strong>{' '}
              {t.hero.lead2}
            </p>

            <div
              className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"
              style={{ animationDelay: '0.24s' }}
            >
              <a href="#ruleta" className="btn-dream group">
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                {t.hero.ctaRoulette}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#impacto" className="btn-ghost border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30">
                <TrendingUp className="h-4 w-4" />
                {t.hero.ctaInvest}
              </a>
            </div>

            <button
              type="button"
              onClick={openVideo}
              className="animate-fade-up group mt-8 inline-flex items-center gap-3 text-white/80 transition-colors hover:text-white"
              style={{ animationDelay: '0.32s' }}
            >
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur transition-all group-hover:scale-110 group-hover:border-white/60">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-white/20" />
                <Play className="relative h-5 w-5 translate-x-0.5 fill-white text-white" />
              </span>
              <span className="text-sm font-medium underline-offset-4 group-hover:underline">
                {t.hero.watchVideo}
              </span>
            </button>

            <div
              className="animate-fade-up mt-10 flex w-full max-w-md items-center justify-center gap-8 border-t border-white/10 pt-6 lg:justify-start"
              style={{ animationDelay: '0.4s' }}
            >
              <StatPill value={t.hero.stat1} label={t.hero.stat1Label} />
              <StatPill value={t.hero.stat2} label={t.hero.stat2Label} />
              <StatPill value={t.hero.stat3} label={t.hero.stat3Label} />
            </div>
          </div>

          <div className="animate-fade-in hidden justify-center lg:flex" style={{ animationDelay: '0.3s' }}>
            <ShowcaseStrip />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
        </div>
      </div>

      {videoOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-md animate-fade-in"
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeVideo}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close video"
            >
              <X />
            </button>
            {promoVideo ? (
              <video
                ref={videoRef}
                src={promoVideo.blobUrl}
                poster={promoVideo.thumbnailUrl || undefined}
                autoPlay
                muted
                loop
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950 text-center">
                <div className="px-6">
                  <Film className="mx-auto h-12 w-12 text-white/40" />
                  <p className="mt-4 text-sm text-white/60">No promotional video available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
