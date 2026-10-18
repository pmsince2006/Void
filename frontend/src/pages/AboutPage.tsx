import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { ShieldCheck, Eye, RefreshCw, Zap } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Breadcrumbs items={[{ label: 'ABOUT' }]} className="mb-6" />

      {/* Hero Manifesto */}
      <div className="border-b border-[#111111] pb-12 mb-16">
        <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-3">
          MANIFESTO & PROTOCOL // SYSTEM 01
        </span>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-[#111111] leading-none mb-8">
          VOID IS NOT CLOTHING.<br />
          IT IS ARMOR FOR THE IDENTITY.
        </h1>
        <p className="font-mono text-sm sm:text-base text-[#111111] max-w-3xl leading-relaxed">
          VOID exists to strip away superfluous branding, trend cycles, and fast-fashion consumerism. We engineer sculptural, brutalist unisex garments designed to outlast commercial seasons.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="border border-[#111111] p-6 bg-[#F4F2ED]">
          <div className="w-10 h-10 border border-[#111111] flex items-center justify-center mb-4">
            <Eye className="w-5 h-5 text-[#111111]" />
          </div>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-2">
            PROPORTIONAL ARCHITECTURE
          </h3>
          <p className="text-xs font-mono text-[#777777] leading-relaxed">
            Every pattern is developed with zero gender presuppositions. Volume, drop, and fabric weight command the silhouette.
          </p>
        </div>

        <div className="border border-[#111111] p-6 bg-[#F4F2ED]">
          <div className="w-10 h-10 border border-[#111111] flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5 text-[#111111]" />
          </div>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-2">
            ZERO RESTOCKS PROTOCOL
          </h3>
          <p className="text-xs font-mono text-[#777777] leading-relaxed">
            Once a wave sells out, the piece enters the permanent archive. No re-issues, no overproduction, no waste.
          </p>
        </div>

        <div className="border border-[#111111] p-6 bg-[#F4F2ED]">
          <div className="w-10 h-10 border border-[#111111] flex items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-[#111111]" />
          </div>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-2">
            RAW TECHNICAL MATERIALS
          </h3>
          <p className="text-xs font-mono text-[#777777] leading-relaxed">
            620gsm virgin wools, 1050D Cordura, German Fidlock magnetic hardware, and custom heavy French terry.
          </p>
        </div>

        <div className="border border-[#111111] p-6 bg-[#F4F2ED]">
          <div className="w-10 h-10 border border-[#111111] flex items-center justify-center mb-4">
            <RefreshCw className="w-5 h-5 text-[#111111]" />
          </div>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-2">
            TRANSPARENT CADENCE
          </h3>
          <p className="text-xs font-mono text-[#777777] leading-relaxed">
            Five sequential waves released one week apart. Live availability counters update continuously until allocation is met.
          </p>
        </div>
      </div>

      {/* Editorial Image & Text Split */}
      <div className="border border-[#111111] grid grid-cols-1 lg:grid-cols-2 mb-16">
        <div className="p-8 sm:p-14 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#777777] uppercase block mb-3">
              THE ATELIER // ORIGIN SIGNAL
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#111111] mb-6">
              BORN IN URBAN SHADOWS.
            </h2>
            <p className="font-mono text-xs text-[#111111]/80 leading-relaxed mb-4">
              We reject the clean, sterile homogeneity of corporate fashion. VOID draws from brutalist architecture, underground music scenes, industrial hardware, and the quiet power of monospaced utility.
            </p>
            <p className="font-mono text-xs text-[#111111]/80 leading-relaxed mb-6">
              When you wear VOID, you do not advertise our label. You wear armor engineered to amplify your own identity.
            </p>
          </div>

          <Button variant="solid" to="/shop" size="md">
            EXPLORE THE ARCHIVE
          </Button>
        </div>

        <div className="aspect-[4/3] lg:aspect-auto bg-[#D6D1C8] border-t lg:border-t-0 lg:border-l border-[#111111] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80"
            alt="VOID Atelier silhouette study"
            className="w-full h-full object-cover filter grayscale contrast-125"
          />
        </div>
      </div>
    </div>
  );
};
