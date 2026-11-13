"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface BannerOffer {
  header: string;
  product_id: string;
  original_price: number;
  discounted_price: number;
}

const ROTATE_MS = 3500;

export default function AnnouncementBar() {
  const [offers, setOffers] = useState<BannerOffer[]>([]);
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/offer")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setOffers(d.data?.offers ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Push the taller nav down to the page's sticky sub-headers
  useEffect(() => {
    const root = document.documentElement;
    if (offers.length) root.style.setProperty("--nav-h", "6.25rem");
    return () => {
      root.style.removeProperty("--nav-h");
    };
  }, [offers.length]);

  useEffect(() => {
    if (offers.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % offers.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [offers.length]);

  if (!offers.length) return null;

  const offer = offers[index % offers.length];
  const discountPct =
    offer.original_price > offer.discounted_price && offer.original_price > 0
      ? Math.round((1 - offer.discounted_price / offer.original_price) * 100)
      : 0;

  return (
    <div className="h-9 bg-[#15110A] overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <Link
            href={`/product-story/${offer.product_id}`}
            className="group flex h-full items-center justify-center gap-2 px-6 text-center md:gap-3"
          >
            <span className="relative hidden h-1.5 w-1.5 shrink-0 sm:flex">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C6FF00] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C6FF00]" />
            </span>

            <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#EFE4D0] md:text-xs md:tracking-[0.2em]">
              {offer.header}
            </span>

            {discountPct > 0 && (
              <span className="shrink-0 rounded-full bg-[#C6FF00] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black md:text-[10px]">
                {discountPct}% Off
              </span>
            )}

            <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] text-[#C6FF00] underline-offset-4 group-hover:underline sm:inline md:text-xs">
              Shop Now →
            </span>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
