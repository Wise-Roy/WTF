"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductSkeleton, Tagline, SectionHeading } from "@/components/common";
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

  return (
    <Link
      href={`/product-story/${id}`}
      aria-label={prod_name}
      className="group relative rounded-xl overflow-hidden block collection-card"
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
          <h3 className="text-white text-2xl max-sm:text-lg font-extrabold uppercase tracking-wider text-center px-4 drop-shadow-lg">
            {prod_name}
          </h3>
        </div>
      </div>
    </Link>
  );
}

function CollectionsContent() {
  const { products, loading } = useFetchProducts("All");

  return (
    <section className="bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pb-24">
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
