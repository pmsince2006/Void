import React, { useEffect } from 'react';
import { LandingHero } from '../components/landing/LandingHero';
import { EditorialGrid } from '../components/landing/EditorialGrid';
import { StatementBanner } from '../components/landing/StatementBanner';
import { DropAnnouncement } from '../components/landing/DropAnnouncement';
import { LookbookStrip } from '../components/landing/LookbookStrip';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'VOID — Wear Your Own Identity';
  }, []);

  return (
    <div className="w-full min-h-screen industrial-texture-bg text-[#0B0B0B] flex flex-col items-center justify-start overflow-x-hidden">
      
      {/* Subtle Marquee Ribbon at the very top of the page */}
      <div className="w-full bg-[#0B0B0B] text-[#D1D3D2] py-2 border-b border-[#202020] overflow-hidden select-none z-20">
        <div className="flex items-center space-x-8 text-[11px] font-mono tracking-widest whitespace-nowrap animate-marquee">
          <span>VOID — WEAR YOUR OWN IDENTITY</span>
          <span className="text-[#777777]">■</span>
          <span>MONOCHROME SILHOUETTES</span>
          <span className="text-[#777777]">■</span>
          <span>ZERO RESTOCKS PROTOCOL</span>
          <span className="text-[#777777]">■</span>
          <span>DROP 01 // FORM IN MOTION</span>
          <span className="text-[#777777]">■</span>
          <span>VOID — WEAR YOUR OWN IDENTITY</span>
          <span className="text-[#777777]">■</span>
          <span>MONOCHROME SILHOUETTES</span>
          <span className="text-[#777777]">■</span>
          <span>ZERO RESTOCKS PROTOCOL</span>
          <span className="text-[#777777]">■</span>
          <span>DROP 01 // FORM IN MOTION</span>
        </div>
      </div>

      {/* Main Framed Editorial Canvas Container (Art-Directed Postal Frame) */}
      <div className="w-full max-w-[1480px] px-0 sm:px-4 md:px-8 lg:px-12 py-0 sm:py-8 md:py-12 flex flex-col space-y-8 sm:space-y-12">
        
        {/* SECTION 1: EDITORIAL HERO */}
        <LandingHero />

        {/* SECTION 2: COLLECTION EDITORIAL GRID */}
        <EditorialGrid />

        {/* SECTION 3: STATEMENT BANNER (FULL WIDTH DRAMATIC BREAK) */}
        <StatementBanner />

        {/* SECTION 4: DROP ANNOUNCEMENT */}
        <DropAnnouncement />

        {/* SECTION 5: PRODUCT / LOOKBOOK STRIP */}
        <LookbookStrip />

        {/* SECTION 6: LANDING FOOTER */}
        <LandingFooter />

      </div>

    </div>
  );
};
