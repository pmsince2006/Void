import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, ShieldCheck, Sparkles } from 'lucide-react';

export const DropAnnouncement: React.FC = () => {
  return (
    <section
      id="drop-announcement"
      className="w-full relative bg-[#F0F0ED] text-[#0B0B0B] border border-[#202020]/25 overflow-hidden shadow-2xl fine-grain-overlay p-6 sm:p-10 lg:p-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Drop Text Details & Architectural Cadence */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#777777] uppercase tracking-widest mb-3">
              <span className="w-2 h-2 bg-[#0B0B0B] inline-block" />
              <span>COLLECTION ANNOUNCEMENT</span>
            </div>

            <h2 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#0B0B0B] leading-none mb-4">
              DROP 01 //<br />
              <span className="text-[#0B0B0B]">FORM IN MOTION</span>
            </h2>

            <p className="font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider text-[#0B0B0B] mb-3">
              A STUDY IN PROPORTION, TEXTURE, AND EVERYDAY UNIFORM.
            </p>

            <p className="font-mono text-xs text-[#777777] leading-relaxed max-w-lg mb-6">
              Drop 01 introduces foundational silhouettes engineered with dropped shoulders, elongated body lines, and modular layering. Developed with heavyweight Italian wool blends, 500D technical nylon, and mineral-dyed organic French terry.
            </p>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#0B0B0B]/15">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#777777] uppercase tracking-wider block">
                  FABRICATION FOCUS
                </span>
                <p className="font-mono text-xs text-[#0B0B0B] font-medium">
                  620gsm Bonded Wool & 500D Technical Cordura
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#777777] uppercase block tracking-wider">
                  DESIGN SYSTEM
                </span>
                <p className="font-mono text-xs text-[#0B0B0B] font-medium">
                  Unisex Proportions & Volumetric Drapery
                </p>
              </div>
            </div>
          </div>

          {/* Action Link */}
          <div className="pt-4">
            <Link
              to="/shop?drop=DROP+01"
              className="editorial-pill text-xs py-3 px-8 flex items-center justify-center sm:inline-flex gap-2"
            >
              <span>EXPLORE THE DROP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: High Fashion Editorial Visual */}
        <div className="lg:col-span-6 relative">
          <div className="aspect-[4/3] sm:aspect-[16/11] bg-[#D1D3D2] border border-[#0B0B0B] overflow-hidden relative group">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
              alt="Drop 01 Form in Motion"
              className="w-full h-full object-cover filter grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            
            {/* Architectural Label Badge */}
            <div className="absolute top-4 left-4 bg-[#0B0B0B] text-[#F0F0ED] px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
              DROP 01 // OVERSIZED KIMONO & ARMOR
            </div>

            <div className="absolute bottom-4 right-4 bg-[#F0F0ED]/90 backdrop-blur-sm px-3 py-1 border border-[#0B0B0B] text-[10px] font-mono text-[#0B0B0B] uppercase">
              STUDY NO. 01 — HORIZON
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
