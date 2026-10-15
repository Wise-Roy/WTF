"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-md bg-[#FFF3B0] border border-[#1a1a1a]/10 p-6 sm:p-8 text-center">
        <h1 className="font-heading text-3xl uppercase tracking-wider text-[#1a1a1a]">
          Invalid Link
        </h1>
        <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 mt-3">
          No reset token provided.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block mt-6 px-6 py-3 bg-[#C6FF00] text-[#1a1a1a] text-sm font-bold uppercase tracking-widest hover:bg-[#d4ff33] transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirm_password: confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/sign-in"), 2000);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-[#FFF3B0] border border-[#1a1a1a]/10 p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-6">
          <span className="inline-block bg-[#C6FF00] text-[#1a1a1a] px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Done
          </span>
        </div>
        <h1 className="font-heading text-3xl uppercase tracking-wider text-[#1a1a1a]">
          Password Reset
        </h1>
        <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 mt-3">
          Redirecting to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#FFF3B0] border border-[#1a1a1a]/10 p-6 sm:p-8">
      <div className="flex justify-center mb-6">
        <span className="inline-block bg-[#C6FF00] text-[#1a1a1a] px-3 py-1 text-xs font-semibold uppercase tracking-widest">
          New Password
        </span>
      </div>

      <h1 className="font-heading text-4xl uppercase tracking-wider text-[#1a1a1a] text-center">
        Reset Password
      </h1>

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
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            className="w-full border border-[#1a1a1a]/20 bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 outline-none focus:border-[#C6FF00] transition-colors"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full border border-[#1a1a1a]/20 bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 outline-none focus:border-[#C6FF00] transition-colors"
          />
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
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 hover:text-[#88AF00] transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="relative min-h-screen bg-[#FFF9D6] flex items-center justify-center px-4 py-24 overflow-hidden">
      <div
        className="absolute pointer-events-none select-none opacity-[0.07]"
        style={{ top: "-55%", right: "-15%", width: "500px", height: "500px", transform: "rotate(-15deg)" }}
      >
        <Image src="/clean_logo.png" alt="" fill className="object-contain" aria-hidden="true" />
      </div>
      <Suspense
        fallback={
          <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 animate-pulse">
            Loading...
          </p>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </section>
  );
}
