"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BRAND, FOOTER_COLUMNS } from "@/lib/constants";

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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

function SpotifyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

interface SocialLinks {
  instagram: string;
  twitter: string;
  spotify: string;
  facebook: string;
  google_review: string;
}

export default function Footer() {
  const pathname = usePathname();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "",
    twitter: "",
    spotify: "",
    facebook: "",
    google_review: "",
  });

  useEffect(() => {
    fetch("/api/footer")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.footer) setSocialLinks(d.data.footer);
      })
      .catch(() => {});
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const socials = [
    { key: "instagram", icon: InstagramIcon, label: "Instagram", hoverColor: "hover:text-[#E1306C]", link: socialLinks.instagram },
    { key: "twitter", icon: XIcon, label: "Twitter", hoverColor: "hover:text-[#000000]", link: socialLinks.twitter },
    { key: "spotify", icon: SpotifyIcon, label: "Spotify", hoverColor: "hover:text-[#1DB954]", link: socialLinks.spotify },
    { key: "facebook", icon: FacebookIcon, label: "Facebook", hoverColor: "hover:text-[#1877F2]", link: socialLinks.facebook },
    { key: "google_review", icon: GoogleIcon, label: "Google Reviews", hoverColor: "hover:text-[#4285F4]", link: socialLinks.google_review },
  ];

  return (
    <footer>
      {/* Top section */}
      <div className="bg-[#FFF9D6] border-t border-[#1a1a1a]/10 py-16 px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <Link href="/">
                <Image src="/clean_logo.png" alt="Wxrship The Fumes" width={80} height={80} className="h-16 w-auto" />
              </Link>
              <p className="mt-4 text-sm text-[#1a1a1a]/50">{BRAND.motto}</p>
            </div>

            {/* Link columns */}
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#1a1a1a]/50 hover:text-[#88AF00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="bg-[#C6FF00] px-6 md:px-12 lg:px-20 py-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {socials.map((s) => {
              const Icon = s.icon;
              if (!s.link) {
                return (
                  <span key={s.key} className="text-[#1a1a1a] hover:scale-110 transition-all duration-200" aria-label={s.label}>
                    <Icon size={20} />
                  </span>
                );
              }
              return (
                <a
                  key={s.key}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[#1a1a1a] ${s.hoverColor} hover:scale-110 transition-all duration-200`}
                  aria-label={s.label}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
          <a href={`mailto:${BRAND.email}`} className="text-sm text-[#1a1a1a] hover:text-[#1a1a1a]/70 transition-colors">
            {BRAND.email}
          </a>
          <p className="text-sm text-[#1a1a1a]/60">&copy; {BRAND.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
