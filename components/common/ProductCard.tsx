import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group border border-white/10 overflow-hidden">
      <div className="aspect-[3/4] bg-[#111111] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-6xl font-heading">
          {product.number}
        </div>
      </div>
      <div className="p-4 bg-[#0A0A0A]">
        <p className="text-sm text-[#C6FF00] uppercase tracking-wider">
          {product.dropLabel} · {product.number}
        </p>
        <h3 className="mt-1 text-lg font-bold text-[#F5F5F5]">{product.name}</h3>
        <p className="mt-1 text-[#F5F5F5]/70">${product.price}</p>
      </div>
    </div>
  );
}
