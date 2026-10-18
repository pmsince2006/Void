import React from 'react';
import { Link } from 'react-router-dom';

export const StatementBanner: React.FC = () => {
  return (
    <section
      id="statement-banner"
      className="w-full relative bg-[#0B0B0B] text-[#FFFFFF] py-24 sm:py-36 px-6 sm:px-12 lg:px-16 border-y border-[#202020] overflow-hidden select-none"
    >
      {/* Smoky Distressed Monochrome Background Silhouette */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-luminosity">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="w-full h-full object-cover filter blur-[2px] contrast-150"
        />
      </div>

      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B0B0B]/70 to-[#0B0B0B] pointer-events-none" />

      {/* Content Container */}
      <div className="relative max-w-6xl mx-auto flex flex-col items-center text-center z-10 space-y-8">
        
        {/* Micro Tag */}
        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#777777] border border-[#202020] px-3.5 py-1 bg-[#0B0B0B]/80">
          VOID CAMPAIGN // MANIFESTO
        </span>

        {/* Large White Statement Headline */}
        <h2 className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase tracking-tighter leading-[0.88] text-white max-w-4xl">
          MORE THAN<br />
          <span className="text-[#D1D3D2]">WHAT YOU WEAR.</span>
        </h2>

        {/* Compact Supporting Copy */}
        <div className="max-w-xl mx-auto space-y-2 pt-2">
          <p className="font-mono text-xs sm:text-sm text-[#D1D3D2]/85 leading-relaxed">
            Born in the city's shadows, we construct armor for individuality. A living platform where proportion, brutalist aesthetics, and identity converge.
          </p>
          <p className="font-mono text-[11px] text-[#777777] tracking-wider uppercase">
            WEAR YOUR OWN IDENTITY.
          </p>
        </div>

        {/* Subtle CTA to explore VOID */}
        <div className="pt-4">
          <Link
            to="/about"
            className="editorial-pill-invert text-xs py-3 px-8 cursor-pointer"
          >
            ( EXPLORE VOID )
          </Link>
        </div>

      </div>
    </section>
  );
};
