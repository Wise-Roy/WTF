"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.authorized) {
          setAuthorized(true);
        } else {
          router.push("/admin-use");
        }
      })
      .catch(() => router.push("/admin-use"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="admin-area min-h-screen bg-[#1a1a1a] text-white">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/white_logo.png" alt="WTF" width={36} height={36} />
            <span className="text-sm font-bold uppercase tracking-wider text-[#C6FF00]">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
              Back to site
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                router.push("/");
              }}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        {children}
      </div>
    </div>
  );
}
