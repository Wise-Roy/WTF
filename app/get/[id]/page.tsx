"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { DbProduct } from "@/types";
import { useBag } from "@/context/BagContext";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useBag();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.data?.product || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9D6] flex items-center justify-center pt-20">
        <div className="h-8 w-8 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF9D6] flex items-center justify-center pt-20">
        <p className="text-[#1a1a1a]/50 text-lg">Product not found.</p>
      </div>
    );
  }

  const isSoldOut = product.prod_quantity <= 0;
  const images = product.image || [];

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addItem({
      id: product.id,
      name: product.prod_name,
      price: product.prod_price,
      image: images[0] || "/eg.jpg",
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF9D6] pt-24 pb-20 px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-white">
            <Image
              src={images[activeImage] || "/eg.jpg"}
              alt={product.prod_name}
              fill
              className={`object-cover object-center ${isSoldOut ? "grayscale" : ""}`}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === i ? "border-[#C6FF00]" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt={`${product.prod_name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <span className="inline-block bg-[#C6FF00] text-[#1a1a1a] px-3 py-1 text-xs font-bold uppercase tracking-widest w-fit">
            {product.prod_label}
          </span>

          <h1 className="mt-4 font-heading text-4xl md:text-5xl font-bold text-[#1a1a1a] uppercase leading-[1.05]">
            {product.prod_name}
          </h1>

          <p className="mt-4 text-3xl font-extrabold font-mono text-[#1a1a1a]">
            ₹{product.prod_price.toLocaleString()}
          </p>

          <p className="mt-6 text-[#1a1a1a]/70 leading-relaxed text-lg">
            {product.prod_description}
          </p>

          <div className="mt-4 text-sm text-[#1a1a1a]/50">
            {isSoldOut ? (
              <span className="text-red-600 font-bold uppercase">Sold Out</span>
            ) : (
              <span>{product.prod_quantity} in stock</span>
            )}
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className={`px-10 py-4 text-sm font-bold uppercase tracking-wider rounded-full transition-colors ${
                isSoldOut
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              {isSoldOut ? "Sold Out" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
