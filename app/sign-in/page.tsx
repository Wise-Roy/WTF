"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: "No token provided.",
  invalid_token: "Invalid or unknown link.",
  token_used: "This link has already been used.",
  token_expired: "Link expired. Request a new one.",
  server_error: "Something went wrong. Try again.",
};

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    errorParam ? ERROR_MESSAGES[errorParam] || "Something went wrong." : null
  );

  const isValid = EMAIL_REGEX.test(email);

  if (user) {
    router.push("/profile");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send link.");
        setLoading(false);
        return;
      }

      setSent(true);
      setMagicLink(data.magic_link);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#FFF3B0] border border-[#1a1a1a]/10 p-6 sm:p-8">
      {/* Cult Pass Badge */}
      <div className="flex justify-center mb-6">
        <span className="inline-block bg-[#C6FF00] text-[#1a1a1a] px-3 py-1 text-xs font-semibold uppercase tracking-widest">
          Cult Pass
        </span>
      </div>

      {!sent ? (
        <>
          <h1 className="font-heading text-4xl uppercase tracking-wider text-[#1a1a1a] text-center">
            Sign In
          </h1>
          <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 text-center mt-3">
            No passwords. Ever. Magic link only.
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
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="font-heading text-3xl uppercase tracking-wider text-[#1a1a1a] text-center">
            Check Your Inbox
          </h1>

          {/* Mocked email box */}
          <div className="mt-6 border border-dashed border-[#1a1a1a]/30 p-5">
            <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/50 text-center mb-4">
              Simulated email — mocked. Your link:
            </p>
            <a
              href={magicLink ?? "#"}
              className="block w-full py-3 text-center bg-[#C6FF00] text-[#1a1a1a] text-sm font-bold uppercase tracking-widest hover:bg-[#d4ff33] transition-colors"
            >
              Open Magic Link
            </a>
          </div>

          <button
            onClick={() => {
              setSent(false);
              setMagicLink(null);
              setEmail("");
            }}
            className="mt-4 w-full text-xs uppercase tracking-wider text-[#1a1a1a]/50 hover:text-[#88AF00] text-center transition-colors"
          >
            Try different email
          </button>
        </>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <section className="min-h-screen bg-[#FFF9D6] flex items-center justify-center px-4 py-24">
      <Suspense
        fallback={
          <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 animate-pulse">
            Loading...
          </p>
        }
      >
        <SignInContent />
      </Suspense>
    </section>
  );
}
