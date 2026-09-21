"use client";

import Image from "next/image";
import { Product } from "@/types";
import { useImageParallax } from "@/hooks";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imgRef = useImageParallax<HTMLDivElement>(0.18);

  return (
    <div className="group border border-[#1a1a1a]/10 overflow-hidden">
      {/* Parallax frame */}
      <div
        data-parallax-frame
        className="aspect-[3/4] bg-[#FFF3B0] relative overflow-hidden"
      >
        {/* Oversized image layer — drifts on scroll */}
        <div
          ref={imgRef}
          className="absolute -inset-[12%] will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 z-10" />
      </div>
      <div className="p-4 bg-[#FFF9D6]">
        <p className="text-sm text-[#88AF00] uppercase tracking-wider">
          {product.dropLabel} &middot; {product.number}
        </p>
        <h3 className="mt-1 text-lg font-bold text-[#1a1a1a]">{product.name}</h3>
        <p className="mt-1 text-[#1a1a1a]/70">${product.price}</p>
      </div>
    </div>
  );
}
