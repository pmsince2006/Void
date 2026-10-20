import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { PriceDisplay } from '../common/PriceDisplay';
import { QuantitySelector } from '../common/QuantitySelector';
import { Button } from '../common/Button';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalCount,
    subtotal
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#F4F2ED] border-l border-[#111111] h-full flex flex-col z-10 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#111111]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#111111]" />
            <h2 className="font-heading font-bold text-sm tracking-widest uppercase text-[#111111]">
              ARCHIVE BAG [{totalCount}]
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1 hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border border-[#111111] flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5 text-[#777777]" />
              </div>
              <p className="font-heading font-bold text-sm uppercase tracking-wider text-[#111111] mb-1">
                BAG IS CURRENTLY VACANT
              </p>
              <p className="text-xs font-mono text-[#777777] max-w-xs mb-6">
                Your archive inventory is empty. Explore DROP 01 silhouettes to secure limited pieces.
              </p>
              <Button variant="solid" size="sm" to="/shop" onClick={closeCart}>
                EXPLORE DROP 01
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-[#111111]/15 pb-6 last:border-b-0"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-[#D6D1C8]/60 border border-[#111111]/20 shrink-0 overflow-hidden">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#111111] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#777777] hover:text-red-700 transition-colors p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-[#777777] mt-1">
                        <span>SIZE: {item.size}</span>
                        <span>•</span>
                        <span>{item.color}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <QuantitySelector
                        size="sm"
                        quantity={item.quantity}
                        onChange={(qty) => updateQuantity(item.id, qty)}
                      />
                      <PriceDisplay price={item.product.price * item.quantity} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#111111] space-y-4 bg-[#F4F2ED]">
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#777777]">
                <span>ARCHIVE ALLOCATION:</span>
                <span>{totalCount} ITEMS</span>
              </div>
              <div className="flex justify-between text-[#777777]">
                <span>SHIPPING ACROSS INDIA:</span>
                <span className="text-emerald-700 uppercase">[ COMPLIMENTARY ]</span>
              </div>
              <div className="flex justify-between text-[#111111] font-bold text-sm pt-2 border-t border-[#111111]/15">
                <span>TOTAL VALUATION:</span>
                <PriceDisplay price={subtotal} size="lg" />
              </div>
            </div>

            <Button
              variant="solid"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                alert('VOID CHECKOUT TRANSMISSION INITIALIZED // All items held for 15 minutes.');
              }}
            >
              PROCEED TO SECURE CHECKOUT
            </Button>

            <p className="text-[10px] font-mono text-center text-[#777777] uppercase tracking-wider">
              ZERO RESTOCKS • ALL DROPS ENCRYPTED & NUMBERED
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
