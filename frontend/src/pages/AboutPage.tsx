import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ShieldCheck, Eye, RefreshCw, Zap, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 py-10 sm:py-16">
      <Breadcrumbs items={[{ label: 'ABOUT' }]} className="mb-8" />

      {/* Hero Manifesto */}
      <div className="border-b border-[#111111]/15 pb-12 sm:pb-16 mb-16 sm:mb-20">
        <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-3">
          [ BRAND MANIFESTO // CONTEMPORARY STREETWEAR ]
        </span>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight text-[#111111] leading-none mb-8">
          WEAR YOUR <br />
          OWN IDENTITY.
        </h1>
        <p className="font-mono text-sm sm:text-base text-[#777777] max-w-2xl leading-relaxed">
          Contemporary streetwear. Made to stand apart. We engineer sculptural, minimalist garments designed for modern form and daily wear.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 sm:mb-24">
        <div className="border border-[#111111]/20 p-8 bg-[#F4F2ED] hover:border-[#111111] transition-colors">
          <div className="w-10 h-10 border border-[#111111] flex items-center justify-center mb-6">
            <Eye className="w-4 h-4 text-[#111111]" />
          </div>
          <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-3 text-[#111111]">
            PROPORTIONAL FORM
          </h3>
          <p className="text-xs font-mono text-[#777777] leading-relaxed">
            Clean lines and deliberate proportions. Developed with volume and structure for daily wear.
          </p>
        </div>

        <div className="border border-[#111111]/20 p-8 bg-[#F4F2ED] hover:border-[#111111] transition-colors">
          <div className="w-10 h-10 border border-[#111111] flex items-center justify-center mb-6">
            <ShieldCheck className="w-4 h-4 text-[#111111]" />
          </div>
          <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-3 text-[#111111]">
            ARCHIVE RELEASES
          </h3>
          <p className="text-xs font-mono text-[#777777] leading-relaxed">
            Strict batch runs. Each release is produced in limited allocations with no overproduction.
          </p>
        </div>

        <div className="border border-[#111111]/20 p-8 bg-[#F4F2ED] hover:border-[#111111] transition-colors">
          <div className="w-10 h-10 border border-[#111111] flex items-center justify-center mb-6">
            <Zap className="w-4 h-4 text-[#111111]" />
          </div>
          <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-3 text-[#111111]">
            HEAVYWEIGHT CRAFT
          </h3>
          <p className="text-xs font-mono text-[#777777] leading-relaxed">
            Dense French terry, bonded wool blends, and durable technical textiles built for longevity.
          </p>
        </div>

        <div className="border border-[#111111]/20 p-8 bg-[#F4F2ED] hover:border-[#111111] transition-colors">
          <div className="w-10 h-10 border border-[#111111] flex items-center justify-center mb-6">
            <RefreshCw className="w-4 h-4 text-[#111111]" />
          </div>
          <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-3 text-[#111111]">
            MINIMAL FORM
          </h3>
          <p className="text-xs font-mono text-[#777777] leading-relaxed">
            No superfluous branding. The silhouette and texture command attention on their own.
          </p>
        </div>
      </div>

      {/* Editorial Image & Text Split */}
      <div className="border border-[#111111]/20 grid grid-cols-1 lg:grid-cols-12 group hover:border-[#111111] transition-colors overflow-hidden">
        <div className="lg:col-span-5 p-8 sm:p-14 lg:p-16 flex flex-col justify-between bg-[#F4F2ED]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#777777] uppercase block mb-3">
              [ ATELIER PERSPECTIVE ]
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#111111] mb-6 leading-none">
              BORN IN URBAN SHADOWS.
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#777777] leading-relaxed mb-4">
              We design clothing that acts as a canvas for the individual. Clean lines, tactile textures, and utilitarian details made for modern movement.
            </p>
            <p className="font-mono text-xs sm:text-sm text-[#777777] leading-relaxed mb-8">
              Contemporary streetwear. Made to stand apart.
            </p>
          </div>

          <div>
            <Link
              to="/shop"
              className="editorial-pill text-xs inline-flex items-center gap-2 group/btn"
            >
              <span>EXPLORE ARCHIVE</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] bg-[#E5E0D8] border-t lg:border-t-0 lg:border-l border-[#111111]/20 overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85"
            alt="VOID Atelier silhouette study"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 bg-[#111111] text-[#F4F2ED] text-[10px] font-mono px-3 py-1.5 uppercase tracking-widest">
            VOID // ARCHIVE SILHOUETTE
          </div>
        </div>
      </div>
    </div>
  );
};
