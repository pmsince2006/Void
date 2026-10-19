import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export interface LandingHeroProps {
  onExploreClick?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onExploreClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { totalCount, openCart } = useCart();

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full relative bg-[#F0F0ED] text-[#0B0B0B] border-b border-[#0B0B0B]/10 overflow-hidden fine-grain-overlay">
      
      {/* =========================================================================
          INTEGRATED MINIMAL NAVIGATION BAR (FULL WIDTH)
          ========================================================================= */}
      <header className="w-full border-b border-[#0B0B0B]/10">
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 py-5 sm:py-6 flex items-center justify-between">
          
          {/* Brand Wordmark */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter uppercase text-[#0B0B0B] hover:opacity-80 transition-opacity"
            >
              VOID<span className="text-[#777777]">.</span>
            </Link>
            <span className="hidden xl:inline-block font-mono text-[10px] uppercase tracking-widest text-[#777777] border-l border-[#0B0B0B]/15 pl-6">
              EDITORIAL ATELIER // UNISEX SILHOUETTES
            </span>
          </div>

          {/* Center / Right Minimal Navigation */}
          <nav className="hidden md:flex items-center space-x-10" aria-label="Landing Navigation">
            <button
              onClick={() => scrollToSection('collection-grid')}
              className="text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#0B0B0B] transition-colors py-1 cursor-pointer"
            >
              COLLECTION
            </button>
            <button
              onClick={() => scrollToSection('statement-banner')}
              className="text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#0B0B0B] transition-colors py-1 cursor-pointer"
            >
              MANIFESTO
            </button>
            <button
              onClick={() => scrollToSection('drop-announcement')}
              className="text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#0B0B0B] transition-colors py-1 cursor-pointer"
            >
              DROP 01
            </button>
            <button
              onClick={() => scrollToSection('lookbook-strip')}
              className="text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#0B0B0B] transition-colors py-1 cursor-pointer"
            >
              LOOKBOOK
            </button>
          </nav>

          {/* Utility Actions */}
          <div className="hidden sm:flex items-center space-x-6 text-xs font-mono">
            <Link
              to="/shop"
              className="text-[#777777] hover:text-[#0B0B0B] uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              <span>SHOP ALL</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 border border-[#0B0B0B] px-3.5 py-1.5 hover:bg-[#0B0B0B] hover:text-[#F0F0ED] transition-colors uppercase text-[11px] font-mono tracking-wider cursor-pointer"
              aria-label={`Open shopping bag with ${totalCount} items`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>BAG [{totalCount}]</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={openCart}
              className="border border-[#0B0B0B] px-2.5 py-1 text-xs font-mono uppercase"
              aria-label="Open bag"
            >
              BAG [{totalCount}]
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#0B0B0B] hover:opacity-70 transition-opacity"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-[#F0F0ED] border-b border-[#0B0B0B] px-6 py-6 animate-fade-in flex flex-col space-y-4 font-mono text-sm z-30">
          <button
            onClick={() => scrollToSection('collection-grid')}
            className="text-left py-2 border-b border-[#0B0B0B]/10 uppercase tracking-widest text-[#0B0B0B]"
          >
            01 // COLLECTION
          </button>
          <button
            onClick={() => scrollToSection('statement-banner')}
            className="text-left py-2 border-b border-[#0B0B0B]/10 uppercase tracking-widest text-[#0B0B0B]"
          >
            02 // MANIFESTO
          </button>
          <button
            onClick={() => scrollToSection('drop-announcement')}
            className="text-left py-2 border-b border-[#0B0B0B]/10 uppercase tracking-widest text-[#0B0B0B]"
          >
            03 // DROP 01
          </button>
          <button
            onClick={() => scrollToSection('lookbook-strip')}
            className="text-left py-2 border-b border-[#0B0B0B]/10 uppercase tracking-widest text-[#0B0B0B]"
          >
            04 // LOOKBOOK
          </button>
          <Link
            to="/shop"
            className="text-left py-2 text-[#777777] uppercase tracking-widest flex items-center justify-between"
          >
            <span>FULL ARCHIVE SHOP</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* =========================================================================
          HERO MAIN STAGE: MINIMAL LUXURY EDITORIAL COMPOSITION
          ========================================================================= */}
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 py-12 sm:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Bold Typography & Simplified Copy */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 z-10">
            
            {/* Editorial micro label */}
            <div className="flex items-center gap-3 text-xs font-mono text-[#777777] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#0B0B0B] inline-block" />
              <span>DROP 01 // HORIZON</span>
              <span>•</span>
              <span className="text-[#0B0B0B] font-semibold">AUTUMN / WINTER</span>
            </div>

            {/* Oversized Fashion Headline */}
            <div className="space-y-1">
              <h1 className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl xl:text-[6.8rem] uppercase tracking-tighter text-[#0B0B0B] leading-[0.87] select-none">
                VOID IS NOT<br />
                JUST WHAT<br />
                <span className="text-[#0B0B0B]">YOU WEAR.</span>
              </h1>
            </div>

            {/* Supporting Copy - Short, Natural & Premium */}
            <div className="max-w-xl space-y-3 pt-1">
              <p className="font-heading font-bold text-xs sm:text-sm uppercase tracking-widest text-[#0B0B0B]">
                Contemporary streetwear. Made to stand apart.
              </p>
              <p className="font-mono text-xs sm:text-[13px] text-[#777777] leading-relaxed">
                Clean architectural cuts, dropped shoulders, and volumetric drape. Designed for everyday presence.
              </p>
            </div>

            {/* Action Group: Pill CTA + Direct Shop Link */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-6">
              <button
                type="button"
                onClick={() => {
                  if (onExploreClick) onExploreClick();
                  scrollToSection('collection-grid');
                }}
                className="editorial-pill text-xs py-3.5 px-9 hover:shadow-md cursor-pointer"
              >
                Explore Collection
              </button>

              <Link
                to="/shop"
                className="font-mono text-xs uppercase tracking-widest text-[#0B0B0B] hover:text-[#777777] flex items-center gap-2 transition-colors font-semibold"
              >
                <span>Shop New Arrivals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tagline Meta */}
            <div className="pt-8 border-t border-[#0B0B0B]/10 flex items-center justify-between text-xs font-mono text-[#777777]">
              <span className="uppercase tracking-wider">
                TAGLINE: <strong className="text-[#0B0B0B]">"WEAR YOUR OWN IDENTITY."</strong>
              </span>
              <span className="hidden sm:inline-block uppercase tracking-wider">
                UNISEX SILHOUETTES
              </span>
            </div>

          </div>

          {/* Right Column: High-Fashion Editorial Model (Full Height & Natural Depth) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-none aspect-[3/4.2] bg-[#D1D3D2] border border-[#0B0B0B]/25 overflow-hidden group shadow-lg">
              
              {/* Full-color Fashion Photography: realistic skin tones and dark fabric texture */}
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85"
                alt="VOID Contemporary Unisex Streetwear Silhouette"
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-cover object-top transition-all duration-1000 ease-out group-hover:scale-105 ${
                  imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />

              {/* Minimalist Look Label */}
              <div className="absolute top-4 left-4 bg-[#0B0B0B] text-[#F0F0ED] px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                LOOK 01 // OVERSIZED SHELL
              </div>

              {/* Bottom Garment Meta */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#F0F0ED]/95 backdrop-blur-sm p-4 border border-[#0B0B0B]/20 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#777777] uppercase block tracking-wider">
                    FEATURED SILHOUETTE
                  </span>
                  <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#0B0B0B]">
                    BALLISTIC MONOLITH PARKA
                  </span>
                </div>
                <Link
                  to="/product/ballistic-monolith-parka"
                  className="font-mono text-[10px] font-bold text-[#0B0B0B] hover:text-[#777777] flex items-center gap-1 uppercase"
                >
                  <span>VIEW</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>

    </section>
  );
};
