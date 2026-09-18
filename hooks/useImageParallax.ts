"use client";

import { useEffect, useRef } from "react";

export function useImageParallax<T extends HTMLElement>(speed = 0.18) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const frame = el.closest("[data-parallax-frame]") as HTMLElement | null;
    if (!frame) return;

    let ticking = false;

    const update = () => {
      const rect = frame.getBoundingClientRect();
      const dist = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${dist * speed}px, 0)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return ref;
}
