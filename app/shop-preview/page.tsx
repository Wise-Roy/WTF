import { ProductCard } from "@/components/common";
import { Product } from "@/types";

const PREVIEW_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Acid Rain",
    dropLabel: "Drop 01",
    number: "#01",
    price: 59,
    image: "/eg.jpg",
    category: "Tees",
  },
  {
    id: "p2",
    name: "Static",
    dropLabel: "Drop 01",
    number: "#02",
    price: 89,
    image: "/eg.jpg",
    category: "Hoodies",
  },
  {
    id: "p3",
    name: "Gutter Glory Deluxe Edition Remastered",
    dropLabel: "Drop 01",
    number: "#03",
    price: 129,
    image: "/eg.jpg",
    category: "Hoodies",
  },
  {
    id: "p4",
    name: "Fever Dream",
    dropLabel: "Drop 01",
    number: "#04",
    price: 1299,
    image: "/eg.jpg",
    category: "Accessories",
  },
  {
    id: "p5",
    name: "Low Battery",
    dropLabel: "Drop 01",
    number: "#05",
    price: 149,
    salePrice: 99,
    image: "/eg.jpg",
    category: "Tees",
  },
  {
    id: "p6",
    name: "Rat King",
    dropLabel: "Drop 01",
    number: "#06",
    price: 68,
    isSoldOut: true,
    image: "/eg.jpg",
    category: "Hoodies",
  },
];

export default function ShopPreviewPage() {
  return (
    <section className="bg-[#FBF6D9] min-h-screen px-6 md:px-12 lg:px-20 py-16">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-heading text-4xl md:text-5xl uppercase tracking-wider text-[#1a1a1a] font-bold mb-4">
          Product Card Preview
        </h1>
        <p className="text-[#1a1a1a]/50 mb-12 max-w-xl">
          All edge-case variants: normal prices, long name, long price, sale, and sold out.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREVIEW_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
