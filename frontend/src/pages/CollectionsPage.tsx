import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { Collection } from '../types/cart';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ArrowRight } from 'lucide-react';

export const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productService.getCollections().then((data) => {
      setCollections(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 py-10 sm:py-16">
      <Breadcrumbs items={[{ label: 'COLLECTIONS' }]} className="mb-8" />

      {/* Header section with balanced editorial layout */}
      <div className="border-b border-[#111111]/15 pb-8 mb-12 sm:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-2">
            [ CURATED ATMOSPHERES // ARCHIVE TIMELINE ]
          </span>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-[#111111]">
            COLLECTIONS
          </h1>
        </div>

        <p className="font-mono text-xs sm:text-sm text-[#777777] max-w-md leading-relaxed">
          Distinct conceptual atmospheres. Minimal silhouettes designed for modern movement and everyday form.
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 text-center font-mono text-xs uppercase text-[#777777] tracking-widest">
          INDEXING COLLECTIONS...
        </div>
      ) : (
        <div className="space-y-12 sm:space-y-16">
          {collections.map((col, idx) => (
            <div
              key={col.id}
              className={`flex flex-col ${
                idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } border border-[#111111]/20 bg-[#F4F2ED] group hover:border-[#111111] transition-colors overflow-hidden`}
            >
              {/* Image Stage: Full frame coverage with natural color and smooth zoom */}
              <div
                className={`lg:w-7/12 min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] bg-[#E5E0D8] overflow-hidden relative border-b lg:border-b-0 ${
                  idx % 2 === 0 ? 'lg:border-r' : 'lg:border-l'
                } border-[#111111]/20 group-hover:border-[#111111] transition-colors`}
              >
                <img
                  src={col.heroImage}
                  alt={col.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 bg-[#111111] text-[#F4F2ED] text-[10px] font-mono px-3 py-1.5 uppercase tracking-widest">
                  {col.code} // {col.season}
                </div>
              </div>

              {/* Text & Meta Content */}
              <div className="lg:w-5/12 min-w-0 p-6 sm:p-8 lg:p-8 xl:p-12 2xl:p-14 flex flex-col justify-between bg-[#F4F2ED]">
                <div className="min-w-0">
                  <div className="flex items-center justify-between font-mono text-xs text-[#777777] mb-4">
                    <span>ARCHIVE 0{idx + 1}</span>
                    <span>{col.itemCount} PIECES</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl lg:text-[1.65rem] xl:text-3xl 2xl:text-4xl font-extrabold uppercase tracking-tight text-[#111111] mb-4 leading-[1.12] break-normal hyphens-none">
                    {col.title}
                  </h2>
                  <p className="font-mono text-xs sm:text-sm text-[#777777] leading-relaxed mb-8 max-w-md">
                    {col.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#111111]/15">
                  <Link
                    to={`/shop?collection=${encodeURIComponent(col.title)}`}
                    className="editorial-pill text-xs inline-flex items-center gap-2 group/btn"
                  >
                    <span>EXPLORE COLLECTION</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
