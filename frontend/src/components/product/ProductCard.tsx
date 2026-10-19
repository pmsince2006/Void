import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Check } from 'lucide-react';
import { Product } from '../../types/product';
import { PriceDisplay } from '../common/PriceDisplay';
import { ProductBadge } from '../common/ProductBadge';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [quickSizeOpen, setQuickSizeOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '01 (S)');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isWishlisted = isInWishlist(product.id);

  const primaryImage = product.images[0] || '';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, product.colors[0]?.name || 'Standard', 1);
    setAddedAnimation(true);
    setQuickSizeOpen(false);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <article
      className={`group relative flex flex-col bg-transparent transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setQuickSizeOpen(false);
      }}
    >
      {/* Product Image Stage */}
      <div className="relative w-full aspect-[3/4] bg-[#E5E0D8] overflow-hidden border border-[#111111]/15 group-hover:border-[#111111] transition-colors">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          {!imgError ? (
            <img
              src={primaryImage}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#E5E0D8] text-[#111111]/80">
              <span className="font-heading font-extrabold text-2xl tracking-tighter">
                VOID
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest mt-2 text-[#777777]">
                {product.sku}
              </span>
            </div>
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.badge && (
            <ProductBadge
              type={product.badge}
              variant="bracket"
              size="sm"
              className="bg-[#F4F2ED]/90 backdrop-blur-sm border border-[#111111]/40"
            />
          )}
          {product.wave && (
            <span className="font-mono text-[9px] text-[#777777] bg-[#F4F2ED]/80 px-1 py-0.5 tracking-widest">
              {product.wave}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 flex items-center justify-center border transition-all duration-200 ${
            isWishlisted
              ? 'bg-[#111111] text-[#F4F2ED] border-[#111111]'
              : 'bg-[#F4F2ED]/90 text-[#111111] border-[#111111]/30 hover:border-[#111111] opacity-0 group-hover:opacity-100 focus:opacity-100'
          }`}
          aria-label={isWishlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-[#F4F2ED]/95 backdrop-blur-sm border-t border-[#111111] p-3 transition-transform duration-300 z-20 ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {quickSizeOpen ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#777777]">
                <span>SELECT SILHOUETTE SIZE</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickSizeOpen(false);
                  }}
                  className="hover:text-[#111111]"
                >
                  CANCEL
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(s);
                    }}
                    className={`text-[10px] font-mono py-1 border transition-colors ${
                      selectedSize === s
                        ? 'bg-[#111111] text-[#F4F2ED] border-[#111111]'
                        : 'border-[#111111]/20 hover:border-[#111111] text-[#111111]'
                    }`}
                  >
                    {s.split(' ')[0]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleQuickAdd}
                className="w-full py-1.5 bg-[#111111] text-[#F4F2ED] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#282828] transition-colors"
              >
                <span>CONFIRM // ADD [{selectedSize.split(' ')[0]}]</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (product.sizes.length > 1) {
                  setQuickSizeOpen(true);
                } else {
                  handleQuickAdd(e);
                }
              }}
              className="w-full py-2 bg-[#111111] text-[#F4F2ED] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#282828] transition-colors"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SECURED TO BAG</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>QUICK ACQUIRE</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Product Meta */}
      <div className="pt-3 pb-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            to={`/product/${product.slug}`}
            className="font-heading font-bold text-xs uppercase tracking-wider text-[#111111] hover:text-[#777777] transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <PriceDisplay price={product.price} size="sm" />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
          <span>{product.sku}</span>
          <span className="uppercase text-[10px] tracking-wider text-[#111111]/60">
            {product.collection}
          </span>
        </div>
      </div>
    </article>
  );
};
