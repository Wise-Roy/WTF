"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BRAND, FOOTER_COLUMNS } from "@/lib/constants";
import { Input } from "@/components/common";

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 py-16 px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/">
              <Image src="/logo.png" alt="Worship The Fumes" width={48} height={48} className="h-10 w-auto" />
            </Link>
            <p className="mt-4 text-sm text-[#F5F5F5]/50">{BRAND.motto}</p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#F5F5F5]/50 hover:text-[#C6FF00] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Signup */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">
              Join the cult
            </h4>
            {subscribed ? (
              <p className="mt-4 text-sm text-[#C6FF00]">You&apos;re in. Welcome to the cult.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="you@weird.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm py-2"
                />
                <button
                  type="submit"
                  className="bg-[#C6FF00] text-[#0A0A0A] px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap hover:bg-[#d4ff33] transition-colors"
                >
                  Sign me up
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#F5F5F5]/50 hover:text-[#C6FF00] transition-colors" aria-label="Instagram">
              <InstagramIcon size={20} />
            </a>
            <a href="#" className="text-[#F5F5F5]/50 hover:text-[#C6FF00] transition-colors" aria-label="TikTok">
              <TikTokIcon size={20} />
            </a>
            <a href="#" className="text-[#F5F5F5]/50 hover:text-[#C6FF00] transition-colors" aria-label="X">
              <XIcon size={20} />
            </a>
            <a href="#" className="text-[#F5F5F5]/50 hover:text-[#C6FF00] transition-colors" aria-label="YouTube">
              <YouTubeIcon size={20} />
            </a>
          </div>
          <a href={`mailto:${BRAND.email}`} className="text-sm text-[#F5F5F5]/50 hover:text-[#C6FF00] transition-colors">
            {BRAND.email}
          </a>
          <p className="text-sm text-[#F5F5F5]/30">&copy; {BRAND.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
