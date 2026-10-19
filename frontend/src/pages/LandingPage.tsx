import React, { useEffect } from 'react';
import { LandingHero } from '../components/landing/LandingHero';
import { EditorialGrid } from '../components/landing/EditorialGrid';
import { StatementBanner } from '../components/landing/StatementBanner';
import { DropAnnouncement } from '../components/landing/DropAnnouncement';
import { LookbookStrip } from '../components/landing/LookbookStrip';
import { LandingFooter } from '../components/landing/LandingFooter';
import { CartDrawer } from '../components/layout/CartDrawer';
import { WishlistDrawer } from '../components/layout/WishlistDrawer';
import { ToastContainer } from '../components/common/Toast';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'VOID — Wear Your Own Identity';
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F0F0ED] text-[#0B0B0B] flex flex-col items-center justify-start overflow-x-hidden">
      
      {/* Subtle Marquee Ribbon at the very top of the page (Edge-to-Edge) */}
      <div className="w-full bg-[#0B0B0B] text-[#D1D3D2] py-2.5 border-b border-[#202020] overflow-hidden select-none z-20">
        <div className="flex items-center space-x-10 text-[11px] font-mono tracking-widest whitespace-nowrap animate-marquee">
          <span>VOID — WEAR YOUR OWN IDENTITY</span>
          <span className="text-[#777777]">■</span>
          <span>CONTEMPORARY UNISEX STREETWEAR</span>
          <span className="text-[#777777]">■</span>
          <span>DROP 01 // FORM IN MOTION</span>
          <span className="text-[#777777]">■</span>
          <span>NEW SILHOUETTES NOW AVAILABLE</span>
          <span className="text-[#777777]">■</span>
          <span>VOID — WEAR YOUR OWN IDENTITY</span>
          <span className="text-[#777777]">■</span>
          <span>CONTEMPORARY UNISEX STREETWEAR</span>
          <span className="text-[#777777]">■</span>
          <span>DROP 01 // FORM IN MOTION</span>
          <span className="text-[#777777]">■</span>
          <span>NEW SILHOUETTES NOW AVAILABLE</span>
        </div>
      </div>

      {/* Main Full-Width Editorial Sections (Edge-to-Edge Flow) */}
      <main className="w-full flex flex-col">
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
      </main>

      {/* Interactive Global Drawers */}
      <CartDrawer />
      <WishlistDrawer />
      <ToastContainer />

    </div>
  );
};
