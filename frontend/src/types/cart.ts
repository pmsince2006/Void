import { Product } from './product';

export interface CartItem {
  id: string; // unique item id (product.id + size + color)
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export interface Collection {
  id: string;
  title: string;
  code: string;
  description: string;
  season: string;
  itemCount: number;
  heroImage: string;
  thumbnail: string;
  slug: string;
}
