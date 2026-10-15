export const CATEGORIES = ['masculino', 'feminino', 'infantil', 'esportivo'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  category: Category;
  price: number;
  wholesalePrice: number | null;
  sizes: string[];
  featured: boolean;
  isNew: boolean;
  imageUrl: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  createdAt: string;
}

export interface StoreInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  latitude: number;
  longitude: number;
  facebook: string;
  instagram: string;
  hours: { days: string; time: string }[];
  stats: { value: number; suffix?: string; label: string }[];
}

export interface Review {
  id: string;
  author: string;
  city: string;
  rating: number;
  text: string;
  featured: boolean;
  createdAt: string;
}

export interface WholesaleLead {
  id: string;
  name: string;
  city: string;
  whatsapp: string;
  cnpj: string | null;
  message: string;
  status: 'novo' | 'contatado' | 'fechado';
  createdAt: string;
}

export interface ProductFilters {
  category?: Category;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}
