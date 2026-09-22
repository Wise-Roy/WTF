"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/common";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const WORDS = ["FUMES", "NOISE", "CHAOS", "RHYTHM", "ENERGY", "VIBE"] as const;
const INTERVAL = 2800;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [wordIndex, setWordIndex] = useState(0);

  // Rotate words
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  // Scroll parallax for image + text layers
  const onScroll = useCallback(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const text = textRef.current;
    if (!section || !image) return;

    const rect = section.getBoundingClientRect();
    const progress = -rect.top / window.innerHeight;

    const isSmall = window.innerWidth < 768;
    const imgSpeed = isSmall ? 0.175 : 0.35;
    const txtSpeed = isSmall ? 0.08 : 0.15;

    const imgOffset = progress * window.innerHeight * imgSpeed;
    const txtOffset = progress * window.innerHeight * txtSpeed;

    image.style.transform = `translate3d(0, ${imgOffset}px, 0) scale(1.1)`;
    if (text) {
      text.style.transform = `translate3d(0, ${txtOffset}px, 0)`;
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prefersReducedMotion, onScroll]);

  const currentWord = WORDS[wordIndex];

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-end justify-center pb-40 bg-[#FFF9D6] overflow-hidden"
    >
      {/* Parallax image layer */}
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

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Hero content — parallax text layer */}
      <div
        ref={textRef}
        className="relative z-20 flex flex-col items-center text-center px-6 max-w-5xl will-change-transform"
      >
        <span className="inline-block bg-[#C6FF00] text-[#1a1a1a] px-3 py-1 font-body text-sm font-semibold uppercase tracking-[0.15em]">
          EST. 2023
        </span>

        {/* Main headline with rotating word */}
        <h1
          className="mt-8 font-heading text-3xl md:text-5xl lg:text-[4rem] xl:text-[5.5rem] font-bold uppercase tracking-[0.04em] text-[#F5F5F5] leading-[1]"
          aria-label={`Worship The ${currentWord}`}
        >
          {/* Desktop: all on one line | Mobile: rotating word on second line, centered */}
          <span className="flex flex-col items-center md:flex-row md:justify-center md:gap-[0.3em]">
            <span className="whitespace-nowrap">WORSHIP THE</span>
            <span
              className="relative inline-flex justify-center overflow-hidden translate-y-[0.08em]"
              style={{ height: "1.15em", width: "7.5ch" }}
              aria-hidden="true"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={currentWord}
                  className="absolute inset-x-0 top-0 text-center text-[#C6FF00] whitespace-nowrap"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { y: "110%", opacity: 0 }
                  }
                  animate={{ y: "0%", opacity: 1 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { y: "-110%", opacity: 0 }
                  }
                  transition={{
                    y: {
                      type: "tween",
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    opacity: { duration: 0.35, ease: "easeInOut" },
                  }}
                >
                  {currentWord}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </h1>

        <p className="mt-6 font-body text-base md:text-lg text-[#F5F5F5]/70 max-w-[55ch] leading-normal">
          Worship The Fumes is streetwear for the ones who chose to stand out.
          Limited drops. Original art. No restocks. Join the cult or stay normal.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Button href="/shop">Shop the Drop</Button>
          <Button href="/about" variant="secondary" className="border-[#F5F5F5]/30 text-[#F5F5F5] hover:border-[#C6FF00] hover:text-[#C6FF00]">
            Our Story
          </Button>
        </div>
      </div>
    </section>
  );
}
