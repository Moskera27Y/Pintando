import type { ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
};

/** Wrapper that adds an id anchor and scroll-reveal behavior. */
export function Section({ id, children, className = '' }: SectionProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id={id} className={`section-py scroll-mt-20 ${className}`}>
      <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} mx-auto max-w-7xl container-px`}>
        {children}
      </div>
    </section>
  );
}

type RevealProps = {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'span';
};

/** Inline reveal wrapper for individual elements within a section. */
export function Reveal({ children, delay = 0, className = '', as = 'div' }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Tag = as as 'div';
  const delayClass = delay ? `reveal-delay-${delay}` : '';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`reveal ${delayClass} ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
