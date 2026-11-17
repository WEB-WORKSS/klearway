import { useEffect } from 'react';

/**
 * Subtle scroll reveal. Content is fully visible in the prerendered HTML and without JS;
 * only elements that start below the fold are hidden, then revealed as they enter view.
 */
export function useReveal(dep) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = [...document.querySelectorAll('[data-reveal]')];
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.remove('reveal-pending');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    for (const el of els) {
      if (el.getBoundingClientRect().top > vh) {
        el.classList.add('reveal-pending');
        io.observe(el);
      }
    }
    return () => {
      io.disconnect();
      els.forEach((el) => el.classList.remove('reveal-pending'));
    };
  }, [dep]);
}
