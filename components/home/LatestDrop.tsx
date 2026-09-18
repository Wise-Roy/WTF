import { PRODUCTS } from "@/lib/constants";
import { SectionWrapper, Tagline, SectionHeading, ProductCard, Button } from "@/components/common";

export default function LatestDrop() {
  return (
    <SectionWrapper scheme="dark">
      <div className="text-center">
        <Tagline>The Latest Drop</Tagline>
        <SectionHeading className="mt-6">Fresh out the fumes</SectionHeading>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button href="/shop">Shop all designs</Button>
      </div>
    </SectionWrapper>
  );
}
