"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h2 className="font-heading text-3xl uppercase tracking-wider text-[#1a1a1a] mb-4">
        Something went wrong
      </h2>
      <p className="font-body text-[#1a1a1a]/60 mb-8 max-w-md">
        The page ran into an issue. This is usually temporary.
      </p>
      <button
        onClick={reset}
        className="bg-[#C6FF00] text-[#1a1a1a] px-8 py-3 font-body text-sm font-bold uppercase tracking-[0.15em] hover:brightness-90 transition"
      >
        Try Again
      </button>
    </div>
  );
}
