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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Breadcrumbs items={[{ label: 'COLLECTIONS' }]} className="mb-6" />

      <div className="border-b border-[#111111] pb-6 mb-10">
        <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-1">
          CURATED ATMOSPHERES // HORIZON TIMELINE
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111111]">
          ARCHIVE COLLECTIONS
        </h1>
      </div>

      {isLoading ? (
        <div className="py-20 text-center font-mono text-xs uppercase text-[#777777]">
          INDEXING COLLECTIONS...
        </div>
      ) : (
        <div className="space-y-12">
          {collections.map((col, idx) => (
            <div
              key={col.id}
              className={`flex flex-col ${
                idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } border border-[#111111] bg-transparent group`}
            >
              {/* Image Stage */}
              <div className="lg:w-7/12 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto bg-[#D6D1C8] overflow-hidden relative border-b lg:border-b-0 lg:border-r border-[#111111]">
                <img
                  src={col.heroImage}
                  alt={col.title}
                  className="w-full h-full object-cover filter grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-[#111111] text-[#F4F2ED] text-[10px] font-mono px-2.5 py-1 uppercase tracking-widest">
                  {col.code} // {col.season}
                </div>
              </div>

              {/* Text & Meta */}
              <div className="lg:w-5/12 p-8 sm:p-12 flex flex-col justify-between bg-[#F4F2ED]">
                <div>
                  <div className="flex items-center justify-between font-mono text-xs text-[#777777] mb-3">
                    <span>ARCHIVE INDEX 0{idx + 1}</span>
                    <span>{col.itemCount} PIECES RELEASED</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#111111] mb-4">
                    {col.title}
                  </h2>
                  <p className="font-mono text-xs text-[#111111]/80 leading-relaxed mb-6">
                    {col.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#111111]/15">
                  <Link
                    to={`/shop?collection=${encodeURIComponent(col.title)}`}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-[#111111] hover:text-[#777777] transition-colors"
                  >
                    <span>EXPLORE {col.title} DIRECTORY</span>
                    <ArrowRight className="w-4 h-4" />
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
