"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { DbProduct } from "@/types";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.data?.product || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-white/40 text-center py-20">Product not found.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Edit: {product.prod_name}</h1>
      <ProductForm product={product} />
    </div>
  );
}
