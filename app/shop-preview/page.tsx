import { ProductCard } from "@/components/common";
import { DbProduct } from "@/types";

const PREVIEW_PRODUCTS: DbProduct[] = [
  {
    id: "p1",
    prod_name: "Acid Rain",
    prod_price: 59,
    prod_quantity: 10,
    prod_description: "Preview product",
    prod_label: "Tees",
    prod_rank: 0,
    image: ["/eg.jpg", "/eg.jpg", "/eg.jpg"],
    created_at: "",
    updated_at: "",
  },
  {
    id: "p2",
    prod_name: "Static",
    prod_price: 89,
    prod_quantity: 5,
    prod_description: "Preview product",
    prod_label: "Hoodies",
    prod_rank: 0,
    image: ["/eg.jpg", "/eg.jpg", "/eg.jpg"],
    created_at: "",
    updated_at: "",
  },
  {
    id: "p3",
    prod_name: "Gutter Glory Deluxe Edition Remastered",
    prod_price: 129,
    prod_quantity: 3,
    prod_description: "Preview product",
    prod_label: "Hoodies",
    prod_rank: 0,
    image: ["/eg.jpg", "/eg.jpg", "/eg.jpg"],
    created_at: "",
    updated_at: "",
  },
  {
    id: "p4",
    prod_name: "Fever Dream",
    prod_price: 1299,
    prod_quantity: 1,
    prod_description: "Preview product",
    prod_label: "Accessories",
    prod_rank: 0,
    image: ["/eg.jpg", "/eg.jpg", "/eg.jpg"],
    created_at: "",
    updated_at: "",
  },
  {
    id: "p5",
    prod_name: "Low Battery",
    prod_price: 99,
    prod_quantity: 8,
    prod_description: "Preview product",
    prod_label: "Tees",
    prod_rank: 0,
    image: ["/eg.jpg", "/eg.jpg", "/eg.jpg"],
    created_at: "",
    updated_at: "",
  },
  {
    id: "p6",
    prod_name: "Rat King",
    prod_price: 68,
    prod_quantity: 0,
    prod_description: "Preview product",
    prod_label: "Hoodies",
    prod_rank: 0,
    image: ["/eg.jpg", "/eg.jpg", "/eg.jpg"],
    created_at: "",
    updated_at: "",
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
          All edge-case variants: normal prices, long name, long price, and sold out.
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
