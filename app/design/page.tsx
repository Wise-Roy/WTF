"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Tangerine } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const tangerine = Tangerine({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

const FALLBACK_IMAGES = [
  { src: "/D1.jpg", alt: "Design 1" },
  { src: "/D2.jpg", alt: "Design 2" },
  { src: "/D3.jpg", alt: "Design 3" },
];

/* ────────────────────────────────────────────
 *  HERO — vertical image composition + parallax
 * ──────────────────────────────────────────── */

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null);

  // Build image DOM imperatively so React never reconciles GSAP-mutated nodes
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const buildImages = (images: { src: string; alt: string }[]) => {
      // Kill existing GSAP before touching DOM
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
        gsapCtxRef.current = null;
      }

      // Clear previous children
      stack.innerHTML = "";

      // Create image containers
      images.forEach((img, i) => {
        const wrapper = document.createElement("div");
        wrapper.className = "relative w-full will-change-transform overflow-hidden";
        wrapper.style.aspectRatio = "1/0.75";

        const imgEl = document.createElement("img");
        imgEl.src = img.src;
        imgEl.alt = img.alt;
        imgEl.className = "absolute inset-0 w-full h-full object-cover";
        if (i < 2) imgEl.loading = "eager";
        else imgEl.loading = "lazy";

        wrapper.appendChild(imgEl);
        stack.appendChild(wrapper);
      });

      // Setup GSAP
      setupGsap(stack.children as HTMLCollectionOf<HTMLElement>);
    };

    const setupGsap = (children: HTMLCollectionOf<HTMLElement>) => {
      const section = sectionRef.current;
      const title = titleRef.current;
      if (!section || !title) return;

      gsapCtxRef.current = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add(
          {
            reduced: "(prefers-reduced-motion: reduce)",
            normal: "(prefers-reduced-motion: no-preference)",
          },
          (ctx) => {
            const { reduced } = ctx.conditions!;
            if (reduced) return;

            const titleTl = gsap.timeline();
            titleTl.to(title, { y: -150, opacity: 0, ease: "none", duration: 1 });
            titleTl.set(title, { visibility: "hidden" });

            ScrollTrigger.create({
              trigger: section,
              start: "60% bottom",
              end: "bottom top",
              scrub: 1,
              animation: titleTl,
            });

            for (let i = 0; i < children.length; i++) {
              const el = children[i];
              const direction = i % 2 === 0 ? -80 : 80;
              ScrollTrigger.create({
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                animation: gsap.fromTo(
                  el,
                  { y: -direction },
                  { y: direction, ease: "none" }
                ),
              });
            }
          }
        );
      }, sectionRef);
    };

    // Start with fallbacks
    buildImages(FALLBACK_IMAGES);

    // Fetch from DB and rebuild
    const ac = new AbortController();
    fetch("/api/design-images", { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!ac.signal.aborted && d.data?.images?.length > 0) {
          buildImages(
            d.data.images.map((src: string, i: number) => ({
              src,
              alt: `Design ${i + 1}`,
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      ac.abort();
      if (gsapCtxRef.current) gsapCtxRef.current.revert();
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative bg-black">
      <h1
        ref={titleRef}
        className={`${tangerine.className} fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-[#C6FF00] text-[14vw] md:text-[10vw] lg:text-[8vw] pointer-events-none whitespace-nowrap`}
        style={{ textShadow: "0 4px 40px rgba(0,0,0,0.6)" }}
      >
        Designs
      </h1>

      {/* GSAP-managed — children rendered imperatively, React hands off */}
      <div ref={stackRef} className="relative z-10 flex flex-col" />
    </div>
  );
}

/* ────────────────────────────────────────────
 *  BRAND STORY — image left, copy right
 * ──────────────────────────────────────────── */

function BrandStory() {
  return (
    <section className="bg-toxic px-6 md:px-16 lg:px-24 py-24 md:py-32">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.8fr] gap-12 md:gap-20 items-start">
        {/* Left — image with star corner */}
        <div className="relative aspect-[3/4] w-full max-w-[320px] overflow-visible">
          {/* Image container — no bottom-right corner border */}
          <div className="absolute inset-0 overflow-hidden border border-black/10 border-b-0 border-r-0">
            <Image
              src="/logo-inspire.jpg"
              alt="Brand inspiration"
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>
          {/* Right border — stops before star */}
          <div className="absolute right-0 top-0 w-px bg-black/10" style={{ bottom: "36px" }} />
          {/* Bottom border — stops before star */}
          <div className="absolute bottom-0 left-0 h-px bg-black/10" style={{ right: "36px" }} />
          {/* WTF star — bottom-right corner */}
          <svg
            viewBox="0 0 48 48"
            className="absolute z-10"
            style={{ bottom: "-30px", right: "-30px", width: "72px", height: "72px" }}
            fill="#1a1a1a"
          >
            <path d="M24 2 L28.9 17.6 L45.1 17.6 L31.8 27.4 L36.7 43 L24 33.2 L11.3 43 L16.2 27.4 L2.9 17.6 L19.1 17.6 Z" />
            <path d="M24 8 L27.2 18.6 L38.4 18.6 L29.2 25.4 L32.4 36 L24 29.2 L15.6 36 L18.8 25.4 L9.6 18.6 L20.8 18.6 Z" fill="none" stroke="#C6FF00" strokeWidth="1" />
          </svg>
          <svg viewBox="0 0 48 48" className="absolute z-10" style={{ top: "-30px", left: "-30px", width: "72px", height: "72px" }} fill="#1a1a1a">
        <path d="M24 2 L28.9 17.6 L45.1 17.6 L31.8 27.4 L36.7 43 L24 33.2 L11.3 43 L16.2 27.4 L2.9 17.6 L19.1 17.6 Z" />
        <path d="M24 8 L27.2 18.6 L38.4 18.6 L29.2 25.4 L32.4 36 L24 29.2 L15.6 36 L18.8 25.4 L9.6 18.6 L20.8 18.6 Z" fill="none" stroke="#C6FF00" strokeWidth="1" />
      </svg>
        </div>

        {/* Right — copy */}
        <div className="font-body text-base md:text-lg leading-relaxed text-white space-y-6">
          <p>
            My brand was born from music and is fully inspired by it and the{" "}
            <span className="text-[#C6FF00] font-bold">artists</span> that build
            worlds around it.
          </p>
          <p>
            My brand name for instance, takes after a lyric from{" "}
            <span className="text-[#C6FF00] font-bold">Lorde&rsquo;s</span> 3rd
            album &lsquo;<span className="text-[#C6FF00] font-bold">Solar Power</span>&rsquo;.
            The word &lsquo;<span className="text-[#C6FF00] font-bold">fumes</span>&rsquo;
            signifies my passion for the urban experience which is something
            that guides every silhouette I create.
          </p>
          <p>
            When I craft collections or singular pieces, I present them as an
            artist releasing their music. I design an album cover and the name
            of each style acts as a track within a tracklist. As an aspiring
            popstar myself, my brand is the other side of the same coin.
          </p>
          <p>
            My vision and mission is to create pieces that cut through the
            basics and encourage you to be as{" "}
            <span className="text-[#C6FF00] font-bold">bratty</span> as you want.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
 *  PAGE
 * ──────────────────────────────────────────── */

export default function DesignPage() {
  return (
    <div>
      <HeroSection />
      <BrandStory />
    </div>
  );
}
