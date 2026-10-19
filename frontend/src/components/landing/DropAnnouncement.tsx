import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const DropAnnouncement: React.FC = () => {
  return (
    <section
      id="drop-announcement"
      className="w-full relative bg-[#F0F0ED] text-[#0B0B0B] border-b border-[#0B0B0B]/10 py-16 sm:py-24 lg:py-28 fine-grain-overlay"
    >
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Drop Text Details & Fabrication Focus */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#777777] uppercase tracking-widest mb-3">
                <span className="w-2 h-2 bg-[#0B0B0B] inline-block" />
                <span>NEW COLLECTION</span>
              </div>

              <h2 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#0B0B0B] leading-none mb-4">
                DROP 01 //<br />
                <span className="text-[#0B0B0B]">FORM IN MOTION</span>
              </h2>

              <p className="font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider text-[#0B0B0B] mb-3">
                A study in proportion, texture, and everyday uniform.
              </p>

              <p className="font-mono text-xs sm:text-[13px] text-[#777777] leading-relaxed max-w-lg mb-8">
                Foundational streetwear silhouettes engineered with dropped shoulders, clean lines, and modular layering. Developed with heavyweight Italian wool blends, 500D technical nylon, and mineral-dyed organic French terry.
              </p>

              {/* Structured Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#0B0B0B]/10">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-[#777777] uppercase tracking-wider block">
                    FABRICATION
                  </span>
                  <p className="font-mono text-xs text-[#0B0B0B] font-medium">
                    620gsm Bonded Wool & 500D Technical Cordura
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-[#777777] uppercase block tracking-wider">
                    FIT SPECIFICATION
                  </span>
                  <p className="font-mono text-xs text-[#0B0B0B] font-medium">
                    Unisex Proportions & Volumetric Drape
                  </p>
                </div>
              </div>
            </div>

            {/* Action Link */}
            <div className="pt-2">
              <Link
                to="/shop?drop=DROP+01"
                className="editorial-pill text-xs py-3.5 px-9 flex items-center justify-center sm:inline-flex gap-2"
              >
                <span>Explore Drop 01</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: High Fashion Editorial Visual */}
          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/3] sm:aspect-[16/11] bg-[#D1D3D2] border border-[#0B0B0B]/20 overflow-hidden relative group shadow-md">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
                alt="Drop 01 Form in Motion"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Minimalist Architectural Label */}
              <div className="absolute top-4 left-4 bg-[#0B0B0B] text-[#F0F0ED] px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
                DROP 01 // OVERSIZED WRAP
              </div>

              <div className="absolute bottom-4 right-4 bg-[#F0F0ED]/90 backdrop-blur-sm px-3 py-1 border border-[#0B0B0B]/15 text-[10px] font-mono text-[#0B0B0B] uppercase">
                STUDY NO. 01 — HORIZON
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
