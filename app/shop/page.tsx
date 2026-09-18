"use client";

import { useState } from "react";
import { PRODUCTS, CATEGORIES, type Category } from "@/lib/constants";
import { PageHeader, ProductCard, Button } from "@/components/common";

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered =
    activeCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <>
      <PageHeader
        tagline="The Collection"
        heading="Shop the drop"
        description="Every piece is numbered, limited, and never restocked. Once it's gone, it's gone."
      />

      <section className="bg-[#0A0A0A] px-6 md:px-12 lg:px-20 pb-24">
        <div className="mx-auto max-w-7xl">
          {/* Category filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-sm font-bold uppercase tracking-wider border transition-colors ${
                  activeCategory === cat
                    ? "bg-[#C6FF00] text-[#0A0A0A] border-[#C6FF00]"
                    : "border-white/20 text-[#F5F5F5]/70 hover:border-[#C6FF00] hover:text-[#C6FF00]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-[#F5F5F5]/50 py-20 text-lg">
              No designs in this category yet. Stay tuned.
            </p>
          )}

          {/* CTA */}
          <div className="mt-16 text-center border border-white/10 py-16 px-6">
            <h3 className="font-heading text-3xl md:text-4xl uppercase tracking-wider text-[#F5F5F5] font-bold">
              Drop 02 is coming
            </h3>
            <p className="mt-4 text-[#F5F5F5]/50 max-w-lg mx-auto">
              Join the cult to get early access to our next collection before it sells out.
            </p>
            <Button href="/#join" className="mt-8">
              Get early access
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
