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
    <div className="group border border-white/10 overflow-hidden">
      {/* Parallax frame */}
      <div
        data-parallax-frame
        className="aspect-[3/4] bg-[#111111] relative overflow-hidden"
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
      <div className="p-4 bg-[#0A0A0A]">
        <p className="text-sm text-[#C6FF00] uppercase tracking-wider">
          {product.dropLabel} &middot; {product.number}
        </p>
        <h3 className="mt-1 text-lg font-bold text-[#F5F5F5]">{product.name}</h3>
        <p className="mt-1 text-[#F5F5F5]/70">${product.price}</p>
      </div>
    </div>
  );
}
