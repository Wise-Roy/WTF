export interface NavLink {
  label: string;
  href: string;
}

export interface Product {
  id: string;
  name: string;
  dropLabel: string;
  number: string;
  price: number;
  salePrice?: number;
  isSoldOut?: boolean;
  currency?: string;
  image: string;
  category: string;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  dropLabel: string;
  verified: boolean;
}

export interface ValueProp {
  icon: string;
  title: string;
  description: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export type ColorScheme = "dark" | "light" | "acid" | "pink" | "grey";

export interface SchemeConfig {
  bg: string;
  secondaryBg: string;
  text: string;
  accent: string;
  border: string;
}

/** Database product — matches the `products` table */
export interface DbProduct {
  id: string;
  image: string[];          // exactly 3 URLs
  prod_name: string;
  prod_price: number;
  prod_quantity: number;
  prod_description: string;
  prod_label: string;
  prod_rank: number;
  created_at: string;
  updated_at: string;
}
