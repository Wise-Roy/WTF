"use client";

import { useState } from "react";
import { SectionWrapper, Tagline, SectionHeading, Input } from "@/components/common";

export default function JoinCult() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSubmitted(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionWrapper scheme="pink" id="join" className="!bg-transparent text-center">
      <Tagline className="bg-[#C6FF00] text-[#1a1a1a]">Join the Cult</Tagline>
      <SectionHeading className="mt-6" style={{ WebkitTextStroke: "1.5px #C6FF00", color: "white" }}>Zero FOMO</SectionHeading>

      {submitted ? (
        <p className="mt-8 text-xl font-bold text-[#C6FF00]">
          You&apos;re in. Welcome to the cult.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-10 mx-auto max-w-md flex flex-col sm:flex-row gap-3"
        >
          <Input
            name="email"
            type="email"
            placeholder="you@weird.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-white/30 text-white placeholder:text-white/50 focus:border-[#C6FF00]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap hover:bg-[#d4ff33] transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Subscribe"}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      )}

      <p className="mt-4 text-sm text-[#C6FF00]">We Promise, No Spam.</p>
    </SectionWrapper>
  );
}
