"use client";

import { useState } from "react";
import { SectionWrapper, Tagline, SectionHeading, Input } from "@/components/common";

export default function JoinCult() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <SectionWrapper scheme="pink" id="join" className="text-center">
      <Tagline className="bg-white text-[#1a1a1a]">Join the Cult</Tagline>
      <SectionHeading className="mt-6">Never miss a drop</SectionHeading>

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
            className="bg-[#C6FF00] text-[#1a1a1a] px-6 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap hover:bg-[#d4ff33] transition-colors"
          >
            Get early access
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-white/60">No spam. Just drops.</p>
    </SectionWrapper>
  );
}
