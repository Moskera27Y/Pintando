import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnail: string | null;
  displayOrder: number;
  featured: boolean;
  status: string;
  createdAt: string;
};

function getApiBase(): string {
  if (import.meta.env.PROD) return '/api';
  return import.meta.env.VITE_API_URL || '/api';
}

export function CommunityGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${getApiBase()}/settings?action=gallery`)
      .then((r) => r.json())
      .then((data: GalleryItem[]) => setItems(data))
      .catch(() => {});
  }, []);

  // Responsive: 5 on desktop, 3 on tablet, 1 on mobile
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280) setVisibleCount(5);
      else if (w >= 768) setVisibleCount(3);
      else setVisibleCount(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Autoplay
  useEffect(() => {
    if (isPaused || items.length <= visibleCount) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, items.length, visibleCount]);

  const maxIndex = Math.max(0, items.length - visibleCount);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Touch / swipe
  const touchStartX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
  };

  if (items.length === 0) return null;

  const cardWidth = 100 / visibleCount;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ink-50 to-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold text-primary-700">
            <Images className="h-3.5 w-3.5" /> Comunidad
          </div>
          <h2 className="text-3xl font-bold text-ink-900 lg:text-4xl">Community Gallery</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-ink-500">
            Momentos que transforman comunidades a través del arte
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Arrows */}
          {items.length > visibleCount && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink-700 shadow-lg backdrop-blur transition-all hover:bg-white hover:scale-110 lg:h-12 lg:w-12"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink-700 shadow-lg backdrop-blur transition-all hover:bg-white hover:scale-110 lg:h-12 lg:w-12"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Track */}
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * cardWidth}%)` }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 px-2"
                  style={{ width: `${cardWidth}%` }}
                >
                  <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100 transition-all duration-300 hover:shadow-xl">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {/* Caption overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                      {item.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-white/80">{item.description}</p>
                      )}
                      <p className="mt-1 text-[10px] text-white/60">
                        {new Date(item.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          {items.length > visibleCount && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === i ? 'w-6 bg-primary-600' : 'w-2 bg-ink-300 hover:bg-ink-400'
                  }`}
                  aria-label={`Ir a ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
