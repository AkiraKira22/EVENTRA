"use client";

import { useEffect, useRef } from "react";

/**
 * Shrink-and-fade-out on scroll, used by the home page's stacked sections.
 *
 * `index` selects which screen-height of scrolling the fade happens over:
 * 0 = the first screen, 1 = the second, and so on. A section at index N stays
 * fully visible until N screens have scrolled, then shrinks and fades out
 * across the next screen as the following section rises up to cover it.
 *
 * Attach the returned ref to the element that should shrink and fade.
 */
export function useScrollFadeOut<T extends HTMLElement>(index = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect users who prefer reduced motion — leave the element static.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const vh = window.innerHeight || 1;
      // 0 until this section's screen, ramping to 1 across the next screen.
      const p = Math.min(Math.max((window.scrollY - index * vh) / vh, 0), 1);
      el.style.transform = `scale(${(1 - p * 0.18).toFixed(4)})`;
      el.style.opacity = (1 - p).toFixed(4);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [index]);

  return ref;
}
