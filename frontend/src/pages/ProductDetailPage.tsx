import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { Product } from '../types/product';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { ProductBadge } from '../components/common/ProductBadge';
import { SizeSelector } from '../components/common/SizeSelector';
import { ColorSelector } from '../components/common/ColorSelector';
import { QuantitySelector } from '../components/common/QuantitySelector';
import { Button } from '../components/common/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, Shield, Truck, Layers } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    if (slug) {
      productService.getProductBySlug(slug).then((item) => {
        if (isMounted) {
          setProduct(item);
          if (item) {
            setSelectedSize(item.sizes[0] || '');
            setSelectedColor(item.colors[0]?.name || '');
            // load related
            productService.getProducts({ category: item.category }).then((rel) => {
              if (isMounted) {
                setRelated(rel.filter((r) => r.id !== item.id).slice(0, 4));
              }
            });
          }
          setIsLoading(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 py-16 flex items-center justify-center">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[#777777]">
          TRANSMITTING SILHOUETTE DATA...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 py-20 text-center">
        <h2 className="font-heading font-bold text-2xl uppercase text-[#111111] mb-4">
          SILHOUETTE NOT FOUND IN ARCHIVE
        </h2>
        <Button to="/shop" variant="solid">
          RETURN TO DIRECTORY
        </Button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size specification.');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 py-10 sm:py-16">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'SHOP', href: '/shop' },
          { label: product.category, href: `/shop?category=${product.category}` },
          { label: product.name }
        ]}
        className="mb-8"
      />

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 pb-16 border-b border-[#111111]/20">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:w-24 shrink-0">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 md:w-full aspect-[3/4] border transition-all overflow-hidden ${
                  activeImageIndex === idx
                    ? 'border-[#111111] opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Primary Viewport */}
          <div className="flex-1 relative aspect-[3/4] bg-[#E5E0D8] border border-[#111111]/20 overflow-hidden">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {product.badge && (
              <div className="absolute top-4 left-4">
                <ProductBadge type={product.badge} variant="bracket" />
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-[#F4F2ED]/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#111111] border border-[#111111]/20">
              FRAME 0{activeImageIndex + 1} // 0{product.images.length}
            </div>
          </div>
        </div>

        {/* Right: Specifications & Acquire Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div>
            {/* Meta tags */}
            <div className="flex items-center justify-between text-xs font-mono text-[#777777] mb-2">
              <span>{product.sku}</span>
              <span className="uppercase text-[#111111] font-semibold">{product.drop}</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#111111] mb-2">
              {product.name}
            </h1>

            {product.subtitle && (
              <p className="font-mono text-xs text-[#777777] uppercase tracking-wider mb-4">
                {product.subtitle}
              </p>
            )}

            {/* Price */}
            <div className="pb-6 border-b border-[#111111]/20 mb-6">
              <PriceDisplay price={product.price} size="xl" showCurrencyCode />
            </div>

            {/* Editorial Description */}
            <p className="text-xs font-mono text-[#111111] leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Colorway Selector */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <ColorSelector
                  colors={product.colors}
                  selectedColor={selectedColor}
                  onSelectColor={setSelectedColor}
                />
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-6">
              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
              />
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase">
                QUANTITY
              </span>
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="solid"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? 'ACQUIRE PIECE // ADD TO BAG' : 'WAVE DEPLETED // ARCHIVED'}
              </Button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 border transition-colors flex items-center justify-center ${
                  isWishlisted
                    ? 'bg-[#111111] text-[#F4F2ED] border-[#111111]'
                    : 'border-[#111111] text-[#111111] hover:bg-black/5'
                }`}
                aria-label={isWishlisted ? 'Saved in Watchlist' : 'Add to Watchlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Technical Specs Accordion / Details */}
          <div className="border-t border-[#111111]/20 pt-6 space-y-4">
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#777777] mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#111111]" />
                ARCHITECTURAL SPECIFICATIONS
              </h4>
              <ul className="text-xs font-mono space-y-1.5 list-disc list-inside text-[#111111]/90">
                {product.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#777777] mb-1">
                COMPOSITION & FABRICATION
              </h4>
              <p className="text-xs font-mono text-[#111111]">
                {product.materials.join(' • ')}
              </p>
            </div>

            <div className="pt-2">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#777777] mb-1">
                PROPORTION & FIT
              </h4>
              <p className="text-xs font-mono text-[#111111]">
                {product.fit}
              </p>
            </div>

            {/* Protocol guarantees */}
            <div className="pt-4 border-t border-[#111111]/10 grid grid-cols-2 gap-4 text-[11px] font-mono text-[#777777]">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#111111]" />
                <span>SHIPPING ACROSS INDIA</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#111111]" />
                <span>AUTHENTICITY ARCHIVE KEY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Silhouettes */}
      {related.length > 0 && (
        <section className="pt-16">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#111111]">
            <h3 className="font-heading font-extrabold text-xl uppercase tracking-wider text-[#111111]">
              COMPANION ARCHIVE SILHOUETTES
            </h3>
            <Link
              to="/shop"
              className="text-xs font-mono uppercase tracking-wider text-[#777777] hover:text-[#111111]"
            >
              EXPLORE FULL DIRECTORY →
            </Link>
          </div>
          <ProductGrid products={related} columns={4} />
        </section>
      )}
    </div>
  );
};
