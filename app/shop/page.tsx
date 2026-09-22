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

      <section className="bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pb-24">
        <div className="mx-auto max-w-7xl">
          {/* Category filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-sm font-bold uppercase tracking-wider border transition-colors ${
                  activeCategory === cat
                    ? "bg-[#C6FF00] text-[#1a1a1a] border-[#C6FF00]"
                    : "border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#C6FF00] hover:text-[#88AF00]"
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
            <p className="text-center text-[#1a1a1a]/50 py-20 text-lg">
              No designs in this category yet. Stay tuned.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
