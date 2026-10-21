"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  MotionValue,
} from "framer-motion";
import { DbProduct } from "@/types";
import { useBag } from "@/context/BagContext";
/* ─── Helpers ─── */

function buildChapters(product: DbProduct) {
  const images = product.image?.length === 3 ? product.image : ["/eg.jpg", "/eg.jpg", "/eg.jpg"];
  return [
    {
      number: "01",
      title: "CONCEPT",
      body: product.prod_chapter_1 || "A numbered piece from the drop. Designed, printed, and shipped with intention.",
      image: images[0],
      alt: `${product.prod_name} — concept`,
    },
    {
      number: "02",
      title: "MATERIAL",
      body: product.prod_chapter_2 || "Crafted from premium materials selected for longevity. Every thread, every stitch — deliberate.",
      image: images[1],
      alt: `${product.prod_name} — material`,
    },
    {
      number: "03",
      title: "PROVENANCE",
      body: product.prod_chapter_3 || "We do not restock. We do not reprint. We do not apologize. When the run is done, the run is done.",
      image: images[2],
      alt: `${product.prod_name} — provenance`,
    },
  ];
}

/* ─── Parallax Image ─── */
function ParallaxImage({
  src,
  alt,
  scrollYProgress,
  driftRange = [-6, 6],
  scaleRange = [1.12, 1.18],
}: {
  src: string;
  alt: string;
  scrollYProgress: MotionValue<number>;
  driftRange?: [number, number];
  scaleRange?: [number, number];
}) {
  const y = useTransform(scrollYProgress, [0, 1], [`${driftRange[0]}%`, `${driftRange[1]}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);

  return (
    <motion.div className="absolute inset-0" style={{ y, scale }}>
      <Image src={src} alt={alt} fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 50vw" />
    </motion.div>
  );
}

/* ─── Text Reveal ─── */
function TextReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0.2, x: 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Sticky Top Bar ─── */
function StickyTopBar({ product }: { product: DbProduct }) {
  const { addItem } = useBag();
  const router = useRouter();
  const isSoldOut = product.prod_quantity <= 0;
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (isSoldOut || added) return;
    addItem({
      id: product.id,
      name: product.prod_name,
      price: product.prod_price,
      image: product.image?.[0] || "/eg.jpg",
    });
    setAdded(true);
    setTimeout(() => {
      router.push(`/product-story/${product.id}`);
    }, 600);
  };

  return (
    <div className="sticky top-16 z-40" style={{ background: "rgba(255,194,212,0.78)", backdropFilter: "blur(20px) saturate(140%)", borderBottom: "1px solid rgba(10,10,10,0.15)" }}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
        {/* Left: Back */}
        <Link href="/collections" className="flex items-center gap-2 group">
          <span className="text-[#0A0A0A] text-sm">&larr;</span>
          <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-[0.25em] text-[#0A0A0A]/70 group-hover:text-[#0A0A0A] transition-colors">Back</span>
        </Link>

        {/* Right: Add to Cart */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isSoldOut}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
            isSoldOut
              ? "bg-[#0A0A0A]/20 text-[#0A0A0A]/40 cursor-not-allowed"
              : added
                ? "bg-[#0A0A0A] text-white"
                : "bg-[#C6FF00] text-[#0A0A0A] hover:brightness-90 active:scale-95"
          }`}
        >
          {isSoldOut ? (
            "Sold Out"
          ) : added ? (
            "Added ✓"
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Intro Hero ─── */
function IntroHero({ product, chapters }: { product: DbProduct; chapters: ReturnType<typeof buildChapters> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ height: "90vh" }}>
      {/* Parallax cover image */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image
          src={product.image?.[0] || "/eg.jpg"}
          alt={product.prod_name}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end mx-auto max-w-[1600px] px-6 sm:px-10 pb-10 sm:pb-14">
        {/* Title */}
        <h1 className="font-heading text-[11vw] lg:text-[12vw] uppercase leading-[0.85] tracking-[-0.04em] text-white whitespace-nowrap">
          {product.prod_name}
        </h1>

        {/* Intro + Specs row */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12">
          <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-xl">
            {chapters[0].body}
          </p>
        </div>

        {/* Hairline */}
        <div className="mt-8 h-[1.5px] bg-white/30" />
      </div>
    </section>
  );
}

/* ─── Chapter Split (1 & 2) ─── */
function ChapterSplit({
  chapter,
  reversed = false,
}: {
  chapter: { number: string; title: string; body: string; image: string; alt: string };
  reversed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 px-6 sm:px-10 lg:px-20 bg-[#FFFAF6]">
      <div className={`mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 ${reversed ? "lg:direction-rtl" : ""}`}>
        {/* Image */}
        <div className={`relative aspect-[4/5] overflow-hidden border-[1.5px] border-[#0A0A0A] ${reversed ? "lg:order-2" : "lg:order-1"}`}>
          <ParallaxImage src={chapter.image} alt={chapter.alt} scrollYProgress={scrollYProgress} />

          {/* Overlay chips */}
          <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
            <span className="bg-[#0A0A0A] text-white text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm">
              {chapter.title}
            </span>
          </div>
        </div>

        {/* Text */}
        <div className={`flex flex-col justify-center ${reversed ? "lg:order-1" : "lg:order-2"}`}>
          <TextReveal>
            <h2 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl uppercase leading-[0.85] tracking-[-0.04em] text-[#0A0A0A]">
              {chapter.title}
            </h2>
            <div className="mt-4 w-16 h-[2px] bg-[#C8FF3D]" />
            <p className="mt-6 text-base sm:text-lg text-[#0A0A0A]/80 leading-relaxed max-w-xl">
              {chapter.body}
            </p>
          </TextReveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Chapter 3 — Full-Bleed Poster ─── */
function ChapterPoster({ chapter }: { chapter: { number: string; title: string; body: string; image: string; alt: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1.25]);

  return (
    <section ref={ref} className="relative overflow-hidden min-h-[60vh] md:min-h-[70vh] py-20 md:py-32 lg:py-40 bg-[#FFFAF6]">
      {/* Image */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image src={chapter.image} alt={chapter.alt} fill className="object-cover object-center" sizes="100vw" />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />

      {/* Text */}
      <div className="relative z-10 h-full flex flex-col justify-end mx-auto max-w-[1600px] px-6 sm:px-10">
        <TextReveal>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.85] tracking-[-0.04em] text-white">
            {chapter.title}
          </h2>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl">
            {chapter.body}
          </p>
        </TextReveal>
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.data?.product || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFAF6] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#C8FF3D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFFAF6] flex flex-col items-center justify-center gap-4">
        <p className="text-[#0A0A0A]/50 text-lg">Product not found.</p>
        <Link href="/collections" className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors">
          &larr; Back to collections
        </Link>
      </div>
    );
  }

  const chapters = buildChapters(product);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#FFFAF6]"
    >
      <StickyTopBar product={product} />
      <IntroHero product={product} chapters={chapters} />
      <ChapterSplit chapter={chapters[0]} />
      <ChapterSplit chapter={chapters[1]} reversed />
      <ChapterPoster chapter={chapters[2]} />
    </motion.div>
  );
}
