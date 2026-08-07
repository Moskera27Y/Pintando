import { useCallback, useRef, useState, type PointerEvent } from 'react';
import { MoveHorizontal, ArrowLeftRight } from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { IMAGES } from '@/data/content';
import { useLang, getTranslation } from '@/i18n/LanguageContext';
import { useMediaByCategory } from '@/hooks/useMedia';

const FALLBACK_PAIRS = [
  { before: IMAGES.beforeKitchen, after: IMAGES.afterKitchen },
  { before: IMAGES.beforeBathroom, after: IMAGES.afterBathroom },
  { before: IMAGES.beforeLiving, after: IMAGES.afterLiving },
];

function BeforeAfterSlider({ images, title, beforeLabel, afterLabel, hint }: {
  images: { before: string; after: string };
  title: string;
  beforeLabel: string;
  afterLabel: string;
  hint: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className="group relative aspect-[16/11] w-full cursor-ew-resize select-none overflow-hidden rounded-3xl border border-ink-100 shadow-card"
    >
      <img src={images.after} alt={`${title} — ${afterLabel}`} className="absolute inset-0 h-full w-full object-cover" draggable={false} loading="lazy" />
      <span className="absolute right-4 top-4 z-10 rounded-full bg-success-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
        {afterLabel}
      </span>

      <img
        src={images.before}
        alt={`${title} — ${beforeLabel}`}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
        loading="lazy"
      />
      <span
        className="absolute left-4 top-4 z-10 rounded-full bg-error-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {beforeLabel}
      </span>

      <div className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ left: `${pos}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white/95 text-ink-800 shadow-lg transition-transform group-hover:scale-110">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-opacity group-hover:opacity-0">
        <MoveHorizontal className="h-3.5 w-3.5" /> {hint}
      </div>
    </div>
  );
}

export function BeforeAfter() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const media = useMediaByCategory('gallery');

  const pairs: { before: string; after: string }[] = [];
  if (media.length >= 2) {
    const maxPairs = Math.min(3, Math.floor(media.length / 2));
    for (let i = 0; i < maxPairs; i++) {
      pairs.push({ before: media[i * 2].blobUrl, after: media[i * 2 + 1].blobUrl });
    }
  }
  const projectImages = pairs.length > 0 ? pairs : FALLBACK_PAIRS;

  return (
    <Section id="galeria" className="bg-ink-50">
      <div className="max-w-3xl">
        <Reveal>
          <span className="eyebrow text-primary-700">{t.beforeAfter.eyebrow}</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl text-balance">
            {t.beforeAfter.title1} <span className="text-gradient-blue">{t.beforeAfter.title2}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
            {t.beforeAfter.lead}
          </p>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {projectImages.map((images, i) => (
          <Reveal key={i} delay={(i + 1) as 1 | 2 | 3}>
            <figure className="flex flex-col">
              <BeforeAfterSlider
                images={images}
                title={t.beforeAfter.projects[i % t.beforeAfter.projects.length].title}
                beforeLabel={t.beforeAfter.before}
                afterLabel={t.beforeAfter.after}
                hint={t.beforeAfter.dragHint}
              />
              <figcaption className="mt-4 flex items-center justify-between">
                <span className="font-display text-base font-bold text-ink-900">{t.beforeAfter.projects[i % t.beforeAfter.projects.length].title}</span>
                <span className="text-xs font-medium uppercase tracking-wider text-ink-400">{t.beforeAfter.projects[i % t.beforeAfter.projects.length].location}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
