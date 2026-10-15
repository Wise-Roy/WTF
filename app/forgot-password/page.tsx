"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValid = EMAIL_REGEX.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset link.");
        setLoading(false);
        return;
      }

      setSent(true);
      setResetLink(data.reset_link || null);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-[#FFF9D6] flex items-center justify-center px-4 py-24 overflow-hidden">
      <div
        className="absolute pointer-events-none select-none opacity-[0.07]"
        style={{ top: "-55%", right: "-15%", width: "500px", height: "500px", transform: "rotate(-15deg)" }}
      >
        <Image src="/clean_logo.png" alt="" fill className="object-contain" aria-hidden="true" />
      </div>

      <div className="w-full max-w-md bg-[#FFF3B0] border border-[#1a1a1a]/10 p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <span className="inline-block bg-[#C6FF00] text-[#1a1a1a] px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Password Reset
          </span>
        </div>

        {!sent ? (
          <>
            <h1 className="font-heading text-4xl uppercase tracking-wider text-[#1a1a1a] text-center">
              Forgot Password
            </h1>
            <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 text-center mt-3">
              Enter your email to get a reset link.
            </p>

            {error && (
              <div className="mt-4 border border-red-800/30 bg-red-800/10 p-3">
                <p className="text-xs uppercase tracking-wider text-red-800 text-center">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full border border-[#1a1a1a]/20 bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 outline-none focus:border-[#C6FF00] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                  isValid && !loading
                    ? "bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#d4ff33]"
                    : "bg-[#1a1a1a]/10 text-[#1a1a1a]/30 cursor-not-allowed"
                }`}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-heading text-3xl uppercase tracking-wider text-[#1a1a1a] text-center">
              Check Your Email
            </h1>

            <div className="mt-6 border border-dashed border-[#1a1a1a]/30 p-5">
              <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 text-center mb-4">
                Simulated email — mocked. Your reset link:
              </p>
              {resetLink && (
                <a
                  href={resetLink}
                  className="block w-full py-3 text-center bg-[#C6FF00] text-[#1a1a1a] text-sm font-bold uppercase tracking-widest hover:bg-[#d4ff33] transition-colors"
                >
                  Reset Password
                </a>
              )}
            </div>

            <button
              onClick={() => {
                setSent(false);
                setResetLink(null);
                setEmail("");
              }}
              className="mt-4 w-full text-xs uppercase tracking-wider text-[#1a1a1a]/50 hover:text-[#88AF00] text-center transition-colors"
            >
              Try different email
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/sign-in"
            className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 hover:text-[#88AF00] transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
