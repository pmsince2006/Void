import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface LookbookItem {
  id: string;
  code: string;
  title: string;
  price: number;
  slug: string;
  image: string;
  category: string;
}

const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'lk-01',
    code: 'VD-01-W01',
    title: 'STRUCTURED COLLAPSE COAT',
    price: 495,
    slug: 'structured-collapse-coat',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=85',
    category: 'OUTERWEAR'
  },
  {
    id: 'lk-02',
    code: 'VD-01-W01',
    title: 'BALLISTIC MONOLITH PARKA',
    price: 540,
    slug: 'ballistic-monolith-parka',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85',
    category: 'OUTERWEAR'
  },
  {
    id: 'lk-03',
    code: 'VD-01-W02',
    title: 'DECONSTRUCTED TAILORED BLAZER',
    price: 380,
    slug: 'deconstructed-tailored-blazer',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
    category: 'TAILORING'
  },
  {
    id: 'lk-04',
    code: 'VD-01-W02',
    title: 'HEAVY GAUGE SUB-BASS HOODIE',
    price: 240,
    slug: 'heavy-gauge-sub-bass-hoodie',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=85',
    category: 'KNITWEAR'
  },
  {
    id: 'lk-05',
    code: 'VD-01-W03',
    title: 'PLEATED WIDE ARCHIVE TROUSER',
    price: 290,
    slug: 'pleated-wide-archive-trouser',
    image: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=85',
    category: 'BOTTOMS'
  }
];

export const LookbookStrip: React.FC = () => {
  return (
    <section
      id="lookbook-strip"
      className="w-full relative bg-[#F0F0ED] text-[#0B0B0B] border border-[#202020]/25 overflow-hidden shadow-2xl fine-grain-overlay p-6 sm:p-10 lg:p-12"
    >
      {/* Header */}
      <div className="border-b border-[#0B0B0B]/15 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] tracking-widest text-[#777777] uppercase block mb-1">
            [ SECTION 05 // SILHOUETTE STRIP ]
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#0B0B0B]">
            PRODUCT & OUTFIT LOOKBOOK
          </h2>
        </div>

        <Link
          to="/shop"
          className="text-xs font-mono uppercase tracking-wider text-[#0B0B0B] hover:text-[#777777] flex items-center gap-1 transition-colors"
        >
          <span>VIEW FULL ARCHIVE CATALOG</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Strip / Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {LOOKBOOK_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.slug}`}
            className="group flex flex-col bg-transparent"
          >
            {/* Image Canvas */}
            <div className="w-full aspect-[3/4.2] bg-[#D1D3D2] border border-[#0B0B0B]/20 group-hover:border-[#0B0B0B] overflow-hidden relative mb-2.5 transition-colors">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover filter grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Top micro code */}
              <div className="absolute top-2 left-2 bg-[#0B0B0B]/85 text-[#F0F0ED] px-1.5 py-0.5 text-[9px] font-mono uppercase">
                {item.code}
              </div>

              {/* Category tag */}
              <div className="absolute bottom-2 right-2 bg-[#F0F0ED]/90 text-[#0B0B0B] px-1.5 py-0.5 text-[8px] font-mono uppercase font-bold tracking-wider">
                {item.category}
              </div>
            </div>

            {/* Meta */}
            <div className="space-y-0.5">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0B0B0B] group-hover:text-[#777777] transition-colors line-clamp-1">
                {item.title}
              </h3>
              <p className="font-mono text-xs text-[#777777]">
                ${item.price} USD
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
