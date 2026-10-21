"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { SectionWrapper, SectionHeading, Tagline, Button } from "@/components/common";
import { useImageParallax } from "@/hooks";

gsap.registerPlugin(ScrollTrigger);

/* ── Types & Fallbacks ── */
interface AboutSection {
  id: string;
  position: number;
  tagline: string;
  heading: string;
  body: string;
  images: string[];
}

const FALLBACK_SECTIONS: AboutSection[] = [
  {
    id: "fallback-1",
    position: 1,
    tagline: "Our Story",
    heading: "Born in the back of a garage",
    body: "Wxrship The Fumes started in 2026 with a marker, a blank hoodie, and zero intention of playing it safe. No business plan, no investors \u2014 just a belief that streetwear had lost its edge and someone needed to bring the weird back.",
    images: ["/eg.jpg"],
  },
];

const FALLBACK_HERO_IMAGES = ["/eg.jpg", "/eg.jpg", "/eg.jpg"];
const IMAGE_INTERVAL = 3500;

/* ── Looping Image (about sections) ── */
function LoopingImage({ images, alt }: { images: string[]; alt: string }) {
  const imgRef = useImageParallax<HTMLDivElement>(0.18);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % images.length), IMAGE_INTERVAL);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div data-parallax-frame className="aspect-[3/4] relative overflow-visible">
      <div className="absolute inset-0 overflow-hidden border border-black/10 border-b-0 border-l-0">
        <div ref={imgRef} className="absolute -inset-[12%] will-change-transform" style={{ transform: "translate3d(0,0,0)" }}>
          {images.map((src, i) => (
            <Image key={src} src={src} alt={`${alt} ${i + 1}`} fill className={`object-cover object-center transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`} />
          ))}
        </div>
      </div>
      <div className="absolute left-0 top-0 w-px bg-black/10" style={{ bottom: "28px" }} />
      <div className="absolute bottom-0 right-0 h-px bg-black/10" style={{ left: "28px" }} />
      <svg viewBox="0 0 48 48" className="absolute z-10" style={{ bottom: "-24px", left: "-24px", width: "64px", height: "64px" }} fill="#1a1a1a">
        <path d="M24 2 L28.9 17.6 L45.1 17.6 L31.8 27.4 L36.7 43 L24 33.2 L11.3 43 L16.2 27.4 L2.9 17.6 L19.1 17.6 Z" />
        <path d="M24 8 L27.2 18.6 L38.4 18.6 L29.2 25.4 L32.4 36 L24 29.2 L15.6 36 L18.8 25.4 L9.6 18.6 L20.8 18.6 Z" fill="none" stroke="#C6FF00" strokeWidth="1" />
      </svg>
      <svg viewBox="0 0 48 48" className="absolute z-10" style={{ top: "-24px", right: "-24px", width: "64px", height: "64px" }} fill="#1a1a1a">
        <path d="M24 2 L28.9 17.6 L45.1 17.6 L31.8 27.4 L36.7 43 L24 33.2 L11.3 43 L16.2 27.4 L2.9 17.6 L19.1 17.6 Z" />
        <path d="M24 8 L27.2 18.6 L38.4 18.6 L29.2 25.4 L32.4 36 L24 29.2 L15.6 36 L18.8 25.4 L9.6 18.6 L20.8 18.6 Z" fill="none" stroke="#C6FF00" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ── About Section Block ── */
function AboutSectionBlock({ section }: { section: AboutSection }) {
  const imageOnLeft = section.position === 2;
  const textBlock = (
    <div>
      <Tagline>{section.tagline}</Tagline>
      <SectionHeading className="mt-6">{section.heading}</SectionHeading>
      <p className="mt-6 font-body text-lg text-white/70 leading-relaxed max-w-lg">{section.body}</p>
      <Button href="/silhouettes" className="mt-8">Shop the collection</Button>
    </div>
  );
  const imageBlock = <LoopingImage images={section.images} alt={section.heading} />;

  return (
    <SectionWrapper scheme="pink">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {imageOnLeft ? <>{imageBlock}{textBlock}</> : <>{textBlock}{imageBlock}</>}
      </div>
    </SectionWrapper>
  );
}

/* ── Designer Hero — 3-image expanding stack (design-scroll.md) ── */
function DesignerHero({ images }: { images: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
      },
      (context) => {
        const { isMobile } = context.conditions!;

        const spread = isMobile ? 85 : 115;
        const imgW = isMobile ? "45vw" : "28vw";
        const imgMaxW = isMobile ? "260px" : "380px";

        gsap.set(".hero-img", { width: imgW, maxWidth: imgMaxW });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=200%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Image 2 (left) — starts slightly left, moves far left
        tl.fromTo(
          ".hero-img-2",
          { xPercent: 8, yPercent: 2, rotation: 2 },
          { xPercent: -spread, yPercent: -5, rotation: -4, ease: "power1.out", duration: 1 },
          0
        );

        // Image 3 (right) — starts slightly right, moves far right
        tl.fromTo(
          ".hero-img-3",
          { xPercent: -8, yPercent: -2, rotation: -2 },
          { xPercent: spread, yPercent: 5, rotation: 3, ease: "power1.out", duration: 1 },
          0
        );

        // Image 1 (center) — subtle scale-up, stays central
        tl.fromTo(
          ".hero-img-1",
          { scale: 1, rotation: 0 },
          { scale: 1.05, rotation: 0, ease: "none", duration: 1 },
          0
        );

        // Text starts left of center, arrives at center when scroll ends
        tl.fromTo(
          ".hero-text",
          { xPercent: isMobile ? -70 : -80 },
          { xPercent: 0, ease: "none", duration: 1 },
          0
        );
      }
    );

    return () => mm.revert();
  }, [prefersReducedMotion, images]);

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <div className="relative bg-[#FFF9D6] text-[#1a1a1a] pt-32 pb-20 px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-heading text-5xl md:text-7xl lg:text-[5.5rem] font-bold uppercase tracking-[0.08em] leading-[0.95]">
            Designer
          </h1>
          <p className="mt-8 font-body text-lg md:text-xl text-[#1a1a1a]/70 leading-relaxed max-w-2xl mx-auto">
            Wxrship The Fumes exists for the ones who&apos;d rather be themselves than be liked. This is our story.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-[3/4] overflow-hidden">
              <Image src={src} alt={`Designer photo ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#FFF9D6] text-[#1a1a1a]">
      {/* Watermark */}
      <div
        className="absolute pointer-events-none select-none opacity-[0.04]"
        style={{ top: "-20%", right: "-10%", width: "600px", height: "600px", transform: "rotate(-15deg)" }}
      >
        <Image src="/clean_logo.png" alt="" fill className="object-contain" aria-hidden="true" />
      </div>

      {/* Central image stack */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Image 2 — behind left */}
        <div className="hero-img hero-img-2 absolute aspect-[3/4] will-change-transform" style={{ zIndex: 10 }}>
          <div className="relative w-full h-full overflow-hidden shadow-2xl">
            <Image src={images[1]} alt="Designer photo 2" fill className="object-cover" sizes="(max-width:768px) 45vw, 28vw" priority />
          </div>
        </div>

        {/* Image 3 — behind right */}
        <div className="hero-img hero-img-3 absolute aspect-[3/4] will-change-transform" style={{ zIndex: 10 }}>
          <div className="relative w-full h-full overflow-hidden shadow-2xl">
            <Image src={images[2]} alt="Designer photo 3" fill className="object-cover" sizes="(max-width:768px) 45vw, 28vw" priority />
          </div>
        </div>

        {/* Image 1 — front center */}
        <div className="hero-img hero-img-1 absolute aspect-[3/4] will-change-transform" style={{ zIndex: 20 }}>
          <div className="relative w-full h-full overflow-hidden shadow-2xl">
            <Image src={images[0]} alt="Designer photo 1" fill className="object-cover" sizes="(max-width:768px) 45vw, 28vw" priority />
          </div>
        </div>
      </div>

      {/* "Designer" text overlay */}
      <h1
        className="hero-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 font-heading text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[12rem] xl:text-[14rem] font-bold uppercase tracking-[0.06em] leading-[0.85] text-white pointer-events-none whitespace-nowrap will-change-transform"
        style={{ textShadow: "0 2px 30px rgba(255,249,214,0.5)" }}
      >
        <span className="text-[#C6FF00]">Des</span>igner
      </h1>
    </div>
  );
}

/* ── Spotify Playlist URL helpers ── */
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

/* ── Spotify Playlist Section ── */
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

        {/* Gradient-glow bordered faux-browser card */}
        <div className="group relative">
          {/* Outer glow layer */}
          <div
            className="absolute -inset-px rounded-3xl opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "linear-gradient(135deg, #FF2D8C, #a855f5, #7B2FFF)" }}
            aria-hidden="true"
          />
          {/* Inner card */}
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

/* ── Main Page ── */
export default function DesignerPage() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>(FALLBACK_HERO_IMAGES);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((d) => {
        const data = d.data?.sections || [];
        setSections(data.length > 0 ? data : FALLBACK_SECTIONS);
      })
      .catch(() => setSections(FALLBACK_SECTIONS))
      .finally(() => setLoaded(true));

    fetch("/api/designer-hero")
      .then((r) => r.json())
      .then((d) => {
        const imgs = d.data?.images;
        if (imgs && imgs.filter(Boolean).length === 3) {
          setHeroImages(imgs);
        }
      })
      .catch(() => {});

    fetch("/api/footer")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.footer?.spotify) setSpotifyUrl(d.data.footer.spotify);
      })
      .catch(() => {});
  }, []);

  const displaySections = loaded ? sections : FALLBACK_SECTIONS;

  return (
    <>
      <DesignerHero images={heroImages} />
      {spotifyUrl && <SpotifyPlaylistSection spotifyUrl={spotifyUrl} />}
      {displaySections.map((section) => (
        <AboutSectionBlock key={section.id} section={section} />
      ))}
    </>
  );
}
