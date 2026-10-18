import React from 'react';
import { Link } from 'react-router-dom';

interface EditorialTile {
  id: string;
  label: string;
  code: string;
  aspectClass: string;
  image: string;
  spanClass: string;
  description: string;
}

const EDITORIAL_TILES: EditorialTile[] = [
  {
    id: 'tile-1',
    label: 'STRUCTURED SILHOUETTES',
    code: '01 / FORM',
    aspectClass: 'aspect-[3/4.2]',
    spanClass: 'md:col-span-6 lg:col-span-5 md:row-span-2',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
    description: 'Heavyweight wool-blend outerwear draped for dramatic architectural presence.'
  },
  {
    id: 'tile-2',
    label: 'CITY UNIFORM',
    code: '02 / UTILITY',
    aspectClass: 'aspect-[16/10]',
    spanClass: 'md:col-span-6 lg:col-span-7',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
    description: 'Tactical layering engineered for harsh metropolitan conditions.'
  },
  {
    id: 'tile-3',
    label: 'MONOCHROME STUDY',
    code: '03 / TONE',
    aspectClass: 'aspect-[3/4]',
    spanClass: 'md:col-span-6 lg:col-span-4',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
    description: 'Deconstructed tailoring meeting industrial streetwear silhouettes.'
  },
  {
    id: 'tile-4',
    label: 'OVERSIZED FORMS',
    code: '04 / VOLUME',
    aspectClass: 'aspect-[3/4]',
    spanClass: 'md:col-span-6 lg:col-span-3',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
    description: 'Custom 700gsm cotton terry with seamless contours and dropped shoulders.'
  }
];

export const EditorialGrid: React.FC = () => {
  return (
    <section id="collection-grid" className="w-full relative bg-[#F0F0ED] text-[#0B0B0B] border border-[#202020]/25 overflow-hidden shadow-2xl fine-grain-overlay p-6 sm:p-10 lg:p-12">
      
      {/* Section Header */}
      <div className="border-b border-[#0B0B0B]/15 pb-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] tracking-widest text-[#777777] uppercase block mb-1">
            [ SECTION 02 // EDITORIAL LOOKBOOK ]
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#0B0B0B]">
            COLLECTION EDITORIAL
          </h2>
        </div>

        <p className="font-mono text-xs text-[#777777] max-w-md leading-relaxed">
          A study of unisex proportions, sharp architectural cuts, and high-contrast monochrome layering across five master forms.
        </p>
      </div>

      {/* Asymmetric Lookbook Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        {EDITORIAL_TILES.map((tile) => (
          <div
            key={tile.id}
            className={`${tile.spanClass} group relative bg-[#D1D3D2] border border-[#0B0B0B] overflow-hidden flex flex-col justify-end`}
          >
            {/* Image Stage */}
            <div className={`w-full ${tile.aspectClass} overflow-hidden relative`}>
              <img
                src={tile.image}
                alt={tile.label}
                className="w-full h-full object-cover filter grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/80 via-transparent to-transparent pointer-events-none opacity-85 group-hover:opacity-95 transition-opacity" />

              {/* Top Label */}
              <div className="absolute top-3 left-3 bg-[#0B0B0B] text-[#F0F0ED] px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest">
                {tile.code}
              </div>

              {/* Bottom Editorial Content */}
              <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-1">
                <h3 className="font-heading font-extrabold text-sm sm:text-base uppercase tracking-wider text-white">
                  {tile.label}
                </h3>
                <p className="font-mono text-[11px] text-[#D1D3D2]/80 leading-snug line-clamp-2">
                  {tile.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Restrained CTA */}
      <div className="border-t border-[#0B0B0B]/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-[#777777] uppercase tracking-wider">
          ALL GARMENTS HANDCRAFTED IN LIMITED MONOCHROME WAVES
        </span>

        <Link
          to="/shop"
          className="editorial-pill text-xs py-2.5 px-8"
        >
          ( VIEW COLLECTION )
        </Link>
      </div>

    </section>
  );
};
