"use client";

import Image from "next/image";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    name,
    price,
    salePrice,
    isSoldOut,
    currency = "INR",
    image,
    dropLabel,
    number,
  } = product;

  const isOnSale = salePrice !== undefined && salePrice < price && !isSoldOut;
  const displayPrice = isOnSale ? salePrice : price;
  const priceStr = `₹${displayPrice.toLocaleString()}`;
  const longPrice = priceStr.length > 5;

  return (
    <div
      className={`group relative rounded-xl border border-black/[0.06] bg-white overflow-visible transition-all duration-200 ease-out ${
        isSoldOut
          ? "cursor-default"
          : "cursor-pointer hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.10)]"
      }`}
      style={{
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Card inner with clipped corners */}
      <div className="rounded-xl overflow-hidden">
        {/* TOP ZONE — Product image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className={`object-cover object-center ${
              isSoldOut ? "grayscale" : ""
            }`}
          />
          {/* Drop number pill */}
          <div className="absolute top-3 left-3 z-10 bg-[#DFFF1C] text-black text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {number}
          </div>
        </div>

        {/* PERFORATION DIVIDER */}
        <div className="relative h-0">
          {/* Dashed line — marching ants on hover */}
          <div
            className="absolute inset-x-3 top-0 h-[2px] group-hover:animate-[march_800ms_linear_infinite]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #D9D4B8 2px, transparent 2px)",
              backgroundSize: "6px 2px",
            }}
          />
          {/* Left notch */}
          <div
            className="absolute -left-[6px] -top-[6px] w-3 h-3 rounded-full bg-[#FBF6D9] z-10"
          />
          {/* Right notch */}
          <div
            className="absolute -right-[6px] -top-[6px] w-3 h-3 rounded-full bg-[#FBF6D9] z-10"
          />
        </div>

        {/* BOTTOM ZONE — Stub */}
        <div className="bg-white p-5 max-sm:p-4 flex items-center justify-between gap-4">
          {/* Left column */}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8A8676]">
              {dropLabel} &middot; {number}
            </p>
            <h3 className="mt-1 text-xl max-sm:text-lg font-bold text-[#111] leading-[1.15] line-clamp-2">
              {name}
            </h3>
          </div>

          {/* Right column */}
          <div className="text-right shrink-0 min-w-[90px]">
            {isSoldOut ? (
              <span className="text-xl font-extrabold text-[#7A2E2E]">
                SOLD OUT
              </span>
            ) : (
              <>
                {isOnSale && (
                  <p className="text-sm text-[#8A8676] line-through">
                    ₹{price.toLocaleString()}
                  </p>
                )}
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8A8676]">
                  {currency}
                </p>
                <p
                  className={`font-extrabold font-mono tabular-nums leading-none ${
                    longPrice
                      ? "text-[26px] max-sm:text-[22px]"
                      : "text-[32px] max-sm:text-[28px]"
                  } ${isOnSale ? "text-[#DFFF1C]" : "text-[#111]"}`}
                >
                  {priceStr}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
