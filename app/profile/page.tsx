"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DbProduct } from "@/types";
import ProductCard from "@/components/common/ProductCard";
import { Heart, MessageSquare, User } from "lucide-react";

type Tab = "profile" | "wishlist" | "feedback";

interface Profile {
  name: string;
  phone: string;
  house_flat: string;
  street: string;
  address_line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: DbProduct;
}

interface FeedbackItem {
  id: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in");
  };

  if (loading || !user) {
    return (
      <section className="min-h-screen bg-[#FFF9D6] flex items-center justify-center">
        <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 animate-pulse">
          Loading...
        </p>
      </section>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profile", label: "My Profile", icon: User },
    { key: "wishlist", label: "Favourites", icon: Heart },
    { key: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <section className="min-h-screen bg-[#FFF9D6] px-4 sm:px-6 md:px-12 lg:px-20 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <span className="inline-block bg-[#C6FF00] text-[#1a1a1a] px-3 py-1 text-xs font-semibold uppercase tracking-widest">
          Your Cult File
        </span>
        <h1 className="mt-6 font-heading text-4xl sm:text-5xl uppercase tracking-wider text-[#1a1a1a]">
          Profile
        </h1>
        <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 mt-2">
          {user.email}
        </p>

        {/* Tab row */}
        <div className="flex flex-wrap items-center gap-0 mt-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider border transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#C6FF00] text-[#1a1a1a] border-[#C6FF00]"
                    : "border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#C6FF00] hover:text-[#88AF00]"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ").pop()}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="ml-auto px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider border border-[#1a1a1a]/20 text-[#1a1a1a]/50 hover:border-red-800/30 hover:text-red-800 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tab content */}
        <div className="mt-6 border border-[#1a1a1a]/10 bg-[#FFF3B0] p-4 sm:p-6 md:p-8">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "wishlist" && <WishlistTab />}
          {activeTab === "feedback" && <FeedbackTab />}
        </div>
      </div>
    </section>
  );
}

/* ─── MY PROFILE TAB ─── */
function ProfileTab() {
  const [form, setForm] = useState<Profile>({
    name: "",
    phone: "",
    house_flat: "",
    street: "",
    address_line1: "",
    city: "",
    state: "",
    zip: "",
    country: "IN",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setForm({
            name: d.profile.name || "",
            phone: d.profile.phone || "",
            house_flat: d.profile.house_flat || "",
            street: d.profile.street || "",
            address_line1: d.profile.address_line1 || "",
            city: d.profile.city || "",
            state: d.profile.state || "",
            zip: d.profile.zip || "",
            country: d.profile.country || "IN",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (key: keyof Profile, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  if (loading) {
    return (
      <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/40 animate-pulse">
        Loading...
      </p>
    );
  }

  const inputClass =
    "w-full border border-[#1a1a1a]/20 bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 outline-none focus:border-[#C6FF00] transition-colors";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Personal Info */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">Name</label>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" className={inputClass} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">
          Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">House / Flat No.</label>
            <input value={form.house_flat} onChange={(e) => update("house_flat", e.target.value)} placeholder="Flat 4B" className={inputClass} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">Street</label>
            <input value={form.street} onChange={(e) => update("street", e.target.value)} placeholder="Main Road" className={inputClass} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">City / Town</label>
            <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Mumbai" className={inputClass} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">State</label>
            <input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="Maharashtra" className={inputClass} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">ZIP</label>
            <input value={form.zip} onChange={(e) => update("zip", e.target.value)} placeholder="400001" className={inputClass} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">Country</label>
            <input value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="IN" className={inputClass} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-3 bg-[#C6FF00] text-[#1a1a1a] text-sm font-bold uppercase tracking-widest hover:bg-[#d4ff33] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Details"}
      </button>
    </form>
  );
}

/* ─── WISHLIST TAB ─── */
function WishlistTab() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId: string) => {
    setRemoving(productId);
    try {
      await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch {
      // ignore
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/40 animate-pulse">
        Loading wishlist...
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart size={40} className="mx-auto text-[#1a1a1a]/20 mb-4" />
        <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/40">
          No favourites saved yet.
        </p>
        <p className="text-xs text-[#1a1a1a]/30 mt-2">
          Browse products and tap the heart to save them here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 mb-6">
        {items.length} {items.length === 1 ? "item" : "items"} saved
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <ProductCard product={item.products} />
            <button
              onClick={() => handleRemove(item.product_id)}
              disabled={removing === item.product_id}
              className="absolute top-3 left-3 z-30 w-9 h-9 rounded-full bg-white/90 border border-[#1a1a1a]/10 flex items-center justify-center hover:bg-[#FFD9E7] hover:border-[#DF2877] transition-colors"
              title="Remove from favourites"
            >
              {removing === item.product_id ? (
                <div className="h-4 w-4 border-2 border-[#1a1a1a]/30 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Heart size={16} className="text-[#DF2877] fill-[#DF2877]" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── FEEDBACK TAB ─── */
function FeedbackTab() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const currentWords = wordCount(message);
  const editWords = wordCount(editMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || currentWords > 100 || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (res.ok) {
        setMessage("");
        fetchFeedback();
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editMessage.trim() || editWords > 100) return;

    try {
      await fetch("/api/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, message: editMessage.trim() }),
      });
      setEditingId(null);
      setEditMessage("");
      fetchFeedback();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback?")) return;
    setDeletingId(id);
    try {
      await fetch("/api/feedback", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full border border-[#1a1a1a]/20 bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 outline-none focus:border-[#C6FF00] transition-colors resize-none";

  if (loading) {
    return (
      <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/40 animate-pulse">
        Loading...
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* New Feedback */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">
          Submit Feedback
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Share your thoughts, suggestions, or comments..."
              className={inputClass}
            />
            <div className="flex justify-between mt-1">
              <p className={`text-xs ${currentWords > 100 ? "text-red-500 font-bold" : "text-[#1a1a1a]/40"}`}>
                {currentWords} / 100 words
              </p>
              {currentWords > 100 && (
                <p className="text-xs text-red-500">Exceeds word limit</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || currentWords > 100 || sending}
            className={`px-8 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
              message.trim() && currentWords <= 100 && !sending
                ? "bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#d4ff33]"
                : "bg-[#1a1a1a]/10 text-[#1a1a1a]/30 cursor-not-allowed"
            }`}
          >
            {sending ? "Sending..." : "Submit Feedback"}
          </button>
        </form>
      </div>

      {/* Past Feedback */}
      {items.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">
            Your Feedback
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border border-[#1a1a1a]/10 p-4 bg-[#FFF9D6]">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows={3}
                      className={inputClass}
                    />
                    <div className="flex justify-between">
                      <p className={`text-xs ${editWords > 100 ? "text-red-500" : "text-[#1a1a1a]/40"}`}>
                        {editWords} / 100 words
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(item.id)}
                        disabled={!editMessage.trim() || editWords > 100}
                        className="px-4 py-2 bg-[#C6FF00] text-[#1a1a1a] text-xs font-bold uppercase tracking-widest hover:bg-[#d4ff33] transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditMessage(""); }}
                        className="px-4 py-2 border border-[#1a1a1a]/20 text-[#1a1a1a]/50 text-xs uppercase tracking-widest hover:border-[#1a1a1a]/40 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[#1a1a1a]/80 whitespace-pre-wrap">
                      {item.message}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                      <p className="text-[10px] text-[#1a1a1a]/30">
                        {new Date(item.created_at).toLocaleString()}
                        {item.updated_at !== item.created_at && " (edited)"}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setEditingId(item.id); setEditMessage(item.message); }}
                          className="text-xs uppercase tracking-wider text-[#88AF00] hover:text-[#6d8c00] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="text-xs uppercase tracking-wider text-red-500/60 hover:text-red-600 transition-colors"
                        >
                          {deletingId === item.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
