"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Tab = "orders" | "info" | "support";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  items: unknown[];
  created_at: string;
}

interface Profile {
  name: string;
  phone: string;
  address_line1: string;
  city: string;
  zip: string;
  country: string;
}

interface SupportQuery {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

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

  const tabs: { key: Tab; label: string }[] = [
    { key: "orders", label: "Orders" },
    { key: "info", label: "Info" },
    { key: "support", label: "Support" },
  ];

  return (
    <section className="min-h-screen bg-[#FFF9D6] px-4 sm:px-6 md:px-12 lg:px-20 py-24">
      <div className="mx-auto max-w-3xl">
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
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wider border transition-colors ${
                activeTab === tab.key
                  ? "bg-[#C6FF00] text-[#1a1a1a] border-[#C6FF00]"
                  : "border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#C6FF00] hover:text-[#88AF00]"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="ml-auto px-5 py-2.5 text-sm font-bold uppercase tracking-wider border border-[#1a1a1a]/20 text-[#1a1a1a]/50 hover:border-red-800/30 hover:text-red-800 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tab content */}
        <div className="mt-6 border border-[#1a1a1a]/10 bg-[#FFF3B0] p-6 sm:p-8">
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "info" && <InfoTab />}
          {activeTab === "support" && <SupportTab />}
        </div>
      </div>
    </section>
  );
}

/* ─── ORDERS TAB ─── */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/40 animate-pulse">
        Loading orders...
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/40 text-center py-8">
        No orders on this account yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-[#1a1a1a]/10 p-4 bg-[#FFF9D6] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div>
            <p className="text-sm font-bold text-[#1a1a1a]">
              {order.order_number}
            </p>
            <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/50">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#1a1a1a]">
              &#8377;{Number(order.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-2 py-0.5 bg-[#C6FF00] text-[#1a1a1a]">
              {order.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── INFO TAB ─── */
function InfoTab() {
  const [form, setForm] = useState<Profile>({
    name: "",
    phone: "",
    address_line1: "",
    city: "",
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
            address_line1: d.profile.address_line1 || "",
            city: d.profile.city || "",
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

  const fields: { key: keyof Profile; label: string; placeholder: string }[] = [
    { key: "name", label: "Name", placeholder: "Your full name" },
    { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
    { key: "address_line1", label: "Address Line 1", placeholder: "123 Street" },
    { key: "city", label: "City", placeholder: "Mumbai" },
    { key: "zip", label: "ZIP", placeholder: "400001" },
    { key: "country", label: "Country", placeholder: "IN" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">
              {f.label}
            </label>
            <input
              value={form[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full border border-[#1a1a1a]/20 bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 outline-none focus:border-[#C6FF00] transition-colors"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-2 px-8 py-3 bg-[#C6FF00] text-[#1a1a1a] text-sm font-bold uppercase tracking-widest hover:bg-[#d4ff33] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Details"}
      </button>
    </form>
  );
}

/* ─── SUPPORT TAB ─── */
function SupportTab() {
  const [queries, setQueries] = useState<SupportQuery[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subject, setSubject] = useState("");
  const [relatedOrder, setRelatedOrder] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [qRes, oRes] = await Promise.all([
      fetch("/api/support/queries"),
      fetch("/api/orders"),
    ]);
    const [qData, oData] = await Promise.all([qRes.json(), oRes.json()]);
    setQueries(qData.queries ?? []);
    setOrders(oData.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || sending) return;

    setSending(true);
    await fetch("/api/support/queries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: subject.trim(),
        related_order_id: relatedOrder || null,
        message: message.trim(),
      }),
    });

    setSubject("");
    setRelatedOrder("");
    setMessage("");
    setSending(false);
    fetchData();
  };

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
    <div className="space-y-8">
      {/* New Query */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">
          New Query
        </h3>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's up?"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">
              Related Order (optional)
            </label>
            <select
              value={relatedOrder}
              onChange={(e) => setRelatedOrder(e.target.value)}
              className={inputClass}
            >
              <option value="">None</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-1.5">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Tell us everything..."
              className={`${inputClass} resize-none`}
            />
          </div>
          <button
            type="submit"
            disabled={!subject.trim() || !message.trim() || sending}
            className={`px-8 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
              subject.trim() && message.trim() && !sending
                ? "bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#d4ff33]"
                : "bg-[#1a1a1a]/10 text-[#1a1a1a]/30 cursor-not-allowed"
            }`}
          >
            {sending ? "Sending..." : "Send Query"}
          </button>
        </form>
      </div>

      {/* Past Queries */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">
          Past Queries
        </h3>
        {queries.length === 0 ? (
          <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/40 text-center py-4">
            Nothing logged yet.
          </p>
        ) : (
          <div className="space-y-3">
            {queries.map((q) => (
              <div
                key={q.id}
                className="border border-[#1a1a1a]/10 p-4 bg-[#FFF9D6]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    {q.subject}
                  </p>
                  <span className="inline-block text-xs font-semibold uppercase tracking-widest px-2 py-0.5 bg-[#C6FF00] text-[#1a1a1a] self-start">
                    {q.status}
                  </span>
                </div>
                <p className="text-xs text-[#1a1a1a]/60 whitespace-pre-wrap">
                  {q.message}
                </p>
                <p className="text-[10px] text-[#1a1a1a]/30 mt-2">
                  {new Date(q.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
