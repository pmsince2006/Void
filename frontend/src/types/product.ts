export type ProductCategory = 
  | 'uppers' 
  | 'bottoms' 
  | 'shoes' 
  | 'accessories';

export type ProductBadgeType = 
  | 'DROP 01' 
  | 'ARCHIVE' 
  | 'LIMITED' 
  | 'NEW ARRIVAL' 
  | 'SOLDOUT';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  sku: string;
  slug: string;
  category: ProductCategory;
  collection: string;
  drop: string;
  wave: string;
  price: number;
  currency: string;
  originalPrice?: number;
  description: string;
  editorialDescription?: string;
  details: string[];
  materials: string[];
  fit: string;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  badge?: ProductBadgeType;
  inStock: boolean;
  stockCount?: number;
  isFeatured: boolean;
  isNewDrop: boolean;
  releaseStatus: 'unlocked' | 'incoming' | 'archived';
  releaseDate?: string;
}

export interface ProductFilterParams {
  category?: string;
  collection?: string;
  drop?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
}
