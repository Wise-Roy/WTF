"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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

  const navLinks = [
    { label: "Products", href: "/admin/products" },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/products" className="text-sm font-bold uppercase tracking-wider text-[#C6FF00]">
              WTF Admin
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
            Back to site
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </div>
    </div>
  );
}
