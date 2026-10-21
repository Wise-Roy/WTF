"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProductSkeleton } from "@/components/common";
import CollectionHero from "@/components/collections/CollectionHero";
import { DbProduct } from "@/types";

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
  const { id, image, prod_name, prod_quantity } = product;
  const isSoldOut = prod_quantity <= 0;
  const img = image?.[0] || "/eg.jpg";
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start 0.5"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.4, 1]);

  return (
    <motion.div ref={cardRef} style={{ scale, opacity }} className="will-change-transform">
      <Link
        href={`/product-story/${id}`}
        aria-label={prod_name}
        className="group relative overflow-hidden block collection-card"
      >
        <div className="relative aspect-[4/5] overflow-hidden select-none">
          <Image
            src={img}
            alt={prod_name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-center transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? "grayscale" : ""}`}
          />

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <span className="text-white text-xl font-extrabold uppercase tracking-wider">Sold Out</span>
            </div>
          )}

          {/* Hover overlay with product name */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-[#C6FF00] text-2xl max-sm:text-lg font-extrabold uppercase tracking-wider text-center px-4 drop-shadow-lg">
              {prod_name}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CollectionsContent() {
  const { products, loading } = useFetchProducts("All");

  return (
    <section className="relative z-20 bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pt-16 pb-24">
      <div className="mx-auto max-w-7xl">
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
      <CollectionHero />
      <Suspense
        fallback={
          <section className="relative z-20 bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pt-16 pb-24">
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
