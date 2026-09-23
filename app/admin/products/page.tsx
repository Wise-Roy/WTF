"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DbProduct } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.data?.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast(`"${name}" deleted successfully`);
      fetchProducts();
    } else {
      showToast("Failed to delete product");
    }
  };

  const handleRankChange = async (id: string, newRank: number) => {
    if (newRank < 0) return;
    await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prod_rank: newRank }),
    });
    fetchProducts();
  };

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-[#C6FF00] text-[#1a1a1a] px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition"
        >
          + New Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg mb-4">No products yet</p>
          <Link
            href="/admin/products/new"
            className="text-[#C6FF00] hover:underline text-sm uppercase tracking-wider"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/50 uppercase tracking-wider text-xs">
                <th className="py-3 pr-4">Image</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Label</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Qty</th>
                <th className="py-3 pr-4">Rank</th>
                <th className="py-3 pr-4">Created</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 pr-4">
                    <div className="relative w-12 h-15 rounded overflow-hidden bg-white/10">
                      {p.image?.[0] && (
                        <Image src={p.image[0]} alt={p.prod_name} fill className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-medium max-w-[200px] truncate">{p.prod_name}</td>
                  <td className="py-3 pr-4">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{p.prod_label}</span>
                  </td>
                  <td className="py-3 pr-4 font-mono">₹{p.prod_price}</td>
                  <td className="py-3 pr-4">
                    {p.prod_quantity === 0 ? (
                      <span className="text-red-400">0</span>
                    ) : (
                      p.prod_quantity
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRankChange(p.id, (p.prod_rank || 0) - 1)}
                        disabled={p.prod_rank <= 0}
                        className="text-white/30 hover:text-[#C6FF00] disabled:opacity-20 disabled:cursor-not-allowed text-xs px-1"
                        title="Rank up"
                      >
                        ▲
                      </button>
                      {p.prod_rank > 0 ? (
                        <span className="text-[#C6FF00] font-bold min-w-[2ch] text-center">
                          {p.prod_rank}
                        </span>
                      ) : (
                        <span className="text-white/30 min-w-[2ch] text-center">—</span>
                      )}
                      <button
                        onClick={() => handleRankChange(p.id, (p.prod_rank || 0) + 1)}
                        className="text-white/30 hover:text-[#C6FF00] text-xs px-1"
                        title="Rank down"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white/40 text-xs">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-[#C6FF00] hover:underline text-xs uppercase tracking-wider"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.prod_name)}
                        className="text-red-400 hover:underline text-xs uppercase tracking-wider"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
