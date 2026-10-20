import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Terminal, Shield, Globe } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Kolkata'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#111111] text-[#F4F2ED] border-t border-[#282828] pt-16 pb-12 select-none">
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24">
        {/* Top Massive Brand Statement */}
        <div className="border-b border-[#282828] pb-12 mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-3">
              EXPERIMENTAL UNISEX ATELIER // PROTOCOL 2026
            </span>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none">
              WEAR YOUR <br />
              <span className="text-[#777777]">OWN IDENTITY.</span>
            </h2>
          </div>

          <div className="max-w-md space-y-4">
            <p className="font-mono text-xs text-[#D6D1C8]/80 leading-relaxed">
              VOID operates as an independent streetwear archive. We build architectural silhouettes for outsiders, creators, and nocturnal inhabitants. Each drop releases in strictly numbered waves with no restocks.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-[#777777]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                SIGNAL: ACTIVE
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                SHIPPING ACROSS INDIA
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                VERIFIED ARCHIVE
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-b border-[#282828]">
          {/* Col 1 */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#777777]">
              [ 01 // CATEGORIES ]
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link to="/shop?category=uppers" className="hover:text-white transition-colors">
                  Uppers
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bottoms" className="hover:text-white transition-colors">
                  Bottoms
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shoes" className="hover:text-white transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#777777]">
              [ 02 // COLLECTIONS ]
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  City Armor 2026
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  Collapsed Tailoring
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  Sub-Bass Heavy Fleece
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  Modular Hardware
                </Link>
              </li>
              <li>
                <Link to="/shop?badge=ARCHIVE" className="hover:text-white transition-colors">
                  Perpetual Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#777777]">
              [ 03 // EDITORIAL & ATELIER ]
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link to="/journal" className="hover:text-white transition-colors">
                  VOID Journal
                </Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-white transition-colors">
                  Atelier Dispatches
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Brand Manifesto
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Drop Schedule & Cadence
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#777777]">
              [ 04 // PROTOCOLS ]
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Dispatch & Tracking
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Zero-Restock Policy
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Care & Preservation
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Privacy Encrypted
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-white transition-colors">
                  Order Archive
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#777777]">
          <div className="flex items-center gap-4">
            <span className="text-[#F4F2ED] font-bold">VOID ATELIER © 2026</span>
            <span>•</span>
            <span>SYSTEM TIME: {timeStr ? `${timeStr} IST` : 'CALCULATING...'}</span>
          </div>

          <button
            onClick={scrollToTop}
            className="editorial-pill-invert text-[11px] py-1.5 px-4 flex items-center gap-2 hover:border-white"
            aria-label="Scroll to top of page"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};
