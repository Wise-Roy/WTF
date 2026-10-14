"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Cinzel } from "next/font/google";
import { ProductCard, ProductSkeleton } from "@/components/common";
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
  const [labels, setLabels] = useState<string[]>([]);
  const { products, loading } = useFetchProducts(labelParam);

  useEffect(() => {
    fetch("/api/products/labels")
      .then((r) => r.json())
      .then((d) => setLabels(d.data?.labels || []))
      .catch(() => {});
  }, []);

  const setLabel = (label: string) => {
    const params = new URLSearchParams();
    if (label !== "All") params.set("label", label);
    router.push(`/silhouettes${params.toString() ? `?${params}` : ""}`);
  };

  const allLabels = ["All", ...labels];

  return (
    <section className="bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pt-16 pb-24">
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
          <ParallaxGrid products={products} />
        )}

        {!loading && products.length === 0 && (
          <p className="text-center text-[#1a1a1a]/50 py-20 text-lg">
            No designs in this category yet. Stay tuned.
          </p>
        )}
      </div>
    </section>
  );
}

function HeroSection() {
  const textRef = useRef<HTMLHeadingElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !textRef.current || !heroRef.current) return;

    let raf = 0;
    const update = () => {
      const hero = heroRef.current;
      const text = textRef.current;
      if (!hero || !text) return;

      const rect = hero.getBoundingClientRect();
      const vh = window.innerHeight;
      // scrollProgress: 0 at page top, increases as user scrolls
      const scrollProgress = Math.max(0, -rect.top / vh);
      // Move text upward from its initial bottom position
      const shift = scrollProgress * 500;
      text.style.transform = `translateY(-${shift}px)`;

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative h-[35vh] bg-[#C6FF00] overflow-hidden"
    >
      <div
        className="absolute pointer-events-none select-none opacity-[0.04]"
        style={{ top: "-20%", right: "-10%", width: "600px", height: "600px", transform: "rotate(-15deg)" }}
      >
        <Image src="/clean_logo.png" alt="" fill className="object-contain" aria-hidden="true" style={{ filter: "brightness(0) saturate(100%) invert(21%) sepia(95%) saturate(4871%) hue-rotate(326deg) brightness(91%) contrast(88%)" }} />
      </div>
      <h1
        ref={textRef}
        className="absolute bottom-0 left-0 right-0 text-[#DF2877] text-center select-none will-change-transform translate-y-[40%]"
        style={{
          fontFamily: cinzel.style.fontFamily,
          fontSize: "clamp(3rem, 10vw, 8rem)",
          lineHeight: 1.1,
          letterSpacing: "0.02em",
        }}
      >
        Silhouettes
      </h1>
    </div>
  );
}

export default function SilhouettesPage() {
  return (
    <>
      <HeroSection />
      <Suspense
        fallback={
          <section className="bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pb-24">
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
    </>
  );
}
