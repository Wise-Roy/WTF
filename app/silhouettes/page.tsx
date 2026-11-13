"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Cinzel } from "next/font/google";
import { ProductCard, ProductSkeleton, SectionFade } from "@/components/common";
import { DbProduct } from "@/types";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

function useFetchProducts(label: string) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  useEffect(() => {
    const id = ++reqId.current;
    const url =
      label === "All"
        ? "/api/products"
        : `/api/products?label=${encodeURIComponent(label)}`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (id === reqId.current) {
          setProducts(d.data?.products || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (id === reqId.current) {
          setProducts([]);
          setLoading(false);
        }
      });
  }, [label]);

  const reset = useCallback(() => setLoading(true), []);

  return { products, loading, reset };
}

// Hero title + its hover "decode" animation. Swap TITLE for any other word.
const TITLE = "SILHOUETTES";
const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#ABCXYZ%@&";
const TOTAL_FRAMES = 38;
const FRAME_MS = 45;

const COL_SPEEDS = [0, -0.09, 0.05];
const MAX_SHIFT = 70;

function ParallaxGrid({ products }: { products: DbProduct[] }) {
  const colRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const rafRef = useRef(0);

  // Split products into columns
  const cols: DbProduct[][] = [[], [], []];
  products.forEach((p, i) => cols[i % 3].push(p));

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const isMobile = window.innerWidth < 640;

    const update = () => {
      const vh = window.innerHeight;
      const center = vh / 2;

      for (let c = 0; c < 3; c++) {
        const el = colRefs.current[c];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = elCenter - center;
        const speed = COL_SPEEDS[c];
        const shift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dist * speed));
        const mobile = isMobile ? 0.5 : 1;
        el.style.transform = `translateY(${shift * mobile}px)`;
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [products]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      {cols.map((col, c) => (
        <div
          key={c}
          ref={(el) => { colRefs.current[c] = el; }}
          className={`flex flex-col gap-6 will-change-transform ${c === 2 ? "hidden lg:flex" : ""}`}
        >
          {col.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const labelParam = searchParams.get("label") || "All";
  const query = (searchParams.get("q") || "").trim();
  const [labels, setLabels] = useState<string[]>([]);
  const { products, loading } = useFetchProducts(labelParam);

  // Navbar search lands here: substring match on the product name.
  const shown = query
    ? products.filter((p) =>
        (p.prod_name || "").toLowerCase().includes(query.toLowerCase())
      )
    : products;

  useEffect(() => {
    fetch("/api/products/labels")
      .then((r) => r.json())
      .then((d) => setLabels(d.data?.labels || []))
      .catch(() => {});
  }, []);

  const setLabel = (label: string) => {
    const params = new URLSearchParams();
    if (label !== "All") params.set("label", label);
    if (query) params.set("q", query);
    router.push(`/silhouettes${params.toString() ? `?${params}` : ""}`);
  };

  const allLabels = ["All", ...labels];

  return (
    <section className="px-6 md:px-12 lg:px-20 pt-16 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap gap-3 mb-20">
          {allLabels.map((label) => (
            <button
              key={label}
              onClick={() => setLabel(label)}
              className={`px-5 py-2 text-sm font-bold uppercase tracking-wider border transition-colors ${
                labelParam === label
                  ? "bg-[#C6FF00] text-[#1a1a1a] border-[#C6FF00]"
                  : "border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#C6FF00] hover:text-[#88AF00]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ParallaxGrid products={shown} />
        )}

        {!loading && shown.length === 0 && (
          <p className="text-center text-[#1a1a1a]/50 py-20 text-lg">
            {query
              ? `No designs match “${query}”.`
              : "No designs in this category yet. Stay tuned."}
          </p>
        )}
      </div>
    </section>
  );
}

function HeroSection() {
  const [text, setText] = useState(TITLE);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const scramble = () => {
    if (timer.current) return; // already decoding — let it finish
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    timer.current = setInterval(() => {
      frame++;
      if (frame >= TOTAL_FRAMES) {
        setText(TITLE);
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        return;
      }
      const revealed = Math.floor((frame / TOTAL_FRAMES) * TITLE.length);
      setText(
        TITLE.split("")
          .map((c, i) =>
            i < revealed
              ? c
              : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          )
          .join("")
      );
    }, FRAME_MS);
  };

  return (
    <div className="relative h-[30vh] bg-[#C6FF00] overflow-hidden">
      <div
        className="absolute pointer-events-none select-none opacity-[0.04]"
        style={{ top: "-20%", right: "-10%", width: "600px", height: "600px", transform: "rotate(-15deg)" }}
      >
        <Image src="/clean_logo.png" alt="" fill className="object-contain" aria-hidden="true" style={{ filter: "brightness(0) saturate(100%) invert(21%) sepia(95%) saturate(4871%) hue-rotate(326deg) brightness(91%) contrast(88%)" }} />
      </div>
      <h1
        onMouseEnter={scramble}
        onFocus={scramble}
        tabIndex={0}
        aria-label={TITLE}
        className="absolute inset-0 flex items-center justify-center px-4 pt-32 text-[#DF2877] text-center select-none title-glow-pink outline-none cursor-default"
        style={{
          fontFamily: cinzel.style.fontFamily,
          fontSize: "clamp(3rem, 10vw, 8rem)",
          lineHeight: 1.1,
          letterSpacing: "0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {text}
      </h1>
    </div>
  );
}

export default function SilhouettesPage() {
  return (
    <>
      <HeroSection />
      <SectionFade from="#C6FF00" to="#FFF9D6" />
      {/* Continuous gradient behind the grid, like the home page */}
      <div
        style={{
          background: `
            radial-gradient(ellipse at 15% 10%, rgba(244, 205, 181, 0.35) 0%, transparent 35%),
            radial-gradient(ellipse at 85% 40%, rgba(190, 174, 211, 0.3) 0%, transparent 35%),
            radial-gradient(ellipse at 20% 75%, rgba(198, 255, 0, 0.15) 0%, transparent 30%),
            radial-gradient(ellipse at 80% 95%, rgba(223, 40, 119, 0.15) 0%, transparent 30%),
            linear-gradient(180deg, #FFF9D6 0%, #f8ead6 55%, #ece3ee 100%)
          `,
        }}
      >
      <Suspense
        fallback={
          <section className="px-6 md:px-12 lg:px-20 pb-24">
            <div className="mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </section>
        }
      >
        <ShopContent />
      </Suspense>
      </div>
    </>
  );
}
