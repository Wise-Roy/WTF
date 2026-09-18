"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/common";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isSmall = window.innerWidth < 768;
    const speed = isSmall ? 0.175 : 0.35;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const section = sectionRef.current;
        const image = imageRef.current;
        if (!section || !image) {
          ticking = false;
          return;
        }
        const rect = section.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const offset = (elementCenter - viewportCenter) * speed;
        image.style.transform = `translate3d(0, ${offset}px, 0) scale(1.1)`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-end justify-center pb-40 bg-[#0A0A0A] overflow-hidden"
    >
      {/* Parallax image layer — oversized to prevent empty edges */}
      <div
        ref={imageRef}
        className="absolute -inset-[15%] z-0 will-change-transform"
        style={{ transform: "translate3d(0, 0, 0) scale(1.1)" }}
      >
        <Image
          src="/hero_bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-top"
        />
      </div>

      {/* Dark 40 overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Hero content — stable layer, scrolls naturally */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-4xl">
        <span className="inline-block bg-[#C6FF00] text-[#0A0A0A] px-3 py-1 font-body text-sm font-semibold uppercase tracking-[0.15em]">
          EST. 2026 &middot; DROP 01 LIVE
        </span>

        <h1 className="mt-8 font-heading text-4xl md:text-6xl lg:text-[4.5rem] font-bold uppercase tracking-[0.08em] text-[#F5F5F5] leading-[0.95]">
          Weird is a choice.
        </h1>

        <p className="mt-6 font-body text-base md:text-lg text-[#F5F5F5]/70 max-w-[55ch] leading-normal">
          Worship The Fumes is streetwear for the ones who chose to stand out.
          Limited drops. Original art. No restocks. Join the cult or stay normal.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/shop">Shop the Drop</Button>
          <Button href="/about" variant="secondary">
            Our Story
          </Button>
        </div>
      </div>
    </section>
  );
}
