import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { useMediaByCategory, type MediaItem } from '@/hooks/useMedia';

const AUTOPLAY_MS = 5000;

function OurJourneyInner() {
  const items = useMediaByCategory('homepage-carousel');
  const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Responsive: how many slides visible
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else setVisibleCount(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Clamp index when items change
  useEffect(() => {
    if (index > 0 && sorted.length > 0 && index >= sorted.length) {
      setIndex(Math.max(0, sorted.length - 1));
    }
  }, [sorted.length, index]);

  const maxIndex = Math.max(0, sorted.length - visibleCount);

  const next = useCallback(() => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  }, [maxIndex]);

  // Autoplay
  useEffect(() => {
    if (paused || sorted.length <= visibleCount) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, next, sorted.length, visibleCount]);

  // Touch swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  };

  // Slide width percentage
  const slideWidthPct = 100 / visibleCount;
  const translateX = `-${index * slideWidthPct}%`;

  if (sorted.length === 0) {
    return (
      <Section id="journey">
        <div className="text-center">
          <Reveal>
            <span className="eyebrow"><Camera className="h-3.5 w-3.5" /> Our Journey</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-4 text-3xl font-bold text-ink-900 md:text-4xl lg:text-5xl">Our Journey</h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mt-4 text-base text-ink-500 md:text-lg">
              No gallery images available.
            </p>
          </Reveal>
        </div>
      </Section>
    );
  }

  return (
    <Section id="journey">
      <div ref={sectionRef} className="text-center">
        <Reveal>
          <span className="eyebrow"><Camera className="h-3.5 w-3.5" /> Our Journey</span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-4 text-3xl font-bold text-ink-900 md:text-4xl lg:text-5xl text-balance">
            Our Journey
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-500 md:text-lg text-balance">
            Every photograph tells the story of hope, transformation and opportunity that your support makes possible.
          </p>
        </Reveal>
      </div>

      <Reveal delay={3} className="mt-12">
        <div
          className="relative overflow-hidden rounded-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Track */}
          <div
            ref={trackRef}
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(${translateX})` }}
          >
            {sorted.map((item) => (
              <CarouselSlide key={item.id} item={item} widthPct={slideWidthPct} />
            ))}
          </div>

          {/* Nav buttons */}
          {sorted.length > visibleCount && (
            <>
              <button
                onClick={prev}
                aria-label="Anterior"
                className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-lg backdrop-blur transition-all hover:bg-white hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                aria-label="Siguiente"
                className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-lg backdrop-blur transition-all hover:bg-white hover:scale-105 active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </Reveal>

      {/* Indicators */}
      {sorted.length > visibleCount && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ir a slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-primary-600' : 'w-2 bg-ink-300 hover:bg-ink-400'
              }`}
            />
          ))}
        </div>
      )}
    </Section>
  );
}

const CarouselSlide = memo(function CarouselSlide({
  item,
  widthPct,
}: {
  item: MediaItem;
  widthPct: number;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-2xl shadow-card"
      style={{ width: `${widthPct}%` }}
    >
      <div className="relative aspect-[4/3] w-full">
        <img
          src={item.thumbnailUrl || item.blobUrl}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-lg font-semibold text-white drop-shadow-md">{item.title}</h3>
          {item.description && (
            <p className="mt-1 text-sm text-white/80 line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
});

export const OurJourney = memo(OurJourneyInner);
export default OurJourney;
