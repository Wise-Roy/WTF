"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader, ProductCard, ProductSkeleton } from "@/components/common";
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

  const reset = useCallback(() => setLoading(true), []);

  return { products, loading, reset };
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
    router.push(`/shop${params.toString() ? `?${params}` : ""}`);
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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

export default function ShopPage() {
  return (
    <>
      <PageHeader
        tagline="The Collection"
        heading="Shop the drop"
        description="Every piece is numbered, limited, and never restocked. Once it's gone, it's gone."
      />
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
        <ShopContent />
      </Suspense>
    </>
  );
}
