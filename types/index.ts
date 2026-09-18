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

export type ColorScheme = "dark" | "light" | "acid" | "pink";

export interface SchemeConfig {
  bg: string;
  secondaryBg: string;
  text: string;
  accent: string;
  border: string;
}
