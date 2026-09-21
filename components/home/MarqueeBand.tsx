"use client";

import { useEffect, useRef } from "react";

const REPEAT_COUNT = 8;
const SEPARATOR = " \u2731 ";
const TEXT = "WEIRD IS A CHOICE";

export default function MarqueeBand() {
  const bandRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isSmall = window.innerWidth < 768;
    const speed = isSmall ? -0.5 : -1;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const band = bandRef.current;
        const inner = innerRef.current;
        if (!band || !inner) {
          ticking = false;
          return;
        }
        const rect = band.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const offset = (elementCenter - viewportCenter) * speed;
        inner.style.transform = `translate3d(${offset}px, 0, 0)`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const repeatedText = Array.from({ length: REPEAT_COUNT })
    .map(() => TEXT)
    .join(SEPARATOR);

  return (
    <div
      ref={bandRef}
      className="bg-[#C6FF00] overflow-hidden py-4 border-y border-[#1a1a1a]/10"
    >
      <div
        ref={innerRef}
        className="whitespace-nowrap will-change-transform font-heading text-2xl md:text-3xl uppercase tracking-[0.12em] text-[#1a1a1a] select-none"
        style={{ transform: "translate3d(0, 0, 0)" }}
      >
        {repeatedText}
      </div>
    </div>
  );
}
