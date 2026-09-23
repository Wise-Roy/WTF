"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DbProduct } from "@/types";
import { validateProduct } from "@/lib/product-validation";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

interface ProductFormProps {
  product?: DbProduct;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    prod_name: product?.prod_name || "",
    prod_price: product?.prod_price?.toString() || "",
    prod_quantity: product?.prod_quantity?.toString() || "0",
    prod_description: product?.prod_description || "",
    prod_label: product?.prod_label || "New",
    prod_rank: product?.prod_rank?.toString() || "0",
  });

  const [images, setImages] = useState<(string | null)[]>([
    product?.image?.[0] || null,
    product?.image?.[1] || null,
    product?.image?.[2] || null,
  ]);

  const [uploading, setUploading] = useState<boolean[]>([false, false, false]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleFileSelect = async (index: number, file: File) => {
    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Invalid format. Allowed: JPG, PNG, WebP, AVIF, GIF" }));
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrors((prev) => ({ ...prev, image: "File too large. Maximum size is 10 MB" }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });

    // Upload
    setUploading((prev) => prev.map((v, i) => (i === index ? true : v)));

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({ ...prev, image: data.message || "Upload failed" }));
        return;
      }

      setImages((prev) => prev.map((v, i) => (i === index ? data.data.url : v)));
    } catch {
      setErrors((prev) => ({ ...prev, image: "Upload failed. Please try again." }));
    } finally {
      setUploading((prev) => prev.map((v, i) => (i === index ? false : v)));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.map((v, i) => (i === index ? null : v)));
    if (fileRefs[index].current) fileRefs[index].current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const imageUrls = images.filter(Boolean) as string[];

    const body = {
      prod_name: form.prod_name,
      prod_price: parseFloat(form.prod_price),
      prod_quantity: parseInt(form.prod_quantity, 10),
      prod_description: form.prod_description,
      prod_label: form.prod_label,
      prod_rank: parseInt(form.prod_rank, 10),
      image: imageUrls.length === 3 ? imageUrls : [],
    };

    const { valid, errors: validationErrors } = validateProduct(body);
    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors(data.errors || { _form: data.message || "Something went wrong" });
      setSaving(false);
      return;
    }

    router.push("/admin/products");
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-white placeholder-white/30 focus:border-[#C6FF00] focus:outline-none transition-colors";
  const errorClass = "text-red-400 text-xs mt-1";

  const imageLabels = [
    "Image 1 — Primary / Default",
    "Image 2 — Vertical Reveal",
    "Image 3 — Horizontal Reveal",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {errors._form && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
          <p className="text-red-400 text-sm">{errors._form}</p>
        </div>
      )}

      <div>
        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Product Name</label>
        <input name="prod_name" value={form.prod_name} onChange={handleChange} className={inputClass} />
        {errors.prod_name && <p className={errorClass}>{errors.prod_name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Price (INR)</label>
          <input name="prod_price" type="number" step="0.01" min="0.01" value={form.prod_price} onChange={handleChange} className={inputClass} />
          {errors.prod_price && <p className={errorClass}>{errors.prod_price}</p>}
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Quantity</label>
          <input name="prod_quantity" type="number" min="0" step="1" value={form.prod_quantity} onChange={handleChange} className={inputClass} />
          {errors.prod_quantity && <p className={errorClass}>{errors.prod_quantity}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Description</label>
        <textarea name="prod_description" value={form.prod_description} onChange={handleChange} rows={4} className={inputClass} />
        {errors.prod_description && <p className={errorClass}>{errors.prod_description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Label</label>
          <input name="prod_label" value={form.prod_label} onChange={handleChange} className={inputClass} placeholder="e.g. New, Hoodie, Limited" />
          {errors.prod_label && <p className={errorClass}>{errors.prod_label}</p>}
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Rank (0 = unranked)</label>
          <input name="prod_rank" type="number" min="0" step="1" value={form.prod_rank} onChange={handleChange} className={inputClass} />
          {errors.prod_rank && <p className={errorClass}>{errors.prod_rank}</p>}
        </div>
      </div>

      {/* Image uploads */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">Product Images (3 required)</label>
          <p className="text-white/30 text-xs">Max 10 MB per image. Formats: JPG, PNG, WebP, AVIF, GIF</p>
        </div>
        {errors.image && <p className={errorClass}>{errors.image}</p>}

        {imageLabels.map((label, idx) => (
          <div key={idx} className="flex items-start gap-4">
            {/* Preview */}
            <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
              {images[idx] ? (
                <>
                  <Image src={images[idx]!} alt={label} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500 transition-colors z-10"
                    title="Remove"
                  >
                    ×
                  </button>
                </>
              ) : (
                <span className="text-white/20 text-xs text-center px-1">{idx + 1}</span>
              )}
              {uploading[idx] && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Upload area */}
            <div className="flex-1">
              <p className="text-white/50 text-xs mb-2">{label}</p>
              <label
                className={`block border border-dashed border-white/20 rounded-lg px-4 py-3 text-center cursor-pointer hover:border-[#C6FF00]/50 transition-colors ${
                  uploading[idx] ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <span className="text-white/40 text-sm">
                  {images[idx] ? "Replace image" : "Click to upload"}
                </span>
                <input
                  ref={fileRefs[idx]}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(idx, file);
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={saving || uploading.some(Boolean)}
          className="bg-[#C6FF00] text-[#1a1a1a] px-8 py-3 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="border border-white/20 text-white/60 px-8 py-3 text-sm uppercase tracking-wider rounded hover:border-white/40 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
