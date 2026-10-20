import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface EditorialTile {
  id: string;
  label: string;
  code: string;
  category: string;
  spanClass: string;
  image: string;
  objectPosition: string;
  description: string;
  link: string;
}

const EDITORIAL_TILES: EditorialTile[] = [
  {
    id: 'tile-1',
    label: 'STRUCTURED SILHOUETTES',
    code: '01 / FORM',
    category: 'UPPERS',
    spanClass: 'md:col-span-6 lg:col-span-5 md:row-span-2 min-h-[500px] sm:min-h-[640px] lg:min-h-[720px]',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    objectPosition: 'object-top',
    description: 'Clean lines. Everyday form.',
    link: '/shop?category=uppers'
  },
  {
    id: 'tile-2',
    label: 'CITY UNIFORM',
    code: '02 / UTILITY',
    category: 'UPPERS',
    spanClass: 'md:col-span-6 lg:col-span-7 min-h-[280px] sm:min-h-[340px]',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
    objectPosition: 'object-center',
    description: 'Functional layers for daily movement.',
    link: '/shop?category=uppers'
  },
  {
    id: 'tile-3',
    label: 'DECONSTRUCTED TAILORING',
    code: '03 / TONE',
    category: 'UPPERS',
    spanClass: 'md:col-span-6 lg:col-span-4 min-h-[320px] sm:min-h-[380px]',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
    objectPosition: 'object-center',
    description: 'Modern drape and relaxed tailoring.',
    link: '/shop?collection=COLLAPSED%20TAILORING'
  },
  {
    id: 'tile-4',
    label: 'HEAVYWEIGHT FORMS',
    code: '04 / VOLUME',
    category: 'UPPERS',
    spanClass: 'md:col-span-6 lg:col-span-3 min-h-[320px] sm:min-h-[380px]',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
    objectPosition: 'object-center',
    description: '700gsm cotton fleece with dropped shoulders.',
    link: '/shop?category=uppers'
  }
];

export const EditorialGrid: React.FC = () => {
  return (
    <section id="collection-grid" className="w-full relative bg-[#F0F0ED] text-[#0B0B0B] border-b border-[#0B0B0B]/10 py-16 sm:py-24 lg:py-28 fine-grain-overlay">
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24">
        
        {/* Section Header */}
        <div className="border-b border-[#0B0B0B]/10 pb-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] tracking-widest text-[#777777] uppercase block mb-1">
              [ SECTION 02 // EDITORIAL LOOKBOOK ]
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#0B0B0B]">
              COLLECTION EDITORIAL
            </h2>
          </div>

          <p className="font-mono text-xs sm:text-[13px] text-[#777777] max-w-md leading-relaxed">
            Clean lines. Everyday form. A study in proportion and subtle tonal layering.
          </p>
        </div>

        {/* Asymmetric Lookbook Grid (Guaranteed Full-Frame Coverage) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          {EDITORIAL_TILES.map((tile) => (
            <Link
              key={tile.id}
              to={tile.link}
              className={`${tile.spanClass} group relative bg-[#0B0B0B] border border-[#0B0B0B]/20 overflow-hidden flex flex-col justify-end transition-all duration-300 hover:border-[#0B0B0B]`}
            >
              {/* Full-Frame Image Stage: Absolute inset-0 eliminates any empty grey space */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  src={tile.image}
                  alt={tile.label}
                  className={`w-full h-full object-cover ${tile.objectPosition} transition-transform duration-700 ease-out group-hover:scale-105`}
                  loading="lazy"
                />

                {/* Refined Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/90 via-[#0B0B0B]/25 to-transparent pointer-events-none opacity-85 group-hover:opacity-95 transition-opacity" />
              </div>

              {/* Top Code Badge */}
              <div className="absolute top-4 left-4 z-10 bg-[#0B0B0B]/90 text-[#F0F0ED] px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest">
                {tile.code}
              </div>

              {/* Bottom Editorial Content */}
              <div className="relative z-10 p-5 sm:p-6 text-white space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-extrabold text-sm sm:text-base uppercase tracking-wider text-white">
                    {tile.label}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-mono text-[11px] text-[#D1D3D2]/90 leading-snug">
                  {tile.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Restrained CTA */}
        <div className="border-t border-[#0B0B0B]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs text-[#777777] uppercase tracking-wider">
            Unisex silhouettes • Clean architectural form • Strictly limited releases
          </span>

          <Link
            to="/shop"
            className="editorial-pill text-xs py-3 px-8"
          >
            Explore Collection
          </Link>
        </div>

      </div>
    </section>
  );
};
