"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/common";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent over hero on home, solid everywhere else or after scroll
  const showSolid = !isHome || scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        showSolid
          ? "bg-[#DF2877] border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 md:px-12 lg:px-20 h-16">
        <Link href="/">
          <Image src="/logo.png" alt="Worship The Fumes" width={48} height={48} className="h-10 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-wider text-white/80 hover:text-[#C6FF00] transition-colors"
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
          className="md:hidden text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#DF2877] border-t border-white/10 px-6 py-6 space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm uppercase tracking-wider text-white/80 hover:text-[#C6FF00] transition-colors"
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
