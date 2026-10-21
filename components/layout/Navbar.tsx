"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/common";
import { useAuth } from "@/context/AuthContext";
import { useBag } from "@/context/BagContext";

const MENU_SECTIONS = [
  {
    heading: "Shop",
    links: [
      { label: "Collections", href: "/collections" },
      { label: "Silhouettes", href: "/silhouettes" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "Designs", href: "/design" },
      { label: "Designer", href: "/designer" },
      { label: "Musicians", href: "/musician" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "Contact", href: "/contact" },
    ],
  },
];

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

  const menuSections = [
    ...MENU_SECTIONS,
    {
      heading: "More",
      links: [
        { label: "Sizing", href: "/sizing" },
        ...(!user
          ? [
              { label: "Sign In", href: "/sign-in" },
              { label: "Sign Up", href: "/sign-up" },
            ]
          : []),
      ],
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return <nav style={{ display: "none" }} />;

  const showSolid = !isHome || scrolled;

  const openMega = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  };

  const closeMega = () => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 150);
  };

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
            alt="Wxrship The Fumes"
            width={48}
            height={48}
            className="h-10 w-auto text-white"
          />
        </Link>

        {/* Desktop nav — hamburger + profile + cart */}
        <div className="hidden md:flex items-center gap-6">
          {/* Hamburger menu trigger */}
          <div
            className="relative"
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <button
              className="text-white hover:text-[#C6FF00] transition-colors p-1"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>

            {/* Mega dropdown */}
            {megaOpen && (
              <div
                className="absolute top-full right-0 mt-3 bg-[#C6FF00]/60 text-[#1a1a1a] backdrop-blur-md rounded-lg shadow-lg py-5 min-w-[480px] grid grid-cols-4 divide-x divide-white/20"
              >
                {menuSections.map((section) => (
                  <ul key={section.heading} className="px-4 space-y-2">
                    <li className="text-xs font-bold uppercase tracking-wider text-black/70 mb-2">
                      {section.heading}
                    </li>
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setMegaOpen(false)}
                          className="text-sm cursor-pointer hover:text-[#C6FF00] transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            )}
          </div>

          {/* Profile — only when logged in */}
          {user && (
            <Link
              href="/profile"
              className="text-white hover:text-[#C6FF00] transition-colors flex items-center gap-1.5"
              aria-label="Profile"
            >
              <User size={20} />
            </Link>
          )}

          <Button onClick={openBag} className="text-xs py-2 px-5">
            Cart ({itemCount})
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-4">
          {user && (
            <Link
              href="/profile"
              className="text-white hover:text-[#C6FF00] transition-colors"
              aria-label="Profile"
            >
              <User size={20} />
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden border-t border-white/10 px-6 py-6 space-y-5 transition-colors duration-300 ${
          showSolid ? "bg-[#DF2877]" : "bg-black/40 backdrop-blur-md"
        }`}>
          {menuSections.map((section) => {
            const isOpen = mobileSection === section.heading;
            return (
              <div key={section.heading}>
                <button
                  type="button"
                  onClick={() => setMobileSection(isOpen ? null : section.heading)}
                  className="flex items-center justify-between w-full text-sm font-bold uppercase tracking-wider text-white"
                >
                  {section.heading}
                  <span className={`ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-2 ml-3 space-y-2">
                    {section.links.map((link) => (
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
