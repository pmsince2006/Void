import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { WishlistItem } from '../types/cart';
import { Product } from '../types/product';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Tracks authentication lifecycle transitions (guest -> logged in, logged in -> logged out, user switches)
  const lastUserIdRef = useRef<string | null | undefined>(undefined);
  const syncVersionRef = useRef<number>(0);

  // Sync / merge logic when auth state resolves or changes
  useEffect(() => {
    if (authLoading) return; // Wait until initial /me auth check resolves

    const currentUserId = user?.id || null;
    const prevUserId = lastUserIdRef.current;
    syncVersionRef.current += 1;
    const thisVersion = syncVersionRef.current;

    // 1. Initial resolution on page load
    if (prevUserId === undefined) {
      lastUserIdRef.current = currentUserId;

      if (currentUserId !== null) {
        // Authenticated user on initial load: check if guest items need merging
        let guestItems: WishlistItem[] = [];
        try {
          const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
          if (raw) guestItems = JSON.parse(raw);
        } catch {
          guestItems = [];
        }

        if (Array.isArray(guestItems) && guestItems.length > 0) {
          const productIds = guestItems
            .map((item) => item.productId || item.product?.id)
            .filter(Boolean);

          wishlistService
            .mergeWishlist(productIds)
            .then((serverWishlist) => {
              if (thisVersion !== syncVersionRef.current) return;
              // Only remove guest storage after merge confirmation from server
              try {
                localStorage.removeItem(WISHLIST_STORAGE_KEY);
              } catch {
                // ignore
              }
              setItems(serverWishlist.items);
            })
            .catch((err) => {
              console.error('Failed to merge guest watchlist with account:', err);
              // Fallback to fetching current server watchlist without wiping guest storage
              wishlistService.getWishlist().then((serverWishlist) => {
                if (thisVersion === syncVersionRef.current) {
                  setItems(serverWishlist.items);
                }
              }).catch(() => {});
            });
        } else {
          // No guest items in storage, directly fetch authenticated user's watchlist from MongoDB
          wishlistService
            .getWishlist()
            .then((serverWishlist) => {
              if (thisVersion === syncVersionRef.current) {
                setItems(serverWishlist.items);
              }
            })
            .catch((err) => {
              console.error('Failed to fetch user watchlist:', err);
            });
        }
      }
      return;
    }

    // 2. User logged in from guest state
    if (prevUserId === null && currentUserId !== null) {
      lastUserIdRef.current = currentUserId;

      let guestItems: WishlistItem[] = [];
      try {
        const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (raw) guestItems = JSON.parse(raw);
      } catch {
        guestItems = [];
      }

      if (Array.isArray(guestItems) && guestItems.length > 0) {
        const productIds = guestItems
          .map((item) => item.productId || item.product?.id)
          .filter(Boolean);

        wishlistService
          .mergeWishlist(productIds)
          .then((serverWishlist) => {
            if (thisVersion !== syncVersionRef.current) return;
            try {
              localStorage.removeItem(WISHLIST_STORAGE_KEY);
            } catch {
              // ignore
            }
            setItems(serverWishlist.items);
          })
          .catch((err) => {
            console.error('Failed to merge guest watchlist on login:', err);
            wishlistService.getWishlist().then((serverWishlist) => {
              if (thisVersion === syncVersionRef.current) {
                setItems(serverWishlist.items);
              }
            }).catch(() => {});
          });
      } else {
        wishlistService
          .getWishlist()
          .then((serverWishlist) => {
            if (thisVersion === syncVersionRef.current) {
              setItems(serverWishlist.items);
            }
          })
          .catch((err) => {
            console.error('Failed to load user watchlist on login:', err);
          });
      }
      return;
    }

    // 3. User logged out (decoupled session)
    if (prevUserId !== null && currentUserId === null) {
      lastUserIdRef.current = null;
      setItems([]);
      try {
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }

    // 4. Account switch (User A to User B)
    if (prevUserId !== null && currentUserId !== null && prevUserId !== currentUserId) {
      lastUserIdRef.current = currentUserId;
      wishlistService
        .getWishlist()
        .then((serverWishlist) => {
          if (thisVersion === syncVersionRef.current) {
            setItems(serverWishlist.items);
          }
        })
        .catch((err) => {
          console.error('Failed to switch user watchlist:', err);
        });
    }
  }, [authLoading, user]);

  // Persist guest watchlist to localStorage (NEVER write authenticated data to localStorage)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // storage unavailable
      }
    }
  }, [items, isAuthenticated, authLoading]);

  const openWishlist = useCallback(() => setIsOpen(true), []);
  const closeWishlist = useCallback(() => setIsOpen(false), []);
  const toggleWishlistDrawer = useCallback(() => setIsOpen((prev) => !prev), []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    async (product: Product) => {
      const exists = items.some((item) => item.productId === product.id);

      if (isAuthenticated) {
        // Optimistic UI update
        if (exists) {
          setItems((prev) => prev.filter((item) => item.productId !== product.id));
          addToast(`${product.name} removed from saved archive.`, 'info');
        } else {
          setItems((prev) => [
            ...prev,
            {
              productId: product.id,
              product,
              addedAt: new Date().toISOString()
            }
          ]);
          addToast(`${product.name} saved to archive watchlist.`, 'success', 'WATCHLIST');
        }

        try {
          const res = await wishlistService.toggleItem(product.id);
          setItems(res.wishlist.items);
        } catch (err: any) {
          addToast(err?.message || 'Failed to update watchlist in archive', 'error');
          // Re-fetch to restore database state
          try {
            const current = await wishlistService.getWishlist();
            setItems(current.items);
          } catch {
            // ignore
          }
        }
      } else {
        if (exists) {
          addToast(`${product.name} removed from saved archive.`, 'info');
          setItems((prev) => prev.filter((item) => item.productId !== product.id));
        } else {
          addToast(`${product.name} saved to archive watchlist.`, 'success', 'WATCHLIST');
          setItems((prev) => [
            ...prev,
            {
              productId: product.id,
              product,
              addedAt: new Date().toISOString()
            }
          ]);
        }
      }
    },
    [isAuthenticated, items, addToast]
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
