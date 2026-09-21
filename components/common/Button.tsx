"use client";

import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}

export default function Button({
  children,
  href,
  variant = "primary",
  type = "button",
  onClick,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-200";

  const variants = {
    primary: "bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#d4ff33]",
    secondary:
      "border border-[#1a1a1a]/20 text-[#1a1a1a] hover:border-[#88AF00] hover:text-[#88AF00]",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
