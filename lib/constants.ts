import { NavLink, Product, Review, ValueProp, FooterColumn, SchemeConfig, ColorScheme } from "@/types";

export const BRAND = {
  name: "Worship The Fumes",
  shortName: "WTF",
  motto: "Weird is a choice.",
  email: "hello@worshipthefumes.com",
  copyright: "2026 Worship The Fumes. Weird is a choice.",
} as const;

export const COLORS = {
  neutral: "#FFF9D6",
  acid: "#C6FF00",
  toxic: "#FF2E88",
  violet: "#7C3AED",
  white: "#F5F5F5",
  surface: "#FFF3B0",
} as const;

export const SCHEMES: Record<ColorScheme, SchemeConfig> = {
  dark: {
    bg: "bg-[#FFF9D6]",
    secondaryBg: "bg-[#FFF3B0]",
    text: "text-[#1a1a1a]",
    accent: "text-[#88AF00]",
    border: "border-[#1a1a1a]/10",
  },
  light: {
    bg: "bg-[#FFF9D6]",
    secondaryBg: "bg-[#FFF3B0]",
    text: "text-[#1a1a1a]",
    accent: "text-[#88AF00]",
    border: "border-[#1a1a1a]/10",
  },
  acid: {
    bg: "bg-[#88AF00]",
    secondaryBg: "bg-[#6F8E00]",
    text: "text-[#1a1a1a]",
    accent: "text-[#1a1a1a]",
    border: "border-[#1a1a1a]/10",
  },
  pink: {
    bg: "bg-[#DF2877]",
    secondaryBg: "bg-[#FF2E88]",
    text: "text-white",
    accent: "text-[#C6FF00]",
    border: "border-white/20",
  },
};

export const NAV_LINKS: NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "/contact" },
];

export const PRODUCTS: Product[] = [
  { id: "1", name: "Acid Rain", dropLabel: "Drop 01", number: "#01", price: 89, image: "/eg.jpg", category: "Hoodies" },
  { id: "2", name: "Static", dropLabel: "Drop 01", number: "#02", price: 59, image: "/eg.jpg", category: "Tees" },
  { id: "3", name: "Gutter Glory", dropLabel: "Drop 01", number: "#03", price: 65, image: "/eg.jpg", category: "Tees" },
  { id: "4", name: "Fever Dream", dropLabel: "Drop 01", number: "#04", price: 72, image: "/eg.jpg", category: "Hoodies" },
  { id: "5", name: "Low Battery", dropLabel: "Drop 01", number: "#05", price: 55, image: "/eg.jpg", category: "Tees" },
  { id: "6", name: "Rat King", dropLabel: "Drop 01", number: "#06", price: 68, image: "/eg.jpg", category: "Hoodies" },
];

export const REVIEWS: Review[] = [
  {
    id: "1",
    name: "Jake R.",
    avatar: "/avatars/01.jpg",
    rating: 5,
    text: "This hoodie hits different. The weight, the print, the whole vibe — nothing else comes close.",
    dropLabel: "Drop 01",
    verified: true,
  },
  {
    id: "2",
    name: "Mia S.",
    avatar: "/avatars/02.jpg",
    rating: 5,
    text: "Wore the Fume Walker to a show and got stopped three times. WTF gets it.",
    dropLabel: "Drop 01",
    verified: true,
  },
  {
    id: "3",
    name: "Devon K.",
    avatar: "/avatars/03.jpg",
    rating: 5,
    text: "Finally a brand that doesn't try to be everything for everyone. Weird is the point.",
    dropLabel: "Drop 01",
    verified: true,
  },
];

export const VALUE_PROPS: ValueProp[] = [
  {
    icon: "Flame",
    title: "Limited drops",
    description: "Every piece is part of a numbered drop. When it's gone, it's gone. No restocks, no regrets.",
  },
  {
    icon: "Brush",
    title: "Original art",
    description: "Every design is original — drawn, not templated. You won't see this anywhere else.",
  },
  {
    icon: "Users",
    title: "A cult, not a customer base",
    description: "We don't have customers. We have believers. Join the movement or watch from the outside.",
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop the Drop", href: "/shop" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const CATEGORIES = ["All", "Hoodies", "Tees", "Accessories"] as const;
export type Category = (typeof CATEGORIES)[number];
