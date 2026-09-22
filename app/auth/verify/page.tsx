"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/sign-in?error=missing_token");
      return;
    }

    const verify = async () => {
      const res = await fetch(`/api/auth/verify?token=${token}`, {
        redirect: "manual",
      });

      if (res.type === "opaqueredirect" || res.redirected) {
        await refresh();
        router.push("/profile");
      } else {
        router.push("/sign-in?error=invalid_token");
      }
    };

    verify();
  }, [token, router, refresh]);

  return (
    <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 animate-pulse">
      Verifying your magic link...
    </p>
  );
}

export default function VerifyPage() {
  return (
    <section className="min-h-screen bg-[#FFF9D6] flex items-center justify-center">
      <Suspense
        fallback={
          <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/50 animate-pulse">
            Loading...
          </p>
        }
      >
        <VerifyContent />
      </Suspense>
    </section>
  );
}
