"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductSkeleton, Tagline, SectionHeading } from "@/components/common";
import { DbProduct } from "@/types";
import { useBag } from "@/context/BagContext";

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

  return { products, loading };
}

function CollectionCard({ product }: { product: DbProduct }) {
  const { id, image, prod_name, prod_price, prod_quantity } = product;
  const { addItem } = useBag();
  const [added, setAdded] = useState(false);
  const isSoldOut = prod_quantity <= 0;
  const imgs = [
    image?.[0] || "/eg.jpg",
    image?.[1] || image?.[0] || "/eg.jpg",
    image?.[2] || image?.[0] || "/eg.jpg",
  ];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut || added) return;
    addItem({ id, name: prod_name, price: prod_price, image: imgs[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      href={`/product-story/${id}`}
      aria-label={`${prod_name}, ₹${prod_price}${isSoldOut ? ", sold out" : ""}`}
      className={`group relative rounded-xl border border-black/[0.06] bg-white overflow-visible transition-all duration-200 ease-out block ${
        isSoldOut
          ? "opacity-70"
          : "hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.10)]"
      }`}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)" }}
    >
      <div className="rounded-xl overflow-hidden">
        <div className="relative aspect-[4/5] overflow-hidden select-none">
          <Image
            src={imgs[0]}
            alt={prod_name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-center ${isSoldOut ? "grayscale" : ""}`}
          />

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <span className="text-white text-xl font-extrabold uppercase tracking-wider">Sold Out</span>
            </div>
          )}

          {!isSoldOut && (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={added ? `${prod_name} added to cart` : `Add ${prod_name} to cart`}
              className={`absolute bottom-3 right-3 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                added
                  ? "bg-[#1a1a1a] scale-110"
                  : "bg-[#d4f542] hover:scale-110 active:scale-95"
              }`}
            >
              {added ? (
                <span className="text-[#d4f542] text-lg font-bold leading-none">&#10003;</span>
              ) : (
                <span className="text-[#1a1a1a] text-2xl font-bold leading-none transition-transform duration-200 group-hover:rotate-90">+</span>
              )}
            </button>
          )}
        </div>

        <div className="bg-white p-5 max-sm:p-4 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg max-sm:text-base font-bold text-[#111] leading-[1.15] line-clamp-2">
              {prod_name}
            </h3>
            {product.prod_label && (
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#888] bg-[#f5f5f5] px-2 py-0.5 rounded">
                {product.prod_label}
              </span>
            )}
          </div>
          <div className="shrink-0 bg-[#C6FF00] rounded-full px-4 py-2">
            <p className="font-extrabold font-mono tabular-nums leading-none text-[22px] max-sm:text-[18px] text-[#111]">
              ₹{prod_price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CollectionsContent() {
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
    router.push(`/collections${params.toString() ? `?${params}` : ""}`);
  };

  const allLabels = ["All", ...labels];

  return (
    <section className="bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap gap-3 mb-12">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <CollectionCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <p className="text-center text-[#1a1a1a]/50 py-20 text-lg">
            No designs in this collection yet. Stay tuned.
          </p>
        )}
      </div>
    </section>
  );
}

export default function CollectionsPage() {
  return (
    <>
      <div className="relative bg-[#FFF9D6] text-[#1a1a1a] pt-32 pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div
          className="absolute pointer-events-none select-none opacity-[0.07]"
          style={{ top: "-55%", right: "-15%", width: "500px", height: "500px", transform: "rotate(-15deg)" }}
        >
          <Image src="/clean_logo.png" alt="" fill className="object-contain" aria-hidden="true" />
        </div>
        <div className="mx-auto max-w-7xl relative z-10">
          <Tagline>Curated Drops</Tagline>
          <SectionHeading className="mt-6">Collections</SectionHeading>
          <p className="mt-6 max-w-2xl text-lg text-[#1a1a1a]/70">
            Every piece is numbered, limited, and never restocked. Once it&apos;s gone, it&apos;s gone.
          </p>
        </div>
      </div>
      <Suspense
        fallback={
          <section className="bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pb-24">
            <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </section>
        }
      >
        <CollectionsContent />
      </Suspense>
    </>
  );
}
