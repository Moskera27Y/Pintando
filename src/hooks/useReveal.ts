import { useEffect, useRef, useState } from 'react';

/**
 * Reveal-on-scroll hook using IntersectionObserver.
 * Returns a ref to attach and a boolean for visibility.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit & { once?: boolean }
) {
  const { once = true, threshold = 0.15, rootMargin = '0px 0px -10% 0px', ...rest } = options ?? {};
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin, ...rest }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return { ref, visible } as const;
}
