import React from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { PriceDisplay } from '../common/PriceDisplay';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

export const WishlistDrawer: React.FC = () => {
  const { items, isOpen, closeWishlist, toggleWishlist, totalCount } = useWishlist();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/70 backdrop-blur-sm transition-opacity"
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#F4F2ED] border-l border-[#111111] h-full flex flex-col z-10 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-[#111111]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#111111]" />
            <h2 className="font-heading font-bold text-sm tracking-widest uppercase text-[#111111]">
              WATCHLIST ARCHIVE [{totalCount}]
            </h2>
          </div>
          <button
            onClick={closeWishlist}
            className="p-1 hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors"
            aria-label="Close watchlist drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border border-[#111111] flex items-center justify-center mb-3">
                <Heart className="w-5 h-5 text-[#777777]" />
              </div>
              <p className="font-heading font-bold text-sm uppercase tracking-wider text-[#111111] mb-1">
                ZERO SILHOUETTES WATCHED
              </p>
              <p className="text-xs font-mono text-[#777777] max-w-xs mb-6">
                Save pieces to your personal archive watchlist to monitor availability before waves sell out.
              </p>
              <Button variant="solid" size="sm" to="/shop" onClick={closeWishlist}>
                EXPLORE SILHOUETTES
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(({ product }) => (
                <div
                  key={product.id}
                  className="flex gap-4 border-b border-[#111111]/15 pb-6 last:border-b-0"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={closeWishlist}
                    className="w-20 h-24 bg-[#D6D1C8]/60 border border-[#111111]/20 shrink-0 overflow-hidden"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={closeWishlist}
                          className="font-heading font-bold text-xs uppercase tracking-wider text-[#111111] line-clamp-1 hover:text-[#777777]"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="text-[#777777] hover:text-red-700 transition-colors p-0.5"
                          aria-label="Remove from watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#777777] mt-1">
                        <span>{product.sku}</span>
                        <span>•</span>
                        <PriceDisplay price={product.price} size="sm" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full font-mono text-[10px]"
                        leftIcon={<ShoppingBag className="w-3 h-3" />}
                        onClick={() => {
                          addToCart(
                            product,
                            product.sizes[0] || '01 (S)',
                            product.colors[0]?.name || 'Standard',
                            1
                          );
                        }}
                      >
                        TRANSFER TO BAG
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
