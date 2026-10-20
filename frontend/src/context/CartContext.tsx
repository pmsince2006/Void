import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { CartItem } from '../types/cart';
import { Product } from '../types/product';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'void_cart_state_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
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
        let guestItems: CartItem[] = [];
        try {
          const raw = localStorage.getItem(CART_STORAGE_KEY);
          if (raw) guestItems = JSON.parse(raw);
        } catch {
          guestItems = [];
        }

        if (Array.isArray(guestItems) && guestItems.length > 0) {
          cartService
            .mergeCart(
              guestItems.map((item) => ({
                productId: item.productId,
                size: item.size,
                color: item.color,
                quantity: item.quantity
              }))
            )
            .then((serverCart) => {
              if (thisVersion !== syncVersionRef.current) return;
              // Only remove guest storage after merge confirmation from server
              try {
                localStorage.removeItem(CART_STORAGE_KEY);
              } catch {
                // ignore
              }
              setItems(serverCart.items);
            })
            .catch((err) => {
              console.error('Failed to merge guest bag with account:', err);
              // Fallback to fetching current server cart without wiping guest storage
              cartService.getCart().then((serverCart) => {
                if (thisVersion === syncVersionRef.current) {
                  setItems(serverCart.items);
                }
              }).catch(() => {});
            });
        } else {
          // No guest items in storage, directly fetch authenticated user's cart from MongoDB
          cartService
            .getCart()
            .then((serverCart) => {
              if (thisVersion === syncVersionRef.current) {
                setItems(serverCart.items);
              }
            })
            .catch((err) => {
              console.error('Failed to fetch user cart:', err);
            });
        }
      }
      return;
    }

    // 2. User logged in from guest state
    if (prevUserId === null && currentUserId !== null) {
      lastUserIdRef.current = currentUserId;

      let guestItems: CartItem[] = [];
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) guestItems = JSON.parse(raw);
      } catch {
        guestItems = [];
      }

      if (Array.isArray(guestItems) && guestItems.length > 0) {
        cartService
          .mergeCart(
            guestItems.map((item) => ({
              productId: item.productId,
              size: item.size,
              color: item.color,
              quantity: item.quantity
            }))
          )
          .then((serverCart) => {
            if (thisVersion !== syncVersionRef.current) return;
            try {
              localStorage.removeItem(CART_STORAGE_KEY);
            } catch {
              // ignore
            }
            setItems(serverCart.items);
          })
          .catch((err) => {
            console.error('Failed to merge guest cart on login:', err);
            cartService.getCart().then((serverCart) => {
              if (thisVersion === syncVersionRef.current) {
                setItems(serverCart.items);
              }
            }).catch(() => {});
          });
      } else {
        cartService
          .getCart()
          .then((serverCart) => {
            if (thisVersion === syncVersionRef.current) {
              setItems(serverCart.items);
            }
          })
          .catch((err) => {
            console.error('Failed to load user cart on login:', err);
          });
      }
      return;
    }

    // 3. User logged out (decoupled session)
    if (prevUserId !== null && currentUserId === null) {
      lastUserIdRef.current = null;
      setItems([]);
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }

    // 4. Account switch (User A to User B)
    if (prevUserId !== null && currentUserId !== null && prevUserId !== currentUserId) {
      lastUserIdRef.current = currentUserId;
      cartService
        .getCart()
        .then((serverCart) => {
          if (thisVersion === syncVersionRef.current) {
            setItems(serverCart.items);
          }
        })
        .catch((err) => {
          console.error('Failed to switch user cart:', err);
        });
    }
  }, [authLoading, user]);

  // Persist guest cart to localStorage (NEVER write authenticated data to localStorage)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // storage unavailable
      }
    }
  }, [items, isAuthenticated, authLoading]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addToCart = useCallback(
    async (product: Product, size: string, color: string, quantity: number = 1) => {
      const itemId = `${product.id}-${size}-${color}`;

      if (isAuthenticated) {
        setIsOpen(true);
        addToast(`${product.name} [${size}] added to archive bag.`, 'success', 'BAG UPDATED');
        try {
          const serverCart = await cartService.addItem(product.id, size, color, quantity);
          setItems(serverCart.items);
        } catch (err: any) {
          addToast(err?.message || 'Failed to update bag in archive', 'error', 'BAG ERROR');
        }
      } else {
        setItems((prev) => {
          const existingIndex = prev.findIndex((item) => item.id === itemId);
          if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity
            };
            return updated;
          } else {
            return [
              ...prev,
              {
                id: itemId,
                productId: product.id,
                product,
                size,
                color,
                quantity
              }
            ];
          }
        });

        addToast(`${product.name} [${size}] added to archive bag.`, 'success', 'BAG UPDATED');
        setIsOpen(true);
      }
    },
    [isAuthenticated, addToast]
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        // Optimistically remove locally for instant UI response
        setItems((prev) => prev.filter((item) => item.id !== id));
        addToast('Piece removed from bag.', 'info');
        try {
          const serverCart = await cartService.removeItem(id);
          setItems(serverCart.items);
        } catch (err: any) {
          addToast(err?.message || 'Failed to remove piece from bag', 'error');
          // Re-fetch to restore accurate state
          try {
            const current = await cartService.getCart();
            setItems(current.items);
          } catch {
            // ignore
          }
        }
      } else {
        setItems((prev) => prev.filter((item) => item.id !== id));
        addToast('Piece removed from bag.', 'info');
      }
    },
    [isAuthenticated, addToast]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }

      if (isAuthenticated) {
        // Optimistic update for fluid UI slider/counter
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
        try {
          const serverCart = await cartService.updateQuantity(id, quantity);
          setItems(serverCart.items);
        } catch (err: any) {
          addToast(err?.message || 'Failed to update quantity', 'error');
          try {
            const current = await cartService.getCart();
            setItems(current.items);
          } catch {
            // ignore
          }
        }
      } else {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
      }
    },
    [isAuthenticated, removeFromCart, addToast]
  );

  const clearCart = useCallback(
    async () => {
      if (isAuthenticated) {
        setItems([]);
        try {
          const serverCart = await cartService.clearCart();
          setItems(serverCart.items);
        } catch (err: any) {
          addToast(err?.message || 'Failed to clear bag', 'error');
        }
      } else {
        setItems([]);
        try {
          localStorage.removeItem(CART_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated, addToast]
  );

  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
