"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-()]{7,20}$/;

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  house_flat: string;
  street: string;
  city: string;
  state: string;
  country: string;
  password: string;
  confirm_password: string;
}

const initialForm: FormData = {
  full_name: "",
  email: "",
  phone: "",
  house_flat: "",
  street: "",
  city: "",
  state: "",
  country: "IN",
  password: "",
  confirm_password: "",
};

export default function SignUpPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  if (user) {
    router.push("/profile");
    return null;
  }

  const update = (key: keyof FormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (!form.full_name.trim()) errs.full_name = "Required";
    if (!EMAIL_REGEX.test(form.email)) errs.email = "Valid email required";
    if (!PHONE_REGEX.test(form.phone)) errs.phone = "Valid phone required";
    if (form.password.length < 8) errs.password = "Min 8 characters";
    if (form.password !== form.confirm_password) errs.confirm_password = "Passwords don't match";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      await refresh();
      router.push("/profile");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key: keyof FormData) =>
    `w-full border ${fieldErrors[key] ? "border-red-500" : "border-[#1a1a1a]/20"} bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 outline-none focus:border-[#C6FF00] transition-colors`;

  return (
    <section className="relative min-h-screen bg-[#FFF9D6] flex items-center justify-center px-4 py-24 overflow-hidden">
      <div
        className="absolute pointer-events-none select-none opacity-[0.07]"
        style={{ top: "-55%", right: "-15%", width: "500px", height: "500px", transform: "rotate(-15deg)" }}
      >
        <Image src="/clean_logo.png" alt="" fill className="object-contain" aria-hidden="true" />
      </div>

      <div className="w-full max-w-lg bg-[#FFF3B0] border border-[#1a1a1a]/10 p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <span className="inline-block bg-[#C6FF00] text-[#1a1a1a] px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Join The Cult
          </span>
        </div>

        <h1 className="font-heading text-4xl uppercase tracking-wider text-[#1a1a1a] text-center">
          Sign Up
        </h1>
        <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 text-center mt-3">
          Create your cult file.
        </p>

        {error && (
          <div className="mt-4 border border-red-800/30 bg-red-800/10 p-3">
            <p className="text-xs uppercase tracking-wider text-red-800 text-center">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="Your full name"
              className={inputClass("full_name")}
            />
            {fieldErrors.full_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.full_name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@email.com"
              className={inputClass("email")}
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className={inputClass("phone")}
            />
            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>

          {/* Address Section */}
          <div className="pt-2">
            <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 mb-3 font-semibold">
              Address
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
                  House / Flat No.
                </label>
                <input
                  type="text"
                  value={form.house_flat}
                  onChange={(e) => update("house_flat", e.target.value)}
                  placeholder="Flat 4B"
                  className={inputClass("house_flat")}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
                  Street
                </label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => update("street", e.target.value)}
                  placeholder="Main Road"
                  className={inputClass("street")}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
                  City / Town
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Mumbai"
                  className={inputClass("city")}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  placeholder="Maharashtra"
                  className={inputClass("state")}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="IN"
                  className={inputClass("country")}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min 8 characters"
                className={inputClass("password")}
              />
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={(e) => update("confirm_password", e.target.value)}
                placeholder="Confirm password"
                className={inputClass("confirm_password")}
              />
              {fieldErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirm_password}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
              !loading
                ? "bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#d4ff33]"
                : "bg-[#1a1a1a]/10 text-[#1a1a1a]/30 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/sign-in"
            className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 hover:text-[#88AF00] transition-colors"
          >
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
