import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WishlistItem } from '../types/cart';
import { Product } from '../types/product';
import { useToast } from './ToastContext';

interface WishlistContextType {
  items: WishlistItem[];
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  totalCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'void_wishlist_state_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }, [items]);

  const openWishlist = useCallback(() => setIsOpen(true), []);
  const closeWishlist = useCallback(() => setIsOpen(false), []);
  const toggleWishlistDrawer = useCallback(() => setIsOpen((prev) => !prev), []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      setItems((prev) => {
        const exists = prev.some((item) => item.productId === product.id);
        if (exists) {
          addToast(`${product.name} removed from saved archive.`, 'info');
          return prev.filter((item) => item.productId !== product.id);
        } else {
          addToast(`${product.name} saved to archive watchlist.`, 'success', 'WATCHLIST');
          return [
            ...prev,
            {
              productId: product.id,
              product,
              addedAt: new Date().toISOString()
            }
          ];
        }
      });
    },
    [addToast]
  );

  const totalCount = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        isOpen,
        openWishlist,
        closeWishlist,
        toggleWishlistDrawer,
        toggleWishlist,
        isInWishlist,
        totalCount
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
