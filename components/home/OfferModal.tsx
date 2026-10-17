"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/* ═══ Types ═══ */
interface Offer {
  is_enabled: boolean;
  header: string;
  description: string;
  product_id: string;
  original_price: number;
  discounted_price: number;
  image_path: string;
  end_time: string;
}

const DISMISSED_KEY = "wtf_offer_dismissed";
const LOADER_KEY = "wtf-loaded";

/* ═══ Countdown hook ═══ */
function useCountdown(endTime: string) {
  const getRemaining = useCallback(() => {
    if (!endTime) return { h: 0, m: 0, s: 0, expired: true };
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  }, [endTime]);

  const [time, setTime] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [getRemaining]);

  return time;
}

/* ═══ Main Modal ═══ */
export default function OfferModal() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 18 });

  // Parallax layers — deeper layers move more
  const glowX1 = useTransform(springX, [-1, 1], [40, -40]);
  const glowY1 = useTransform(springY, [-1, 1], [25, -25]);
  const glowX2 = useTransform(springX, [-1, 1], [-40, 40]);
  const glowY2 = useTransform(springY, [-1, 1], [-25, 25]);
  const brickX = useTransform(springX, [-1, 1], [-25, 25]);
  const brickY = useTransform(springY, [-1, 1], [-15, 15]);
  const badgeX = useTransform(springX, [-1, 1], [10, -10]);
  const badgeY = useTransform(springY, [-1, 1], [6, -6]);
  const titleX = useTransform(springX, [-1, 1], [6, -6]);
  const priceX = useTransform(springX, [-1, 1], [-8, 8]);
  const rotateX = useTransform(springY, [-1, 1], [-6, 6]);
  const rotateY = useTransform(springX, [-1, 1], [8, -8]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX.set(Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2))));
      mouseY.set(Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2))));
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Fetch offer
  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    let cancelled = false;
    fetch("/api/offer")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const o = d.data?.offer;
        if (o && o.is_enabled && o.header && o.product_id) {
          setOffer(o);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Wait for loader, then show after 1.2s
  useEffect(() => {
    if (!offer) return;
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    let cancelled = false;

    const show = () => {
      timeout = setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, 1200);
    };

    if (sessionStorage.getItem(LOADER_KEY)) {
      show();
    } else {
      interval = setInterval(() => {
        if (sessionStorage.getItem(LOADER_KEY)) {
          clearInterval(interval);
          show();
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [offer]);

  // Lock body scroll
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  if (!offer) return null;

  const discountPct = offer.original_price > 0
    ? Math.round((1 - offer.discounted_price / offer.original_price) * 100)
    : 0;
  // Round to nearest 5 for "Up to X% Off" badge
  const badgePct = Math.ceil(discountPct / 5) * 5;

  return (
    <AnimatePresence>
      {visible && (
        <OfferContent
          offer={offer}
          discountPct={discountPct}
          badgePct={badgePct}
          cardRef={cardRef}
          onClose={handleClose}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          parallax={{
            glowX1, glowY1, glowX2, glowY2,
            brickX, brickY,
            badgeX, badgeY, titleX, priceX,
            rotateX, rotateY,
          }}
        />
      )}
    </AnimatePresence>
  );
}

/* ═══ Content (split for AnimatePresence) ═══ */
interface ParallaxValues {
  glowX1: MotionValue<number>;
  glowY1: MotionValue<number>;
  glowX2: MotionValue<number>;
  glowY2: MotionValue<number>;
  brickX: MotionValue<number>;
  brickY: MotionValue<number>;
  badgeX: MotionValue<number>;
  badgeY: MotionValue<number>;
  titleX: MotionValue<number>;
  priceX: MotionValue<number>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

function OfferContent({
  offer, discountPct, badgePct, cardRef, onClose, onMouseMove, onMouseLeave, parallax: p,
}: {
  offer: Offer;
  discountPct: number;
  badgePct: number;
  cardRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  parallax: ParallaxValues;
}) {
  const countdown = useCountdown(offer.end_time);
  const pad = (n: number) => String(n).padStart(2, "0");

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <motion.div
      className="fixed inset-0 z-80 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Glow blobs */}
      <motion.div
        className="absolute w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{
          x: p.glowX1, y: p.glowY1,
          background: "radial-gradient(circle, rgba(198,255,0,0.25), transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{
          x: p.glowX2, y: p.glowY2,
          background: "radial-gradient(circle, rgba(30,58,138,0.35), transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Card with 3D tilt */}
      <motion.div
        ref={cardRef}
        className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl cursor-default"
        style={{
          rotateX: p.rotateX,
          rotateY: p.rotateY,
          transformPerspective: 1000,
        }}
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* ─── LEFT: Offer Image ─── */}
          <div className="relative overflow-hidden min-h-[280px] md:min-h-[480px]">
            {/* Admin-uploaded image */}
            <motion.div
              className="absolute inset-0"
              style={{
                x: p.brickX, y: p.brickY,
                backgroundImage: `url(${offer.image_path})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                scale: 1.15,
              }}
            />
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Floating badge */}
            <motion.div
              className="absolute top-6 right-6 z-10"
              style={{ x: p.badgeX, y: p.badgeY }}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -8 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#FFE600] flex flex-col items-center justify-center text-black shadow-lg">
                <span className="text-[9px] font-black uppercase leading-none tracking-wide">Up to</span>
                <span className="text-2xl font-black leading-none">{badgePct}%</span>
                <span className="text-[9px] font-black uppercase leading-none tracking-wide">Off</span>
              </div>
            </motion.div>

          </div>

          {/* ─── RIGHT: Offer Details ─── */}
          <div className="relative bg-[#EFE4D0] p-8 md:p-10 flex flex-col justify-center">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full border border-black/15 bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#15110A" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1 1 13" />
              </svg>
            </button>

            {/* Limited-time pill */}
            <motion.div {...stagger(0)} className="mb-5">
              <span className="inline-flex items-center gap-2 border border-black/20 bg-black/5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#15110A]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C6FF00] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C6FF00]" />
                </span>
                Limited-Time Offer
              </span>
            </motion.div>

            {/* Title */}
            <motion.div style={{ x: p.titleX }} {...stagger(1)}>
              <h2 className="font-heading text-4xl md:text-5xl font-black uppercase text-[#15110A] leading-[0.95]">
                {offer.header}{" "}
                <span className="text-[#C6FF00]" style={{ WebkitTextStroke: "1px #15110A" }}>
                  -{discountPct}%
                </span>
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p {...stagger(2)} className="mt-4 text-sm text-black/65 leading-relaxed font-body">
              {offer.description}
            </motion.p>

            {/* Countdown */}
            {offer.end_time && !countdown.expired && (
              <motion.div {...stagger(3)} className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">
                  Ends in
                </p>
                <div className="flex gap-2">
                  {[
                    { val: pad(countdown.h), label: "HRS" },
                    { val: pad(countdown.m), label: "MIN" },
                    { val: pad(countdown.s), label: "SEC" },
                  ].map((t) => (
                    <div
                      key={t.label}
                      className="bg-[#15110A] rounded-xl px-3 py-2 min-w-[54px] text-center"
                    >
                      <span className="block text-[#EFE4D0] text-2xl font-black font-mono tabular-nums leading-none">
                        {t.val}
                      </span>
                      <span className="block text-[#EFE4D0]/40 text-[8px] font-bold uppercase tracking-wider mt-1">
                        {t.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Price */}
            <motion.div style={{ x: p.priceX }} {...stagger(4)} className="mt-5 flex items-center gap-3 flex-wrap">
              <span className="font-heading text-3xl font-black text-[#15110A]">
                ₹{offer.discounted_price.toLocaleString("en-IN")}
              </span>
              <span className="text-lg text-black/40 line-through font-mono">
                ₹{offer.original_price.toLocaleString("en-IN")}
              </span>
              <span className="bg-[#C6FF00] text-black text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                Save {discountPct}%
              </span>
            </motion.div>

            {/* CTA */}
            <motion.div {...stagger(5)} className="mt-6">
              <Link
                href={`/get/${offer.product_id}`}
                onClick={() => sessionStorage.setItem(DISMISSED_KEY, "1")}
              >
                <motion.div
                  className="group/cta relative overflow-hidden bg-[#C6FF00] text-black font-black text-sm uppercase tracking-[0.18em] text-center py-4 px-8 rounded-2xl cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="relative z-10">Grab the Offer</span>
                  <div
                    className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full transition-transform duration-600 ease-in-out"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
                  />
                </motion.div>
              </Link>
            </motion.div>

            {/* Note */}
            <motion.p {...stagger(6)} className="mt-4 text-[11px] text-black/35 text-center font-body">
              Free shipping · 30-day returns
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
