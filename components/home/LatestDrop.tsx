import { PRODUCTS } from "@/lib/constants";
import { SectionWrapper, Tagline, SectionHeading, ProductCard, Button } from "@/components/common";

export default function LatestDrop() {
  return (
    <SectionWrapper scheme="dark">
      {/* Content block — left-aligned, single column */}
      <div className="text-left">
        <Tagline>The Latest Drop</Tagline>
        <SectionHeading className="mt-6">Fresh out the fumes</SectionHeading>
        <p className="mt-6 max-w-2xl text-lg text-[#F5F5F5]/70 leading-relaxed">
          Six new designs. Hand-drawn, numbered, and never restocked. Drop 01 is
          live — grab yours before they vanish into the fumes.
        </p>
        <Button href="/shop" className="mt-8">
          Shop all designs
        </Button>
      </div>

      {/* Gallery — 3-column grid, 6 cards, 2 rows */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </SectionWrapper>
  );
}
