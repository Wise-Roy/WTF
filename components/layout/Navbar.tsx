"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/common";
import { useAuth } from "@/context/AuthContext";
import { useBag } from "@/context/BagContext";

const NAV_ITEMS = ["Shop", "About", "Contact", "Profile"] as const;

const DROPDOWN: Record<string, { label: string; href: string }[]> = {
  Shop: [
    { label: "Collections", href: "/shop?view=collections" },
    { label: "Products", href: "/shop" },
  ],
  About: [
    { label: "Artists", href: "/about#artists" },
  ],
  Contact: [
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "#faq" },
  ],
  Profile: [], // dynamic, filled at render
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { user } = useAuth();
  const { openBag, itemCount } = useBag();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showSolid = !isHome || scrolled;

  const openMega = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  };

  const closeMega = () => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 150);
  };

  const profileLinks = user
    ? [{ label: "Profile", href: "/profile" }]
    : [
        { label: "Sign In", href: "/sign-in" },
        { label: "Sign Up", href: "/sign-up" },
      ];

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
          <Image
            id="navbar-logo"
            src="/white_logo.png"
            alt="Worship The Fumes"
            width={48}
            height={48}
            className="h-10 w-auto text-white"
          />
        </Link>

        {/* Desktop nav */}
        <div
          className="hidden md:flex items-center gap-8 relative"
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
        >
            {NAV_ITEMS.map((item) => (
              <span
                key={item}
                className="text-sm uppercase tracking-wider text-white/80 hover:text-[#C6FF00] transition-colors cursor-pointer"
              >
                {item}
              </span>
            ))}

            <Button onClick={openBag} className="text-xs py-2 px-5">
              Cart ({itemCount})
            </Button>

            {/* Mega dropdown — full width of nav + cart */}
            {megaOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-black/40 backdrop-blur-md rounded-lg shadow-lg py-5 grid grid-cols-4 divide-x divide-white/20">
                {/* Shop */}
                <ul className="px-4 space-y-2">
                  {DROPDOWN.Shop.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMegaOpen(false)}
                        className="text-sm text-white/80 hover:text-[#C6FF00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* About */}
                <ul className="px-4 space-y-2">
                  {DROPDOWN.About.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMegaOpen(false)}
                        className="text-sm text-white/80 hover:text-[#C6FF00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Contact */}
                <ul className="px-4 space-y-2">
                  {DROPDOWN.Contact.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMegaOpen(false)}
                        className="text-sm text-white/80 hover:text-[#C6FF00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Profile */}
                <ul className="px-4 space-y-2">
                  {profileLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMegaOpen(false)}
                        className="text-sm text-white/80 hover:text-[#C6FF00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
        <div className={`md:hidden border-t border-white/10 px-6 py-6 space-y-5 transition-colors duration-300 ${
          showSolid ? "bg-[#DF2877]" : "bg-black/40 backdrop-blur-md"
        }`}>
          {(["Shop", "About", "Contact", "Profile"] as const).map((section) => {
            const links = section === "Profile" ? profileLinks : DROPDOWN[section];
            const isOpen = mobileSection === section;
            return (
              <div key={section}>
                <button
                  type="button"
                  onClick={() => setMobileSection(isOpen ? null : section)}
                  className="flex items-center justify-between w-full text-sm font-bold uppercase tracking-wider text-white"
                >
                  {section}
                  <span className={`ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-2 ml-3 space-y-2">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => { setMobileOpen(false); setMobileSection(null); }}
                        className="block text-sm text-white/60 hover:text-[#C6FF00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Button onClick={() => { setMobileOpen(false); openBag(); }} className="w-full text-xs py-2 mt-4">
            Cart ({itemCount})
          </Button>
        </div>
      )}
    </nav>
  );
}
