"use client";

import { PRODUCTS } from "@/lib/constants";
import { SectionWrapper, Tagline, SectionHeading, ProductCard, Button } from "@/components/common";
import { useReveal } from "@/hooks";

function RevealCard({ index, children }: { index: number; children: React.ReactNode }) {
  const ref = useReveal<HTMLDivElement>(index * 90);
  return <div ref={ref}>{children}</div>;
}

export default function LatestDrop() {
  const headerRef = useReveal<HTMLDivElement>();

  return (
    <SectionWrapper scheme="dark">
      {/* Content block — reveals on scroll */}
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

      {/* Gallery — staggered reveal, 3-column grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map((product, i) => (
          <RevealCard key={product.id} index={i}>
            <ProductCard product={product} />
          </RevealCard>
        ))}
      </div>
    </SectionWrapper>
  );
}
