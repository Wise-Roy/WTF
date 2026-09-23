"use client";

import { useEffect, useState } from "react";
import { SectionWrapper, Tagline, SectionHeading, ProductCard, ProductSkeleton, Button } from "@/components/common";
import { useReveal } from "@/hooks";
import { DbProduct } from "@/types";

function RevealCard({ index, children }: { index: number; children: React.ReactNode }) {
  const ref = useReveal<HTMLDivElement>(index * 90);
  return <div ref={ref}>{children}</div>;
}

export default function LatestDrop() {
  const headerRef = useReveal<HTMLDivElement>();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?ranked=true&limit=6")
      .then((r) => r.json())
      .then((d) => setProducts(d.data?.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SectionWrapper scheme="dark">
      <div ref={headerRef} className="text-left">
        <Tagline>The Latest Drop</Tagline>
        <SectionHeading className="mt-6">Fresh out the fumes</SectionHeading>
        <p className="mt-6 max-w-2xl text-lg text-black/70 leading-relaxed">
          Six new designs. Hand-drawn, numbered, and never restocked. Drop 01 is
          live — grab yours before they vanish into the fumes.
        </p>
        <Button href="/shop" className="mt-8">
          Shop all designs
        </Button>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.map((product, i) => (
              <RevealCard key={product.id} index={i}>
                <ProductCard product={product} />
              </RevealCard>
            ))}
        {!loading && products.length === 0 && (
          <p className="col-span-full text-center text-black/40 py-12">
            No products yet.
          </p>
        )}
      </div>
    </SectionWrapper>
  );
}
