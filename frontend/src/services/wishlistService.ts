import { apiClient } from './api';
import { WishlistItem } from '../types/cart';

export interface WishlistResponse {
  status: string;
  action?: 'added' | 'removed';
  message?: string;
  wishlist: {
    items: WishlistItem[];
    totalCount: number;
  };
}

export const wishlistService = {
  /**
   * Retrieves the authenticated user's saved wishlist pieces from MongoDB.
   */
  async getWishlist(): Promise<WishlistResponse['wishlist']> {
    const res = await apiClient<WishlistResponse>('/wishlist');
    return res.wishlist;
  },

  /**
   * Toggles a piece in the authenticated user's archive watchlist.
   */
  async toggleItem(productId: string): Promise<WishlistResponse> {
    const res = await apiClient<WishlistResponse>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    return res;
  },

  /**
   * Merges guest wishlist product IDs into the authenticated user's wishlist in MongoDB.
   */
  async mergeWishlist(productIds: string[]): Promise<WishlistResponse['wishlist']> {
    const res = await apiClient<WishlistResponse>('/wishlist/merge', {
      method: 'POST',
      body: JSON.stringify({ productIds })
    });
    return res.wishlist;
  }
};
