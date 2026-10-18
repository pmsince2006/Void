import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '../types/cart';
import { Product } from '../types/product';
import { useToast } from './ToastContext';

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
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addToCart = useCallback(
    (product: Product, size: string, color: string, quantity: number = 1) => {
      const itemId = `${product.id}-${size}-${color}`;
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
    },
    [addToast]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      addToast('Piece removed from bag.', 'info');
    },
    [addToast]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

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
