"use client";

import { useEffect, useState } from "react";
import { SectionWrapper, Tagline, SectionHeading, ProductCard, ProductSkeleton, Button, Carousel } from "@/components/common";
import { useReveal } from "@/hooks";
import { DbProduct } from "@/types";

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
    <SectionWrapper scheme="dark" className="!bg-transparent">
      <div ref={headerRef} className="text-left">
        <Tagline>Latest Releases</Tagline>
        <SectionHeading className="mt-6" style={{ WebkitTextStroke: "1.5px #C6FF00", color: "black" }}>Extra, Extra !</SectionHeading>
        <p className="mt-6 max-w-2xl text-lg text-black/70 leading-relaxed">
          Hot off the drawing board, get em&apos; before they vanish into the Fumes!
        </p>
        <Button href="/silhouettes" className="mt-8">
          Shop all
        </Button>
      </div>

      {loading ? (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-16 text-center text-black/40 py-12">No products yet.</p>
      ) : (
        <Carousel
          items={products}
          getKey={(p) => p.id}
          renderItem={(p) => <ProductCard product={p} />}
        />
      )}
    </SectionWrapper>
  );
}
