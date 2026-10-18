"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, FileText, Users, Globe, Music, ImageIcon, Tag, Palette, Star } from "lucide-react";
import { DbProduct, DbMusician } from "@/types";
import { uploadFile } from "@/lib/upload-client";

type Tab = "products" | "about" | "musicians" | "users" | "footer" | "designer-hero" | "offers" | "design-images" | "main-character";

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: "products", label: "Products", icon: Package },
  { key: "about", label: "About Us", icon: FileText },
  { key: "designer-hero", label: "Hero Section", icon: ImageIcon },
  { key: "musicians", label: "Musicians", icon: Music },
  { key: "users", label: "Users", icon: Users },
  { key: "footer", label: "Footer", icon: Globe },
  { key: "offers", label: "Offers", icon: Tag },
  { key: "design-images", label: "Design Page", icon: Palette },
  { key: "main-character", label: "Main Character", icon: Star },
];

/* ─────────────── PRODUCTS TAB ─────────────── */
function ProductsPanel() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const fetchProducts = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setProducts(d.data?.products || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast(`"${name}" deleted`);
      fetchProducts();
    } else {
      showToast("Delete failed");
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
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Products</h2>
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

/* ─────────────── ABOUT US TAB ─────────────── */
interface AboutSection {
  id: string;
  position: number;
  tagline: string;
  heading: string;
  body: string;
  images: string[];
}

const EMPTY_FORM = { tagline: "Our Story", heading: "", body: "", images: [] as string[] };

function AboutPanel() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const fetchSections = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/about")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setSections(d.data?.sections || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (section: AboutSection) => {
    setEditing(section.position);
    setForm({
      tagline: section.tagline,
      heading: section.heading,
      body: section.body,
      images: [...section.images],
    });
  };

  const handleNew = (position: number) => {
    setEditing(position);
    setForm({ ...EMPTY_FORM, images: [] });
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, images: [] });
  };

  const handleImageUpload = async (slotIdx: number, file: File) => {
    setUploadingIdx(slotIdx);
    try {
      const publicUrl = await uploadFile(file, "about");
      setForm((prev) => {
        const imgs = [...prev.images];
        imgs[slotIdx] = publicUrl;
        return { ...prev, images: imgs };
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleRemoveImage = (slotIdx: number) => {
    setForm((prev) => {
      const imgs = prev.images.filter((_, i) => i !== slotIdx);
      return { ...prev, images: imgs };
    });
  };

  const handleSave = async () => {
    if (!form.heading || !form.body || form.images.length === 0) {
      showToast("Fill all fields and upload at least 1 image");
      return;
    }
    setSaving(true);

    const existing = sections.find((s) => s.position === editing);

    try {
      if (existing) {
        await fetch(`/api/admin/about/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tagline: form.tagline,
            heading: form.heading,
            body: form.body,
            images: form.images,
          }),
        });
      } else {
        await fetch("/api/admin/about", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tagline: form.tagline,
            heading: form.heading,
            body: form.body,
            images: form.images,
            position: editing,
          }),
        });
      }

      showToast("Section saved");
      setEditing(null);
      setForm({ ...EMPTY_FORM, images: [] });
      fetchSections();
    } catch {
      showToast("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section: AboutSection) => {
    if (!confirm(`Delete section ${section.position}: "${section.heading}"?`)) return;
    await fetch(`/api/admin/about/${section.id}`, { method: "DELETE" });
    showToast("Section deleted");
    fetchSections();
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-white placeholder-white/30 focus:border-[#C6FF00] focus:outline-none transition-colors";

  const positionLabels: Record<number, string> = {
    1: "Section 1 — Image Right",
    2: "Section 2 — Image Left",
    3: "Section 3 — Image Right",
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <h2 className="text-xl font-bold mb-2">About Us Sections</h2>
      <p className="text-white/40 text-sm mb-6">
        Manage up to 3 about sections. Up to 5 images per section (loop on frontend). Images alternate: right, left, right.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {[1, 2, 3].map((pos) => {
            const section = sections.find((s) => s.position === pos);
            const isEditing = editing === pos;

            if (isEditing) {
              return (
                <div key={pos} className="border border-[#C6FF00]/30 rounded-lg p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[#C6FF00] uppercase tracking-wider">
                    {positionLabels[pos]}
                  </h3>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Tagline</label>
                    <input
                      value={form.tagline}
                      onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g. Our Story"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Heading</label>
                    <input
                      value={form.heading}
                      onChange={(e) => setForm((p) => ({ ...p, heading: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g. Born in the back of a garage"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Body</label>
                    <textarea
                      value={form.body}
                      onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                      rows={5}
                      className={inputClass}
                    />
                  </div>

                  {/* 5 image slots */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                      Images ({form.images.length}/5) — displayed on loop
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const imgUrl = form.images[idx];
                        const isUploading = uploadingIdx === idx;
                        return (
                          <div key={idx} className="relative aspect-[3/4] rounded overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                            {imgUrl ? (
                              <>
                                <Image src={imgUrl} alt={`Image ${idx + 1}`} fill className="object-cover" />
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
                              <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                                <span className="text-white/20 text-xs">{idx + 1}</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(idx, file);
                                  }}
                                />
                              </label>
                            )}
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                <div className="h-5 w-5 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#C6FF00] text-[#1a1a1a] px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Section"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="border border-white/20 text-white/60 px-6 py-2.5 text-sm uppercase tracking-wider rounded hover:border-white/40 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            if (section) {
              return (
                <div key={pos} className="border border-white/10 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex gap-1 shrink-0">
                        {(section.images || []).slice(0, 3).map((img, i) => (
                          <div key={i} className="relative w-10 h-14 rounded overflow-hidden bg-white/5">
                            <Image src={img} alt={`${section.heading} ${i + 1}`} fill className="object-cover" />
                          </div>
                        ))}
                        {section.images?.length > 3 && (
                          <div className="w-10 h-14 rounded bg-white/5 flex items-center justify-center text-white/30 text-xs">
                            +{section.images.length - 3}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                          {positionLabels[pos]} — {section.images?.length || 0} images
                        </p>
                        <h3 className="font-bold mt-1">{section.heading}</h3>
                        <p className="text-white/50 text-sm mt-1 line-clamp-2">{section.body}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-[#C6FF00] hover:underline text-xs uppercase tracking-wider"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(section)}
                        className="text-red-400 hover:underline text-xs uppercase tracking-wider"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={pos} className="border border-dashed border-white/10 rounded-lg p-6 text-center">
                <p className="text-white/30 text-sm mb-3">{positionLabels[pos]} — Empty</p>
                <button
                  onClick={() => handleNew(pos)}
                  className="text-[#C6FF00] hover:underline text-xs uppercase tracking-wider"
                >
                  + Add Section
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────── MUSICIANS TAB ─────────────── */
function MusiciansPanel() {
  const [musicians, setMusicians] = useState<DbMusician[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [editing, setEditing] = useState<DbMusician | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", photo: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const fetchMusicians = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/musicians")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setMusicians(d.data?.musicians || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/admin/musicians/${id}`, { method: "DELETE" });
    if (res.ok) { showToast(`"${name}" deleted`); fetchMusicians(); }
    else showToast("Delete failed");
  };

  const handleEdit = (m: DbMusician) => {
    setEditing(m);
    setCreating(false);
    setForm({ name: m.name, photo: m.photo });
  };

  const handleNew = () => {
    setCreating(true);
    setEditing(null);
    setForm({ name: "", photo: "" });
  };

  const handleCancel = () => {
    setEditing(null);
    setCreating(false);
    setForm({ name: "", photo: "" });
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const publicUrl = await uploadFile(file, "musicians");
      setForm((p) => ({ ...p, photo: publicUrl }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Name is required"); return; }
    if (!form.photo) { showToast("Photo is required"); return; }
    setSaving(true);

    try {
      if (editing) {
        await fetch(`/api/admin/musicians/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        showToast("Musician updated");
      } else {
        await fetch("/api/admin/musicians", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        showToast("Musician added");
      }
      handleCancel();
      fetchMusicians();
    } catch {
      showToast("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-white placeholder-white/30 focus:border-[#C6FF00] focus:outline-none transition-colors";

  const isFormOpen = editing || creating;

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Musicians</h2>
        {!isFormOpen && (
          <button
            onClick={handleNew}
            className="bg-[#C6FF00] text-[#1a1a1a] px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition"
          >
            + Add Musician
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="border border-[#C6FF00]/30 rounded-lg p-6 space-y-4 mb-8">
          <h3 className="text-sm font-bold text-[#C6FF00] uppercase tracking-wider">
            {editing ? "Edit Musician" : "New Musician"}
          </h3>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Travis Scott"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Photo</label>
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
                {form.photo ? (
                  <Image src={form.photo} alt="Preview" fill className="object-cover" />
                ) : (
                  <span className="text-white/20 text-xs">No photo</span>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <div className="h-5 w-5 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-white/5 border border-white/10 rounded px-4 py-2.5 text-sm text-white/60 hover:border-[#C6FF00]/50 transition-colors">
                Upload Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#C6FF00] text-[#1a1a1a] px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update" : "Add Musician"}
            </button>
            <button
              onClick={handleCancel}
              className="border border-white/20 text-white/60 px-6 py-2.5 text-sm uppercase tracking-wider rounded hover:border-white/40 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : musicians.length === 0 && !isFormOpen ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg mb-4">No musicians yet</p>
          <button
            onClick={handleNew}
            className="text-[#C6FF00] hover:underline text-sm uppercase tracking-wider"
          >
            Add your first musician
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {musicians.map((m) => (
            <div key={m.id} className="border border-white/10 rounded-lg overflow-hidden group hover:border-white/20 transition-colors">
              <div className="relative aspect-square bg-white/5">
                {m.photo && (
                  <Image src={m.photo} alt={m.name} fill className="object-cover" />
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <p className="font-medium text-sm truncate">{m.name}</p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(m)}
                    className="text-[#C6FF00] hover:underline text-xs uppercase tracking-wider"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="text-red-400 hover:underline text-xs uppercase tracking-wider"
                  >
                    Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── USERS TAB ─────────────── */
interface UserProfile {
  user_id: string;
  name: string;
  phone: string;
  city: string;
  country: string;
}

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  is_restricted: boolean;
  profile: UserProfile | null;
}

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ userId: string; name: string; action: "restrict" | "restore" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/admin/users", { signal: ac.signal });
        const d = await r.json();
        if (!ac.signal.aborted) {
          setUsers(d.data?.users || []);
          setLoading(false);
        }
      } catch {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [refreshKey]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRestriction = async () => {
    if (!confirmDialog) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${confirmDialog.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_restricted: confirmDialog.action === "restrict" }),
      });

      if (res.ok) {
        showToast(`User ${confirmDialog.action === "restrict" ? "restricted" : "restored"} successfully`);
        setRefreshKey((k) => k + 1);
      } else {
        showToast("Action failed");
      }
    } catch {
      showToast("Action failed");
    } finally {
      setActionLoading(false);
      setConfirmDialog(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.profile?.name || "").toLowerCase().includes(q) ||
      (u.profile?.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1a1a1a] border border-white/20 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">
              {confirmDialog.action === "restrict" ? "Restrict User" : "Restore User"}
            </h3>
            <p className="text-white/60 text-sm mb-6">
              {confirmDialog.action === "restrict"
                ? `Are you sure you want to restrict "${confirmDialog.name}"? They will be unable to sign in or access protected features.`
                : `Are you sure you want to restore access for "${confirmDialog.name}"?`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                disabled={actionLoading}
                className="px-5 py-2.5 text-sm uppercase tracking-wider border border-white/20 text-white/60 rounded hover:border-white/40 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRestriction}
                disabled={actionLoading}
                className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded transition disabled:opacity-50 ${
                  confirmDialog.action === "restrict"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-[#C6FF00] text-[#1a1a1a] hover:brightness-90"
                }`}
              >
                {actionLoading ? "Processing..." : confirmDialog.action === "restrict" ? "Restrict" : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-bold">Users</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="flex-1 sm:w-64 bg-white/5 border border-white/10 rounded px-4 py-2 text-sm text-white placeholder-white/30 focus:border-[#C6FF00] focus:outline-none transition-colors"
          />
          <span className="text-white/40 text-sm shrink-0">
            {!loading && `${filtered.length} of ${users.length}`}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">
            {search ? "No users match your search" : "No users registered yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/50 uppercase tracking-wider text-xs">
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Joined</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <>
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 pr-4 font-medium">{u.email}</td>
                    <td className="py-3 pr-4 text-white/60">
                      {u.profile?.name || <span className="text-white/20">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-white/60 font-mono text-xs">
                      {u.profile?.phone || <span className="text-white/20">—</span>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                        u.is_restricted
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}>
                        {u.is_restricted ? "Restricted" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white/40 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                          className="text-[#C6FF00] hover:underline text-xs uppercase tracking-wider"
                        >
                          {expandedUser === u.id ? "Hide" : "Details"}
                        </button>
                        {u.is_restricted ? (
                          <button
                            onClick={() => setConfirmDialog({ userId: u.id, name: u.profile?.name || u.email, action: "restore" })}
                            className="text-green-400 hover:underline text-xs uppercase tracking-wider"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDialog({ userId: u.id, name: u.profile?.name || u.email, action: "restrict" })}
                            className="text-red-400 hover:underline text-xs uppercase tracking-wider"
                          >
                            Restrict
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedUser === u.id && (
                    <tr key={`${u.id}-detail`} className="border-b border-white/5 bg-white/[0.02]">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-white/40 uppercase tracking-wider block mb-1">City</span>
                            <span className="text-white/70">{u.profile?.city || "—"}</span>
                          </div>
                          <div>
                            <span className="text-white/40 uppercase tracking-wider block mb-1">Country</span>
                            <span className="text-white/70">{u.profile?.country || "—"}</span>
                          </div>
                          <div>
                            <span className="text-white/40 uppercase tracking-wider block mb-1">User ID</span>
                            <span className="text-white/40 font-mono text-[10px] break-all">{u.id}</span>
                          </div>
                          <div>
                            <span className="text-white/40 uppercase tracking-wider block mb-1">Account</span>
                            <span className={u.is_restricted ? "text-red-400" : "text-green-400"}>
                              {u.is_restricted ? "Restricted" : "Active"}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────── FOOTER TAB ─────────────── */
function FooterPanel() {
  const [links, setLinks] = useState({ instagram: "", twitter: "", spotify: "", facebook: "", google_review: "", privacy_policy_pdf: "", newsletter_pdf: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/admin/footer", { signal: ac.signal });
        const d = await r.json();
        if (!ac.signal.aborted) {
          if (d.data?.footer) setLinks(d.data.footer);
          setLoading(false);
        }
      } catch {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(links),
      });
      if (res.ok) showToast("Footer links saved");
      else showToast("Save failed");
    } catch {
      showToast("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "instagram" as const, label: "Instagram", placeholder: "https://instagram.com/yourpage" },
    { key: "twitter" as const, label: "Twitter / X", placeholder: "https://x.com/yourhandle" },
    { key: "spotify" as const, label: "Spotify", placeholder: "https://open.spotify.com/artist/..." },
    { key: "facebook" as const, label: "Facebook", placeholder: "https://facebook.com/yourpage" },
    { key: "google_review" as const, label: "Google Reviews", placeholder: "https://g.page/r/your-review-link" },
    { key: "privacy_policy_pdf" as const, label: "Privacy Policy PDF", placeholder: "https://example.com/privacy-policy.pdf" },
    { key: "newsletter_pdf" as const, label: "Newsletter PDF", placeholder: "https://example.com/newsletter.pdf" },
  ];

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Footer Social Links</h2>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#C6FF00] text-[#1a1a1a] px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6 max-w-lg">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-white/60 mb-2">{f.label}</label>
              <input
                type="url"
                value={links[f.key]}
                onChange={(e) => setLinks((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C6FF00]/50 transition-colors"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── DESIGNER HERO TAB ─────────────── */
function DesignerHeroPanel() {
  const [images, setImages] = useState<string[]>(["", "", ""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/admin/designer-hero", { signal: ac.signal });
        const d = await r.json();
        if (!ac.signal.aborted && d.data?.images) {
          setImages(d.data.images);
          setLoading(false);
        }
      } catch {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    try {
      const publicUrl = await uploadFile(file, "designer");
      setImages((prev) => {
        const next = [...prev];
        next[idx] = publicUrl;
        return next;
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleRemove = (idx: number) => {
    setImages((prev) => {
      const next = [...prev];
      next[idx] = "";
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/designer-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      if (res.ok) showToast("Hero images saved");
      else showToast("Save failed");
    } catch {
      showToast("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const labels = ["Photograph 1 — Left", "Photograph 2 — Center Right", "Photograph 3 — Bottom Right"];

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Hero Section Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#C6FF00] text-[#1a1a1a] px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <p className="text-white/40 text-sm mb-8">
        Manage the 3 photographs displayed in the Designer page scroll animation hero.
      </p>

      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {images.map((url, idx) => {
            const isUploading = uploadingIdx === idx;
            return (
              <div key={idx} className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-white/50">{labels[idx]}</p>
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  {url ? (
                    <>
                      <Image src={url} alt={labels[idx]} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500 transition-colors z-10"
                        title="Remove"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors gap-2">
                      <span className="text-white/20 text-3xl">+</span>
                      <span className="text-white/30 text-xs">Upload</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(idx, file);
                        }}
                      />
                    </label>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <div className="h-6 w-6 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────── OFFERS TAB ─────────────── */
function OffersPanel() {
  const [form, setForm] = useState({
    is_enabled: false,
    header: "",
    description: "",
    product_id: "",
    original_price: 0,
    discounted_price: "",
    image_path: "",
    end_time: "",
  });
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const [offerRes, prodRes] = await Promise.all([
          fetch("/api/admin/offer", { signal: ac.signal }),
          fetch("/api/admin/products", { signal: ac.signal }),
        ]);
        const offerData = await offerRes.json();
        const prodData = await prodRes.json();
        if (!ac.signal.aborted) {
          setProducts(prodData.data?.products || []);
          if (offerData.data?.offer) {
            const o = offerData.data.offer;
            setForm({
              is_enabled: o.is_enabled || false,
              header: o.header || "",
              description: o.description || "",
              product_id: o.product_id || "",
              original_price: o.original_price || 0,
              discounted_price: o.discounted_price ? String(o.discounted_price) : "",
              image_path: o.image_path || "",
              end_time: o.end_time || "",
            });
          }
          setLoading(false);
        }
      } catch {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const selectedProduct = products.find((p) => p.id === form.product_id);

  const handleProductChange = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setForm((p) => ({
      ...p,
      product_id: productId,
      original_price: prod ? prod.prod_price : 0,
    }));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const publicUrl = await uploadFile(file, "offers");
      setForm((p) => ({ ...p, image_path: publicUrl }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/offer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          original_price: form.original_price,
          discounted_price: Number(form.discounted_price) || 0,
        }),
      });
      const d = await res.json();
      if (res.ok) showToast("Offer saved");
      else showToast(d.message || "Save failed");
    } catch {
      showToast("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-white placeholder-white/30 focus:border-[#C6FF00] focus:outline-none transition-colors";

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Offer Card</h2>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#C6FF00] text-[#1a1a1a] px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6 max-w-lg">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-white/60">Offer Status</label>
              <p className="text-xs text-white/30 mt-1">
                {form.is_enabled ? "Modal will appear on home page — product price will update to discounted price" : "Modal is hidden — product shows original price"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, is_enabled: !p.is_enabled }))}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                form.is_enabled ? "bg-[#C6FF00]" : "bg-white/20"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.is_enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Product {form.is_enabled && <span className="text-red-400">*</span>}
            </label>
            <select
              value={form.product_id}
              onChange={(e) => handleProductChange(e.target.value)}
              className={inputClass}
            >
              <option value="" className="bg-[#1a1a1a]">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1a1a1a]">
                  {p.prod_name} — ₹{p.prod_price}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-xs text-white/30 mt-1">
                Original price: ₹{selectedProduct.prod_price.toLocaleString("en-IN")}
              </p>
            )}
          </div>

          {/* Header */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Offer Header {form.is_enabled && <span className="text-red-400">*</span>}
            </label>
            <input
              value={form.header}
              onChange={(e) => setForm((p) => ({ ...p, header: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Summer Sale — 40% Off"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Offer Description {form.is_enabled && <span className="text-red-400">*</span>}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className={inputClass}
              placeholder="Describe the promotional offer..."
            />
          </div>

          {/* Discounted Price */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Discounted Price (₹) {form.is_enabled && <span className="text-red-400">*</span>}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.discounted_price}
              onChange={(e) => setForm((p) => ({ ...p, discounted_price: e.target.value }))}
              className={inputClass}
              placeholder="1999"
            />
            {selectedProduct && form.discounted_price && Number(form.discounted_price) < selectedProduct.prod_price && (
              <p className="text-xs text-[#C6FF00] mt-1">
                {Math.round((1 - Number(form.discounted_price) / selectedProduct.prod_price) * 100)}% off
              </p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Offer End Time {form.is_enabled && <span className="text-red-400">*</span>}
            </label>
            <input
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
              className={inputClass}
            />
            {form.end_time && (
              <p className="text-xs text-white/30 mt-1">
                Countdown will show until {new Date(form.end_time).toLocaleString()}
              </p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Offer Image {form.is_enabled && <span className="text-red-400">*</span>}
            </label>
            <div className="flex items-start gap-4">
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
                {form.image_path ? (
                  <>
                    <Image src={form.image_path} alt="Offer preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, image_path: "" }))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500 transition-colors z-10"
                      title="Remove"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="text-white/20 text-xs">No image</span>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <div className="h-5 w-5 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-white/5 border border-white/10 rounded px-4 py-2.5 text-sm text-white/60 hover:border-[#C6FF00]/50 transition-colors">
                Upload Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── DESIGN PAGE IMAGES TAB ─────────────── */
function DesignImagesPanel() {
  const [images, setImages] = useState<string[]>(["", "", "", "", "", ""]);
  const [savedImages, setSavedImages] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/admin/design-images", { signal: ac.signal });
        const d = await r.json();
        if (!ac.signal.aborted && d.data?.images) {
          setImages(d.data.images);
          setSavedImages(d.data.images);
          setLoading(false);
        }
      } catch {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    try {
      const publicUrl = await uploadFile(file, "designs");
      setImages((prev) => {
        const next = [...prev];
        next[idx] = publicUrl;
        return next;
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleRemove = (idx: number) => {
    setImages((prev) => {
      const next = [...prev];
      next[idx] = "";
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/design-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, previousImages: savedImages }),
      });
      if (res.ok) {
        setSavedImages([...images]);
        showToast("Design images saved");
      } else {
        const d = await res.json();
        showToast(d.message || "Save failed");
      }
    } catch {
      showToast("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Design Page Images</h2>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#C6FF00] text-[#1a1a1a] px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <p className="text-white/40 text-sm mb-8">
        Upload exactly 6 images for the Design page hero scroll. Old images are automatically cleaned up from storage on save.
      </p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((url, idx) => {
            const isUploading = uploadingIdx === idx;
            return (
              <div key={idx} className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-white/50">Image {idx + 1}</p>
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  {url ? (
                    <>
                      <Image src={url} alt={`Design ${idx + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500 transition-colors z-10"
                        title="Remove"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors gap-2">
                      <span className="text-white/20 text-3xl">+</span>
                      <span className="text-white/30 text-xs">Upload</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(idx, file);
                        }}
                      />
                    </label>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <div className="h-6 w-6 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────── MAIN CHARACTER TAB ─────────────── */
function MainCharacterPanel() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [form, setForm] = useState({
    product_id: "",
    custom_title: "",
    custom_description: "",
    selected_image: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const [flagshipRes, prodRes] = await Promise.all([
          fetch("/api/admin/flagship", { signal: ac.signal }),
          fetch("/api/admin/products", { signal: ac.signal }),
        ]);
        const flagshipData = await flagshipRes.json();
        const prodData = await prodRes.json();
        if (!ac.signal.aborted) {
          setProducts(prodData.data?.products || []);
          if (flagshipData.data?.flagship) {
            const f = flagshipData.data.flagship;
            setForm({
              product_id: f.product_id || "",
              custom_title: f.custom_title || "",
              custom_description: f.custom_description || "",
              selected_image: f.selected_image || "",
            });
          }
          setLoading(false);
        }
      } catch {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const selectedProduct = products.find((p) => p.id === form.product_id);

  const handleProductChange = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setForm((p) => ({
      ...p,
      product_id: productId,
      selected_image: prod?.image?.[0] || "",
    }));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!form.product_id) { showToast("Select a product"); return; }
    if (!form.selected_image) { showToast("Select an image"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/flagship", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (res.ok) showToast("Main Character saved");
      else showToast(d.message || "Save failed");
    } catch {
      showToast("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-white placeholder-white/30 focus:border-[#C6FF00] focus:outline-none transition-colors";

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 rounded-lg shadow-lg text-sm font-bold animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Main Character</h2>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#C6FF00] text-[#1a1a1a] px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded hover:brightness-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <p className="text-white/40 text-sm mb-8">
        Select one product to feature in the Flagship Spotlight on the home page. Pick an image from its existing uploads. Title and description are optional — if left empty, product defaults are used.
      </p>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Product Dropdown */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                Product <span className="text-red-400">*</span>
              </label>
              <select
                value={form.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#1a1a1a]">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#1a1a1a]">
                    {p.prod_name} — ₹{p.prod_price}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Selection */}
            {selectedProduct && selectedProduct.image?.length > 0 && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Select Image <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {selectedProduct.image.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, selected_image: img }))}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-colors ${
                        form.selected_image === img
                          ? "border-[#C6FF00]"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <Image src={img} alt={`Product image ${idx + 1}`} fill className="object-cover" />
                      {form.selected_image === img && (
                        <div className="absolute inset-0 bg-[#C6FF00]/10 flex items-center justify-center">
                          <span className="bg-[#C6FF00] text-[#1a1a1a] text-xs font-bold px-2 py-1 rounded">
                            Selected
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Title */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                Custom Title <span className="text-white/20">(optional)</span>
              </label>
              <input
                value={form.custom_title}
                onChange={(e) => setForm((p) => ({ ...p, custom_title: e.target.value }))}
                className={inputClass}
                placeholder={selectedProduct?.prod_name || "Leave empty to use product name"}
              />
              {!form.custom_title && selectedProduct && (
                <p className="text-xs text-white/30 mt-1">
                  Will display: &ldquo;{selectedProduct.prod_name}&rdquo;
                </p>
              )}
            </div>

            {/* Custom Description */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                Custom Description <span className="text-white/20">(optional)</span>
              </label>
              <textarea
                value={form.custom_description}
                onChange={(e) => setForm((p) => ({ ...p, custom_description: e.target.value }))}
                rows={4}
                className={inputClass}
                placeholder={selectedProduct?.prod_description || "Leave empty to use product description"}
              />
              {!form.custom_description && selectedProduct && (
                <p className="text-xs text-white/30 mt-1 line-clamp-2">
                  Will display: &ldquo;{selectedProduct.prod_description}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Preview</label>
            <div className="border border-white/10 rounded-lg p-6 bg-[#C6FF00]/5">
              {selectedProduct ? (
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-wider text-[#C6FF00]">Main Character</p>
                  <h3 className="text-lg font-bold uppercase tracking-wider">
                    {form.custom_title || selectedProduct.prod_name}
                  </h3>
                  <p className="text-sm text-white/60 line-clamp-4">
                    {form.custom_description || selectedProduct.prod_description}
                  </p>
                  {form.selected_image && (
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden mt-4">
                      <Image
                        src={form.selected_image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/30 text-sm">Select a product to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── MAIN ADMIN PAGE ─────────────── */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products");

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/10 py-6 pr-6">
        <nav className="space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  active
                    ? "bg-[#C6FF00]/10 text-[#C6FF00]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 pl-8 py-6 min-w-0">
        {activeTab === "products" && <ProductsPanel />}
        {activeTab === "about" && <AboutPanel />}
        {activeTab === "designer-hero" && <DesignerHeroPanel />}
        {activeTab === "musicians" && <MusiciansPanel />}
        {activeTab === "users" && <UsersPanel />}
        {activeTab === "footer" && <FooterPanel />}
        {activeTab === "offers" && <OffersPanel />}
        {activeTab === "design-images" && <DesignImagesPanel />}
        {activeTab === "main-character" && <MainCharacterPanel />}
      </main>
    </div>
  );
}
