"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, FileText, Users, Globe } from "lucide-react";
import { DbProduct } from "@/types";
import { uploadFile } from "@/lib/upload-client";

type Tab = "products" | "about" | "users" | "footer";

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: "products", label: "Products", icon: Package },
  { key: "about", label: "About Us", icon: FileText },
  { key: "users", label: "Users", icon: Users },
  { key: "footer", label: "Footer", icon: Globe },
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
  profile: UserProfile | null;
}

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Users</h2>
        <span className="text-white/40 text-sm">
          {!loading && `${users.length} registered`}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">No users registered yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/50 uppercase tracking-wider text-xs">
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">City</th>
                <th className="py-3 pr-4">Country</th>
                <th className="py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 pr-4 font-medium">{u.email}</td>
                  <td className="py-3 pr-4 text-white/60">
                    {u.profile?.name || <span className="text-white/20">—</span>}
                  </td>
                  <td className="py-3 pr-4 text-white/60 font-mono text-xs">
                    {u.profile?.phone || <span className="text-white/20">—</span>}
                  </td>
                  <td className="py-3 pr-4 text-white/60">
                    {u.profile?.city || <span className="text-white/20">—</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
                      {u.profile?.country || "—"}
                    </span>
                  </td>
                  <td className="py-3 text-white/40 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
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

/* ─────────────── FOOTER TAB ─────────────── */
function FooterPanel() {
  const [links, setLinks] = useState({ instagram: "", twitter: "", spotify: "", facebook: "" });
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
        {activeTab === "users" && <UsersPanel />}
        {activeTab === "footer" && <FooterPanel />}
      </main>
    </div>
  );
}
