import { apiClient } from './api';
import { CartItem } from '../types/cart';

export interface CartResponse {
  status: string;
  message?: string;
  cart: {
    items: CartItem[];
    totalCount: number;
    subtotal: number;
  };
}

export interface GuestCartPayloadItem {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export const cartService = {
  /**
   * Retrieves the authenticated user's cart populated with live database prices.
   */
  async getCart(): Promise<CartResponse['cart']> {
    const res = await apiClient<CartResponse>('/cart');
    return res.cart;
  },

  /**
   * Adds a variant or increments its quantity in the user's cart.
   */
  async addItem(productId: string, size: string, color: string, quantity: number = 1): Promise<CartResponse['cart']> {
    const res = await apiClient<CartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, size, color, quantity })
    });
    return res.cart;
  },

  /**
   * Updates a variant's quantity in the user's cart. Quantity <= 0 removes it.
   */
  async updateQuantity(id: string, quantity: number): Promise<CartResponse['cart']> {
    const res = await apiClient<CartResponse>('/cart/items', {
      method: 'PUT',
      body: JSON.stringify({ id, quantity })
    });
    return res.cart;
  },

  /**
   * Removes a specific variant by composite ID `${productId}-${size}-${color}`.
   */
  async removeItem(id: string): Promise<CartResponse['cart']> {
    const res = await apiClient<CartResponse>(`/cart/items/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.cart;
  },

  /**
   * Clears the user's cart in MongoDB.
   */
  async clearCart(): Promise<CartResponse['cart']> {
    const res = await apiClient<CartResponse>('/cart', {
      method: 'DELETE'
    });
    return res.cart;
  },

  /**
   * Merges guest cart items into the authenticated user's cart in MongoDB.
   */
  async mergeCart(items: GuestCartPayloadItem[]): Promise<CartResponse['cart']> {
    const res = await apiClient<CartResponse>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
    return res.cart;
  }
};
