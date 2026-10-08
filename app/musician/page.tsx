"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { DbMusician } from "@/types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────
 *  HERO INTRO — cinematic black + quote + clouds
 * ──────────────────────────────────────────── */

function HeroIntro() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cloudLRef = useRef<HTMLDivElement>(null);
  const cloudRRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const cloudL = cloudLRef.current;
    const cloudR = cloudRRef.current;
    if (!section || !text || !cloudL || !cloudR) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        pin: true,
      },
    });

    tl.to(text, { y: -200, opacity: 0, ease: "none" }, 0);
    tl.to(cloudL, { y: -300, x: -100, opacity: 0, ease: "none" }, 0);
    tl.to(cloudR, { y: -300, x: 100, opacity: 0, ease: "none" }, 0);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Intro text */}
      <div ref={textRef} className="relative z-10 max-w-3xl px-8 text-center">
        <p className="font-heading text-2xl md:text-4xl lg:text-5xl text-white/90 leading-[1.3] tracking-wide">
          Music plays a central role in igniting my fumes and these artists
          aren&rsquo;t just inspos but dream collaborators.
        </p>
        <p className="mt-8 font-body text-lg md:text-xl text-white/50 leading-relaxed italic">
          Their creativity lives on in the clothes I create, every track, every
          EP, every LP.
        </p>
      </div>

      {/* Cloud — bottom left */}
      <div
        ref={cloudLRef}
        className="absolute -bottom-10 -left-20 w-[500px] h-[300px] md:w-[700px] md:h-[400px] z-20 pointer-events-none"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 40% 80%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Cloud — bottom right */}
      <div
        ref={cloudRRef}
        className="absolute -bottom-10 -right-20 w-[500px] h-[300px] md:w-[700px] md:h-[400px] z-20 pointer-events-none"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 60% 80%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
 *  3D RING CAROUSEL
 * ──────────────────────────────────────────── */

function MusicianCarousel({ musicians }: { musicians: DbMusician[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const lastDragX = useRef(0);
  const lastDragTime = useRef(0);
  const rafRef = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const count = musicians.length;
  const angleStep = 360 / count;

  // Responsive ring radius
  const getRadius = useCallback(() => {
    if (typeof window === "undefined") return 400;
    if (window.innerWidth < 640) return 200;
    if (window.innerWidth < 1024) return 300;
    return 400;
  }, []);

  const getCardSize = useCallback(() => {
    if (typeof window === "undefined") return 220;
    if (window.innerWidth < 640) return 140;
    if (window.innerWidth < 1024) return 180;
    return 220;
  }, []);

  // Calculate which card is active from rotation
  const getActiveFromRotation = useCallback(
    (rot: number) => {
      const normalized = (((-rot % 360) + 360) % 360);
      return Math.round(normalized / angleStep) % count;
    },
    [angleStep, count]
  );

  // Snap to nearest card
  const snapToNearest = useCallback(
    (rot: number) => {
      const idx = getActiveFromRotation(rot);
      return -(idx * angleStep);
    },
    [getActiveFromRotation, angleStep]
  );

  // Apply transforms to ring
  const applyTransforms = useCallback(() => {
    const ring = ringRef.current;
    if (!ring) return;

    const radius = getRadius();
    const cardSize = getCardSize();
    const children = ring.children as HTMLCollectionOf<HTMLElement>;

    for (let i = 0; i < children.length; i++) {
      const card = children[i];
      const cardAngle = i * angleStep + rotationRef.current;
      const rad = (cardAngle * Math.PI) / 180;

      const x = Math.sin(rad) * radius;
      const z = Math.cos(rad) * radius - radius;

      // Depth-based effects
      const depth = (z + radius) / (2 * radius); // 0 = far, 1 = near
      const scale = 0.5 + depth * 0.5;
      const opacity = 0.2 + depth * 0.8;

      // Billboard: counter-rotate so photo faces camera
      const counterRotateY = -cardAngle;

      card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${counterRotateY}deg) scale(${scale})`;
      card.style.opacity = String(opacity);
      card.style.zIndex = String(Math.round(depth * 100));
      card.style.width = `${cardSize}px`;
      card.style.height = `${cardSize * 1.3}px`;
    }
  }, [angleStep, getRadius, getCardSize]);

  // Animate musician name change
  const updateActiveName = useCallback(
    (idx: number) => {
      const el = nameRef.current;
      if (!el) return;

      gsap.to(el, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        onComplete: () => {
          setActiveIdx(idx);
          gsap.fromTo(
            el,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
          );
        },
      });
    },
    []
  );

  // Main animation loop
  useEffect(() => {
    let prevActive = getActiveFromRotation(rotationRef.current);

    const animate = () => {
      if (!isDragging.current) {
        // Apply friction
        velocityRef.current *= 0.92;

        // If velocity is low, snap
        if (Math.abs(velocityRef.current) < 0.1) {
          const target = snapToNearest(rotationRef.current);
          const diff = target - rotationRef.current;

          // Normalize to shortest path
          let shortDiff = diff % 360;
          if (shortDiff > 180) shortDiff -= 360;
          if (shortDiff < -180) shortDiff += 360;

          rotationRef.current += shortDiff * 0.1;
          velocityRef.current = 0;
        } else {
          rotationRef.current += velocityRef.current;
        }
      }

      applyTransforms();

      // Check if active changed
      const newActive = getActiveFromRotation(rotationRef.current);
      if (newActive !== prevActive) {
        prevActive = newActive;
        updateActiveName(newActive);

        // Update ambient glow
        if (glowRef.current) {
          const hue = (newActive * 37) % 360; // pseudo-random color per musician
          gsap.to(glowRef.current, {
            background: `radial-gradient(circle at 50% 60%, hsla(${hue}, 40%, 30%, 0.3) 0%, transparent 70%)`,
            duration: 0.8,
            ease: "power2.out",
          });
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [applyTransforms, getActiveFromRotation, snapToNearest, updateActiveName]);

  // Drag handlers
  const onDragStart = useCallback((clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    dragStartRotation.current = rotationRef.current;
    lastDragX.current = clientX;
    lastDragTime.current = Date.now();
    velocityRef.current = 0;
  }, []);

  const onDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging.current) return;
      const radius = getRadius();
      const dx = clientX - dragStartX.current;
      rotationRef.current = dragStartRotation.current + (dx / radius) * 50;

      const now = Date.now();
      const dt = now - lastDragTime.current;
      if (dt > 0) {
        velocityRef.current = ((clientX - lastDragX.current) / radius) * 50 / dt * 16;
      }
      lastDragX.current = clientX;
      lastDragTime.current = now;
    },
    [getRadius]
  );

  const onDragEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Mouse events
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onDragStart(e.clientX);
      const onMove = (ev: MouseEvent) => onDragMove(ev.clientX);
      const onUp = () => {
        onDragEnd();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [onDragStart, onDragMove, onDragEnd]
  );

  // Touch events
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => onDragStart(e.touches[0].clientX),
    [onDragStart]
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => onDragMove(e.touches[0].clientX),
    [onDragMove]
  );
  const onTouchEnd = useCallback(() => onDragEnd(), [onDragEnd]);

  // Wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let snapTimeout: ReturnType<typeof setTimeout>;

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 2) return;
      e.preventDefault();

      rotationRef.current -= delta * 0.15;
      velocityRef.current = 0;

      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        // Let friction + snap in animate loop handle it
        velocityRef.current = 0.01; // tiny kick to trigger snap
      }, 150);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(snapTimeout);
    };
  }, []);

  // Click on card — rotate to front
  const handleCardClick = useCallback(
    (idx: number) => {
      const targetRotation = -(idx * angleStep);
      let diff = targetRotation - rotationRef.current;
      // Shortest path
      diff = ((diff % 360) + 540) % 360 - 180;

      gsap.to(rotationRef, {
        current: rotationRef.current + diff,
        duration: 0.8,
        ease: "power2.inOut",
      });
    },
    [angleStep]
  );

  return (
    <div className="relative min-h-screen bg-black py-20">
      {/* Ambient glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none transition-all"
      />

      <div
        ref={containerRef}
        className="relative mx-auto select-none"
        style={{
          perspective: "1000px",
          height: "60vh",
          minHeight: "400px",
          maxHeight: "700px",
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* 3D ring container */}
        <div
          ref={ringRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          style={{
            transformStyle: "preserve-3d",
            width: 0,
            height: 0,
          }}
        >
          {musicians.map((m, i) => (
            <div
              key={m.id}
              className="absolute will-change-transform rounded-xl overflow-hidden shadow-2xl"
              style={{
                left: "-110px",
                top: "-143px",
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
              onClick={() => handleCardClick(i)}
            >
              <div className="relative w-full h-full bg-[#1a1a1a]">
                {m.photo && (
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active musician name */}
      <div className="text-center mt-8">
        <h2
          ref={nameRef}
          className="font-heading text-4xl md:text-6xl uppercase tracking-wider"
          style={{ color: "#C6FF00" }}
        >
          {musicians[activeIdx]?.name || ""}
        </h2>
      </div>

      {/* Swipe hint */}
      <p className="text-center text-xs text-white/30 mt-6 uppercase tracking-wider">
        Drag or scroll to explore
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────
 *  MAIN PAGE
 * ──────────────────────────────────────────── */

export default function MusicianPage() {
  const [musicians, setMusicians] = useState<DbMusician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/musicians")
      .then((r) => r.json())
      .then((d) => setMusicians(d.data?.musicians || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <HeroIntro />

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : musicians.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-white/40 text-lg">No musicians yet.</p>
        </div>
      ) : (
        <MusicianCarousel musicians={musicians} />
      )}
    </div>
  );
}
