"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/*
 * Premium full-screen logo loader.
 * Stars orbit logo, progress bar fills 0→100 in 2.5s,
 * then stars collapse, logo flies to navbar, overlay fades.
 */

const STAR_COUNT = 12;
const COLORS = ["#DF2877", "#E84D93", "#DF2877", "#F472B6"];
const ORBIT_RADIUS = 170;
const PROGRESS_DURATION = 2500; // ms

interface Star {
  id: number;
  angle: number;
  radius: number;
  size: number;
  speed: number;
  color: string;
}

function createStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    angle: (i / STAR_COUNT) * Math.PI * 2,
    radius: ORBIT_RADIUS,
    size: 8,
    speed: 1,
    color: COLORS[i % COLORS.length],
  }));
}

function StarSVG({ size, color }: { size: number; color: string }) {
  const outer = size;
  const inner = size * 0.3;
  const c = size;
  let d = "";
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${c + Math.cos(a) * r},${c + Math.sin(a) * r}`;
  }
  d += "Z";
  return (
    <svg width={size * 2} height={size * 2} viewBox={`0 0 ${size * 2} ${size * 2}`} className="block">
      <path d={d} fill={color} />
    </svg>
  );
}

export default function LogoLoader() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"loading" | "collapse" | "fly" | "done">("loading");
  const [stars] = useState(createStars);

  const anglesRef = useRef(stars.map((s) => s.angle));
  const starsOpacityRef = useRef(1);
  const logoScaleRef = useRef(1);
  const logoRotRef = useRef(0);
  const logoPosRef = useRef<{ x: number; y: number } | null>(null);
  const progressRef = useRef(0); // 0-100
  const phaseRef = useRef(phase);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  const starsContainerRef = useRef<HTMLDivElement>(null);
  const logoElRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const progressGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("wtf-loaded")) {
      setVisible(false);
      setPhase("done");
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  const tick = useCallback(
    (time: number) => {
      if (!startRef.current) startRef.current = time;
      const elapsed = time - startRef.current;
      const p = phaseRef.current;

      // --- LOADING (orbit + progress bar) ---
      if (p === "loading") {
        for (let i = 0; i < stars.length; i++) {
          anglesRef.current[i] += stars[i].speed * 0.018;
        }

        const t = Math.min(elapsed / PROGRESS_DURATION, 1);
        progressRef.current = Math.round(t * 100);
        logoScaleRef.current = 1 + t * 0.18;
        logoRotRef.current = t * 20;

        // Update progress bar DOM
        if (barFillRef.current) {
          barFillRef.current.style.width = `${t * 100}%`;
        }
        if (percentRef.current) {
          percentRef.current.textContent = String(Math.round(t * 100));
        }

        if (t >= 1) {
          setPhase("collapse");
          startRef.current = time;
        }
      }

      // --- COLLAPSE ---
      if (p === "collapse") {
        const t = Math.min((time - startRef.current) / 600, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        starsOpacityRef.current = 1 - ease;

        for (let i = 0; i < stars.length; i++) {
          anglesRef.current[i] += stars[i].speed * 0.018 * (1 - ease);
        }

        // Fade out progress bar
        if (progressGroupRef.current) {
          progressGroupRef.current.style.opacity = String(1 - ease);
        }

        if (t >= 1) {
          setPhase("fly");
          startRef.current = time;
        }
      }

      // --- FLY to navbar ---
      if (p === "fly") {
        const navLogo = document.getElementById("navbar-logo");
        if (navLogo) {
          const rect = navLogo.getBoundingClientRect();
          const tx = rect.left + rect.width / 2;
          const ty = rect.top + rect.height / 2;
          const t = Math.min((time - startRef.current) / 700, 1);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;

          logoPosRef.current = {
            x: cx + (tx - cx) * ease,
            y: cy + (ty - cy) * ease,
          };

          const navScale = rect.height / 180;
          logoScaleRef.current = 1.18 - (1.18 - navScale) * ease;
          logoRotRef.current = 20 * (1 - ease);

          if (t >= 1) {
            setPhase("done");
            sessionStorage.setItem("wtf-loaded", "1");
            setTimeout(() => setVisible(false), 250);
          }
        } else {
          setPhase("done");
          sessionStorage.setItem("wtf-loaded", "1");
          setTimeout(() => setVisible(false), 250);
        }
      }

      // --- Apply to DOM ---
      const cx = logoPosRef.current?.x ?? window.innerWidth / 2;
      const cy = logoPosRef.current?.y ?? window.innerHeight / 2;

      const container = starsContainerRef.current;
      if (container) {
        const children = container.children as HTMLCollectionOf<HTMLElement>;
        for (let i = 0; i < stars.length && i < children.length; i++) {
          const s = stars[i];
          const radius = p === "collapse" ? s.radius * starsOpacityRef.current : s.radius;
          const x = cx + Math.cos(anglesRef.current[i]) * radius - s.size;
          const y = cy + Math.sin(anglesRef.current[i]) * radius - s.size;
          children[i].style.transform = `translate(${x}px, ${y}px) rotate(${anglesRef.current[i]}rad)`;
          children[i].style.opacity = String(starsOpacityRef.current);
        }
      }

      const logoEl = logoElRef.current;
      if (logoEl) {
        logoEl.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${logoScaleRef.current}) rotate(${logoRotRef.current}deg)`;
      }

      if (p !== "done") {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [stars]
  );

  useEffect(() => {
    if (!visible || phase === "done") return;

    if (prefersReducedMotion) {
      sessionStorage.setItem("wtf-loaded", "1");
      setTimeout(() => setVisible(false), 400);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, phase, tick, prefersReducedMotion]);

  if (!visible && phase === "done") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Load Bebas Neue from Google Fonts */}
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
            rel="stylesheet"
          />

          {/* Stars */}
          <div ref={starsContainerRef} className="absolute inset-0 pointer-events-none">
            {stars.map((star) => (
              <div key={star.id} className="absolute top-0 left-0 will-change-transform">
                <StarSVG size={star.size} color={star.color} />
              </div>
            ))}
          </div>

          {/* Logo */}
          <div
            ref={logoElRef}
            className="absolute top-0 left-0 will-change-transform pointer-events-none"
          >
            <img
              src="/white_logo.png"
              alt="Wxrship The Fumes"
              width={180}
              height={180}
              className="w-[180px] h-[180px] object-contain"
            />
          </div>

          {/* Progress bar + percentage — below orbit circle */}
          <div
            ref={progressGroupRef}
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
            style={{ top: `calc(50% + ${ORBIT_RADIUS + 40}px)` }}
          >
            {/* Percentage */}
            <span
              ref={percentRef}
              className="text-[#C6FF00] text-4xl tracking-wider"
              style={{ fontFamily: "'Bebas Neue', cursive" }}
            >
              0
            </span>

            {/* Bar track */}
            <div className="w-48 h-[3px] bg-white/10 rounded-full overflow-hidden">
              <div
                ref={barFillRef}
                className="h-full rounded-full"
                style={{ width: "0%", backgroundColor: "#C6FF00" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
