"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, BRAND } from "@/lib/constants";
import { Button } from "@/components/common";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 md:px-12 lg:px-20 h-16">
        <Link href="/" className="font-heading text-2xl uppercase tracking-wider text-[#F5F5F5]">
          {BRAND.shortName}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-wider text-[#F5F5F5]/70 hover:text-[#C6FF00] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Button href="/shop" className="text-xs py-2 px-5">
            Shop the Drop
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#F5F5F5]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-white/10 px-6 py-6 space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm uppercase tracking-wider text-[#F5F5F5]/70 hover:text-[#C6FF00] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Button href="/shop" className="w-full text-xs py-2 mt-4">
            Shop the Drop
          </Button>
        </div>
      )}
    </nav>
  );
}
