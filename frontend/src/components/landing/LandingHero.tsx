import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export interface LandingHeroProps {
  onExploreClick?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onExploreClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative bg-[#F0F0ED] text-[#0B0B0B] border border-[#202020]/25 overflow-hidden shadow-2xl fine-grain-overlay">
      
      {/* =========================================================================
          INTEGRATED COMPACT TOP NAVIGATION BAR
          ========================================================================= */}
      <header className="w-full border-b border-[#0B0B0B]/15 px-6 sm:px-10 lg:px-12 py-5 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter uppercase text-[#0B0B0B] hover:opacity-75 transition-opacity"
          >
            VOID<span className="text-[#777777]">.</span>
          </Link>
          <span className="hidden xl:inline-block font-mono text-[10px] uppercase tracking-widest text-[#777777] border-l border-[#0B0B0B]/20 pl-6">
            EDITORIAL ATELIER // UNISEX ARCHIVE
          </span>
        </div>

        {/* Center / Right Minimal Navigation */}
        <nav className="hidden md:flex items-center space-x-8" aria-label="Landing Navigation">
          <button
            onClick={() => scrollToSection('collection-grid')}
            className="text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#0B0B0B] transition-colors relative py-1"
          >
            COLLECTION
          </button>
          <button
            onClick={() => scrollToSection('statement-banner')}
            className="text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#0B0B0B] transition-colors relative py-1"
          >
            MANIFESTO
          </button>
          <button
            onClick={() => scrollToSection('drop-announcement')}
            className="text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#0B0B0B] transition-colors relative py-1"
          >
            DROP 01
          </button>
          <button
            onClick={() => scrollToSection('lookbook-strip')}
            className="text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#0B0B0B] transition-colors relative py-1"
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
            <span>ARCHIVE SHOP</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <span className="font-mono text-[#0B0B0B] uppercase text-[11px] border border-[#0B0B0B] px-2.5 py-1">
            BAG [0]
          </span>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#0B0B0B] hover:opacity-70 transition-opacity"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-[#F0F0ED] border-b border-[#0B0B0B] px-6 py-6 animate-fade-in flex flex-col space-y-4 font-mono text-sm">
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
            className="text-left py-2 text-[#777777] uppercase tracking-widest"
          >
            → ARCHIVE DIRECTORY
          </Link>
        </div>
      )}

      {/* =========================================================================
          HERO MAIN STAGE: ASYMMETRIC EDITORIAL COMPOSITION
          ========================================================================= */}
      <div className="px-6 sm:px-10 lg:px-12 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Oversized Typography & Editorial Copy */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 z-10">
            
            {/* Editorial micro labels */}
            <div className="flex items-center gap-3 text-xs font-mono text-[#777777] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#0B0B0B] inline-block" />
              <span>ISSUE NO. 01</span>
              <span>•</span>
              <span>UNISEX SILHOUETTE STUDY</span>
            </div>

            {/* Oversized Fashion Headline */}
            <div className="space-y-1">
              <h1 className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl xl:text-[6.4rem] uppercase tracking-tighter text-[#0B0B0B] leading-[0.87] select-none">
                VOID IS NOT<br />
                JUST WHAT<br />
                <span className="text-[#0B0B0B]">YOU WEAR.</span>
              </h1>
            </div>

            {/* Supporting Line & Paragraph */}
            <div className="max-w-xl space-y-3 pt-2">
              <p className="font-heading font-bold text-xs sm:text-sm uppercase tracking-widest text-[#0B0B0B]">
                STREETWEAR FOR THOSE WHO DEFINE THEIR OWN IDENTITY.
              </p>
              <p className="font-mono text-xs text-[#777777] leading-relaxed">
                An independent study in oversized forms, sculptural drapery, and high-contrast monochrome utility. Engineered for the outsiders, creators, and nocturnal inhabitants.
              </p>
            </div>

            {/* Editorial Pill CTA & Micro Specs */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-6">
              <button
                type="button"
                onClick={() => {
                  if (onExploreClick) onExploreClick();
                  scrollToSection('collection-grid');
                }}
                className="editorial-pill text-xs py-3 px-8 hover:shadow-lg cursor-pointer"
              >
                ( EXPLORE THE COLLECTION )
              </button>

              <div className="flex items-center gap-4 text-[11px] font-mono text-[#777777]">
                <span className="uppercase tracking-wider">TAGLINE:</span>
                <span className="text-[#0B0B0B] font-semibold tracking-widest uppercase">
                  "WEAR YOUR OWN IDENTITY."
                </span>
              </div>
            </div>

            {/* Bottom Meta Bar inside Panel */}
            <div className="pt-8 border-t border-[#0B0B0B]/15 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#777777] uppercase block tracking-wider">
                  ORIGIN
                </span>
                <span className="text-[#0B0B0B] font-medium uppercase">
                  VOID ATELIER
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#777777] uppercase block tracking-wider">
                  COLOR PROTOCOL
                </span>
                <span className="text-[#0B0B0B] font-medium uppercase">
                  MONOCHROME / IVORY
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] text-[#777777] uppercase block tracking-wider">
                  FORM FACTOR
                </span>
                <span className="text-[#0B0B0B] font-medium uppercase">
                  OVERSIZED DRAPE
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Towering Editorial Monochrome Model Silhouette */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-none aspect-[3/4.4] sm:aspect-[3/4.2] bg-[#D1D3D2] border border-[#0B0B0B] overflow-hidden group shadow-lg">
              
              {/* Campaign Model Image */}
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85"
                alt="VOID Monochrome Streetwear Silhouette"
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-cover object-top filter grayscale contrast-130 transition-all duration-1000 ease-out group-hover:scale-105 ${
                  imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />

              {/* High-Fashion Overlay Accents */}
              <div className="absolute top-4 left-4 bg-[#0B0B0B] text-[#F0F0ED] px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                LOOK 01 // OVERSIZED SHELL
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-[#F0F0ED]/95 backdrop-blur-sm p-3.5 border border-[#0B0B0B] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#777777] uppercase block">
                    SILHOUETTE 01
                  </span>
                  <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#0B0B0B]">
                    BALLISTIC MONOLITH PARKA
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#0B0B0B] uppercase font-bold">
                  [ 01/05 ]
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
