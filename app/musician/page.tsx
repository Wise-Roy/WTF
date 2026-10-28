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

    const ctx = gsap.context(() => {
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    // Wrapper owned by React: ScrollTrigger pin inserts a pin-spacer around the inner div
    <div>
    <div ref={sectionRef} className="relative h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/music.jpg"
        alt=""
        fill
        className="object-cover"
        priority
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />

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
        className="absolute -bottom-10 -left-20 w-[600px] h-[350px] md:w-[800px] md:h-[450px] z-20 pointer-events-none"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 40% 80%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.1) 55%, transparent 75%)",
            filter: "blur(15px)",
          }}
        />
      </div>

      {/* Cloud — bottom right */}
      <div
        ref={cloudRRef}
        className="absolute -bottom-10 -right-20 w-[600px] h-[350px] md:w-[800px] md:h-[450px] z-20 pointer-events-none"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 60% 80%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.1) 55%, transparent 75%)",
            filter: "blur(15px)",
          }}
        />
      </div>
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
  const activeIdxRef = useRef(0);

  const count = musicians.length;
  const angleStep = 360 / count;

  // Responsive ring radius
  const getRadius = useCallback(() => {
    if (typeof window === "undefined") return 480;
    if (window.innerWidth < 640) return 250;
    if (window.innerWidth < 1024) return 360;
    return 480;
  }, []);

  const getCardSize = useCallback(() => {
    if (typeof window === "undefined") return 280;
    if (window.innerWidth < 640) return 180;
    if (window.innerWidth < 1024) return 230;
    return 280;
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
          activeIdxRef.current = idx;
          el.textContent = musicians[idx]?.name || "";
          gsap.fromTo(
            el,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
          );
        },
      });
    },
    [musicians]
  );

  // Click on card — rotate to front
  const handleCardClick = useCallback(
    (idx: number) => {
      const targetRotation = -(idx * angleStep);
      let diff = targetRotation - rotationRef.current;
      diff = ((diff % 360) + 540) % 360 - 180;

      gsap.to(rotationRef, {
        current: rotationRef.current + diff,
        duration: 0.8,
        ease: "power2.inOut",
      });
    },
    [angleStep]
  );

  // Build ring children imperatively — React never reconciles these nodes
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    ring.innerHTML = "";

    musicians.forEach((m, i) => {
      const card = document.createElement("div");
      card.className = "absolute will-change-transform rounded-xl overflow-hidden shadow-2xl";
      card.style.left = "-140px";
      card.style.top = "-182px";
      card.style.transformStyle = "preserve-3d";
      card.style.backfaceVisibility = "hidden";
      card.addEventListener("click", () => handleCardClick(i));

      const inner = document.createElement("div");
      inner.className = "relative w-full h-full bg-[#44444E]";

      if (m.photo) {
        const img = document.createElement("img");
        img.src = m.photo;
        img.alt = m.name;
        img.className = "absolute inset-0 w-full h-full object-cover";
        img.loading = "lazy";
        inner.appendChild(img);
      }

      card.appendChild(inner);
      ring.appendChild(card);
    });
  }, [musicians, handleCardClick]);

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
          height: "70vh",
          minHeight: "500px",
          maxHeight: "850px",
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* 3D ring container — children rendered imperatively to avoid React/GSAP conflicts */}
        <div
          ref={ringRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          style={{
            transformStyle: "preserve-3d",
            width: 0,
            height: 0,
          }}
        />
      </div>

      {/* Active musician name */}
      <div className="text-center mt-8">
        <h2
          ref={nameRef}
          className="font-heading text-4xl md:text-6xl uppercase tracking-wider"
          style={{ color: "#C6FF00" }}
        >
          {musicians[0]?.name || ""}
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
 *  SPOTIFY PLAYLIST
 * ──────────────────────────────────────────── */

function extractSpotifyPlaylistId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "open.spotify.com") return null;
    const match = u.pathname.match(/^\/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function SpotifyPlaylistSection({ spotifyUrl }: { spotifyUrl: string }) {
  const playlistId = extractSpotifyPlaylistId(spotifyUrl);
  if (!playlistId) return null;

  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;

  return (
    <section className="bg-black py-16 px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-white/40 mb-3 text-center">
          Curated by the designer
        </p>
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-[0.04em] text-white mb-10 text-center">
          The Playlist
        </h2>

        <div className="group relative">
          <div
            className="absolute -inset-px rounded-3xl opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "linear-gradient(135deg, #FF2D8C, #a855f5, #7B2FFF)" }}
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-1.5">
            <iframe
              src={embedUrl}
              width="100%"
              height="552"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify playlist player"
              className="border-0 rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
 *  MAIN PAGE
 * ──────────────────────────────────────────── */

export default function MusicianPage() {
  const [musicians, setMusicians] = useState<DbMusician[]>([]);
  const [loading, setLoading] = useState(true);
  const [spotifyUrl, setSpotifyUrl] = useState("");

  useEffect(() => {
    fetch("/api/musicians")
      .then((r) => r.json())
      .then((d) => setMusicians(d.data?.musicians || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/footer")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.footer?.spotify) setSpotifyUrl(d.data.footer.spotify);
      })
      .catch(() => {});
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

      {spotifyUrl && <SpotifyPlaylistSection spotifyUrl={spotifyUrl} />}
    </div>
  );
}
