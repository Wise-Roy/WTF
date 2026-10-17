"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { DbProduct } from "@/types";
import { useBag } from "@/context/BagContext";

// Singleton offer cache — fetched once per page load
let offerCache: { product_id: string; original_price: number } | null | undefined = undefined;
let offerPromise: Promise<void> | null = null;

function fetchOfferOnce() {
  if (offerPromise) return offerPromise;
  offerPromise = fetch("/api/offer")
    .then((r) => r.json())
    .then((d) => {
      const o = d.data?.offer;
      offerCache = o && o.product_id ? { product_id: o.product_id, original_price: o.original_price } : null;
    })
    .catch(() => { offerCache = null; });
  return offerPromise;
}

interface ProductCardProps {
  product: DbProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, image, prod_name, prod_price, prod_quantity } = product;
  const [offerOriginalPrice, setOfferOriginalPrice] = useState<number | null>(null);

  useEffect(() => {
    if (offerCache !== undefined) {
      if (offerCache && offerCache.product_id === id) {
        setOfferOriginalPrice(offerCache.original_price);
      }
      return;
    }
    fetchOfferOnce().then(() => {
      if (offerCache && offerCache.product_id === id) {
        setOfferOriginalPrice(offerCache.original_price);
      }
    });
  }, [id]);

  const imgLayersRef = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const priceRef = useRef<HTMLDivElement>(null);
  const activeIdx = useRef(0);

  const [added, setAdded] = useState(false);

  const { addItem } = useBag();

  const isSoldOut = prod_quantity <= 0;
  const priceStr = `₹${prod_price.toLocaleString()}`;
  const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  const imgs = [
    image?.[0] || "/eg.jpg",
    image?.[1] || image?.[0] || "/eg.jpg",
    image?.[2] || image?.[0] || "/eg.jpg",
  ];

  const showImage = useCallback((idx: number) => {
    for (let i = 0; i < 3; i++) {
      const el = imgLayersRef.current[i];
      if (el) el.style.opacity = i === idx ? "1" : "0";
    }
  }, []);

  const handlePointerEnter = useCallback(() => {
    if (isTouch) return;
    const next = (activeIdx.current + 1) % 3;
    activeIdx.current = next;
    showImage(next);
    if (priceRef.current) {
      priceRef.current.style.transform = "rotate(-20deg) scale(1.05)";
    }
  }, [isTouch, showImage]);

  const handlePointerLeave = useCallback(() => {
    if (isTouch) return;
    if (priceRef.current) {
      priceRef.current.style.transform = "rotate(0deg) scale(1)";
    }
  }, [isTouch]);

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
      href={`/get/${id}`}
      aria-label={`${prod_name}, ₹${prod_price}${isSoldOut ? ", sold out" : ""}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`group relative rounded-xl border border-black/[0.06] bg-white overflow-visible transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00] block ${
        isSoldOut
          ? "opacity-70"
          : "hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.10)]"
      }`}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)" }}
    >
      <div className="rounded-xl overflow-hidden">
        <div className="relative aspect-[4/5] overflow-hidden select-none">
          {imgs.map((src, i) => (
            <div
              key={i}
              ref={(el) => { imgLayersRef.current[i] = el; }}
              className="absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <Image
                src={src}
                alt={`${prod_name} — image ${i + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading={i === 0 ? "eager" : "lazy"}
                className={`object-cover object-center ${isSoldOut ? "grayscale" : ""}`}
              />
            </div>
          ))}

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <span className="text-white text-xl font-extrabold uppercase tracking-wider">Sold Out</span>
            </div>
          )}

          {/* Circle add-to-cart button */}
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
          <div
            ref={priceRef}
            className="shrink-0 bg-[#C6FF00] rounded-full px-4 py-2 transition-transform duration-500 ease-in-out"
          >
            {offerOriginalPrice && offerOriginalPrice > prod_price ? (
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums leading-none text-[14px] max-sm:text-[12px] text-[#111]/40 line-through">
                  ₹{offerOriginalPrice.toLocaleString()}
                </span>
                <p className="font-extrabold font-mono tabular-nums leading-none text-[22px] max-sm:text-[18px] text-[#111]">
                  {priceStr}
                </p>
              </div>
            ) : (
              <p className="font-extrabold font-mono tabular-nums leading-none text-[22px] max-sm:text-[18px] text-[#111]">
                {priceStr}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
