"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

const LINES = [
  "Curated Drops",
  "Collections",
  "Every piece is numbered,",
  "limited, and never restocked.",
  "Once it's gone, it's gone.",
];

function ParallaxLine({
  text,
  index,
}: {
  text: string;
  index: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.4"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [40, 0]);

  const isTagline = index === 0;
  const isHeading = index === 1;

  return (
    <motion.span
      ref={ref}
      style={{
        opacity,
        x,
        ...(isHeading ? { WebkitTextStroke: "1.5px #C6FF00", color: "white" } : {}),
      }}
      className={
        isTagline
          ? "block text-xs sm:text-sm uppercase tracking-[0.25em] opacity-60 font-medium mb-4 drop-shadow-md"
          : isHeading
            ? "block font-heading text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wider leading-tight mb-6 drop-shadow-lg"
            : "block text-lg md:text-xl opacity-80 leading-relaxed drop-shadow-md"
      }
    >
      {text}
    </motion.span>
  );
}

export default function CollectionHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    fetch("/api/collection-hero")
      .then((r) => r.json())
      .then((d) => {
        const imgs = (d.data?.images || []).filter(Boolean);
        if (imgs.length > 0) setImages(imgs);
      })
      .catch(() => {});
  }, []);

  // Cycle images every 2 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Slow drift + zoom on scroll
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);

  const hasImages = images.length > 0;

  return (
    <section ref={sectionRef} className="relative h-[200vh]">
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#1a1a1a] z-10">
        {/* Image layer — crossfade on 2s timer */}
        {hasImages && (
          <motion.div className="absolute inset-0" style={{ y, scale }}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={images[currentImg]}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  aria-hidden="true"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Fallback bg when no images */}
        {!hasImages && <div className="absolute inset-0 bg-[#FFF9D6]" />}

        {/* Minimal scrim behind text */}
        {hasImages && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        )}

        {/* Text layer */}
        <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-20">
          <div className="mx-auto max-w-7xl w-full text-[#C6FF00]">
            {LINES.map((line, i) => (
              <ParallaxLine
                key={i}
                text={line}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
