import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0B0B0B] text-[#F0F0ED] border-t border-[#202020] py-14 sm:py-16 select-none">
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pb-10 border-b border-[#202020]">
          {/* Brand & Tagline */}
          <div className="space-y-3">
            <Link
              to="/"
              className="font-display text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase text-[#FFFFFF] hover:opacity-85 transition-opacity"
            >
              VOID<span className="text-[#777777]">.</span>
            </Link>
            <p className="font-mono text-xs uppercase tracking-widest text-[#777777]">
              "Wear Your Own Identity."
            </p>
            <p className="font-mono text-[11px] text-[#777777] max-w-sm">
              Contemporary unisex streetwear atelier. All rights reserved.
            </p>
          </div>

          {/* Navigation & Signal links */}
          <div className="flex flex-wrap gap-8 sm:gap-14 text-xs font-mono">
            <div className="space-y-2.5">
              <span className="text-[#777777] uppercase text-[10px] tracking-wider block">
                DIRECTORY
              </span>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors">
                    Collection
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    Manifesto
                  </Link>
                </li>
                <li>
                  <Link to="/journal" className="hover:text-white transition-colors">
                    Journal
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <span className="text-[#777777] uppercase text-[10px] tracking-wider block">
                SIGNALS
              </span>
              <ul className="space-y-1.5">
                <li>
                  <span className="text-[#D1D3D2] hover:text-white cursor-pointer transition-colors">
                    Instagram // @void.atelier
                  </span>
                </li>
                <li>
                  <span className="text-[#D1D3D2] hover:text-white cursor-pointer transition-colors">
                    Archive // Terminal
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#777777]">
          <span>VOID ATELIER © 2026. ALL RIGHTS RESERVED.</span>

          <button
            onClick={scrollToTop}
            className="editorial-pill-invert text-[10px] py-1.5 px-5 flex items-center gap-1.5 cursor-pointer"
            aria-label="Scroll to top"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
};
