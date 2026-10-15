"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart } from "lucide-react";
import { DbProduct } from "@/types";
import { useBag } from "@/context/BagContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishToast, setWishToast] = useState<string | null>(null);
  const { addItem } = useBag();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        const inList = (data.items || []).some((item: { product_id: string }) => item.product_id === id);
        if (!cancelled) setWishlisted(inList);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [user, id]);

  const toggleWishlist = async () => {
    if (!user) {
      setWishToast("Sign in to add to favourites");
      setTimeout(() => { router.push("/sign-in"); }, 1500);
      return;
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        const res = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: id }),
        });
        if (res.ok) {
          setWishlisted(false);
          setWishToast("Removed from favourites");
        } else {
          const data = await res.json().catch(() => ({ error: "Failed" }));
          setWishToast(data.error || "Failed to remove");
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: id }),
        });
        if (res.ok) {
          setWishlisted(true);
          setWishToast("Added to favourites");
        } else if (res.status === 409) {
          setWishlisted(true);
          setWishToast("Already in favourites");
        } else {
          const data = await res.json().catch(() => ({ error: "Failed" }));
          setWishToast(data.error || "Failed to add");
        }
      }
    } catch (err) {
      setWishToast("Network error");
      console.error("Wishlist toggle failed:", err);
    } finally {
      setWishlistLoading(false);
      setTimeout(() => setWishToast(null), 2500);
    }
  };

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

          <div className="mt-8 flex flex-wrap items-center gap-4">
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
            <button
              type="button"
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                wishlisted
                  ? "border-[#DF2877] bg-[#FFD9E7]"
                  : "border-[#1a1a1a]/20 bg-white hover:border-[#DF2877]/50"
              } disabled:opacity-50`}
              title={wishlisted ? "Remove from favourites" : "Add to favourites"}
            >
              <Heart
                size={20}
                className={wishlisted ? "text-[#DF2877] fill-[#DF2877]" : "text-[#1a1a1a]/40"}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Wishlist toast */}
      {wishToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full border-2 border-[#DF2877]">
          {wishToast}
        </div>
      )}
    </div>
  );
}
