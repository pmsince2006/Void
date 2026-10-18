import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { productService } from '../services/productService';
import { Product } from '../types/product';
import { Check } from 'lucide-react';

interface SilhouetteArchetype {
  id: string;
  name: string;
  code: string;
  tagline: string;
  description: string;
  targetCategory: string;
  proportions: string[];
}

const ARCHETYPES: SilhouetteArchetype[] = [
  {
    id: 'monolith-armor',
    name: 'MONOLITHIC ARMOR',
    code: 'ARCH_01',
    tagline: 'Defensive, oversized outerwear shielding against elements and visual noise.',
    description: 'Heavily weighted 620gsm wool blends, wire-structured hoods, and extended storm flaps built for harsh metropolitan climates.',
    targetCategory: 'outerwear',
    proportions: ['Exaggerated Shoulders', 'Extended Floor Length', 'High Structural Cowl']
  },
  {
    id: 'collapsed-bespoke',
    name: 'COLLAPSED TAILORING',
    code: 'ARCH_02',
    tagline: 'Formal bespoke garments deconstructed into fluid, brutalist silhouettes.',
    description: 'Raw-edge hems, exposed interior canvas, and dropped-shoulder suit jackets paired with wide-leg gabardine trousers.',
    targetCategory: 'tailoring',
    proportions: ['Boxy Torso', 'Raw Exposed Seams', 'Inverted Pleats']
  },
  {
    id: 'kinetic-utility',
    name: 'KINETIC HARDWARE',
    code: 'ARCH_03',
    tagline: 'High-speed tactical gear formulated with ballistic cordura and modular carry rigs.',
    description: 'Ergonomic sling systems, Fidlock magnetic quick-releases, and waterproof taped seams for functional mobility.',
    targetCategory: 'accessories',
    proportions: ['Chest Mounted', 'Ballistic 1050D', 'Modular Anchors']
  },
  {
    id: 'sub-bass-fleece',
    name: 'HEAVY SUB-BASS',
    code: 'ARCH_04',
    tagline: 'Maximal volume lounge insulation engineered with 700gsm custom French terry.',
    description: 'Crossover collarless hoods, invisible storage chambers, and mineral-dyed concrete tonal treatments.',
    targetCategory: 'knitwear',
    proportions: ['Crop Hem', 'Elongated Ribbed Cuff', 'Zero Drawstrings']
  }
];

export const StyleDiscoveryPage: React.FC = () => {
  const [selectedArchetype, setSelectedArchetype] = useState<SilhouetteArchetype>(ARCHETYPES[0]);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    productService
      .getProducts({ category: selectedArchetype.targetCategory })
      .then((items) => {
        setMatchedProducts(items);
        setIsLoading(false);
      });
  }, [selectedArchetype]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Breadcrumbs items={[{ label: 'STYLE DISCOVERY' }]} className="mb-6" />

      {/* Header */}
      <div className="border-b border-[#111111] pb-6 mb-10">
        <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-1">
          SILHOUETTE MATRIX // PROPORTIONAL ALGORITHM
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111111]">
          STYLE DISCOVERY
        </h1>
        <p className="font-mono text-xs text-[#777777] max-w-xl mt-3 leading-relaxed">
          VOID silhouettes are engineered around proportion rather than gender. Select an architectural archetype to calibrate the index to your preferred stance.
        </p>
      </div>

      {/* Archetype Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {ARCHETYPES.map((arch) => {
          const isSelected = selectedArchetype.id === arch.id;
          return (
            <button
              key={arch.id}
              onClick={() => setSelectedArchetype(arch)}
              className={`p-6 text-left border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#111111] text-[#F4F2ED] border-[#111111] shadow-xl'
                  : 'bg-[#F4F2ED] text-[#111111] border-[#111111]/25 hover:border-[#111111]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-4">
                  <span className={isSelected ? 'text-[#D6D1C8]' : 'text-[#777777]'}>
                    [{arch.code}]
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <h3 className="font-heading font-extrabold text-lg uppercase tracking-wider mb-2">
                  {arch.name}
                </h3>
                <p className={`text-xs font-mono mb-4 leading-relaxed ${
                  isSelected ? 'text-[#D6D1C8]/80' : 'text-[#777777]'
                }`}>
                  {arch.tagline}
                </p>
              </div>

              <div className="pt-4 border-t border-current/20 space-y-1">
                {arch.proportions.map((p) => (
                  <div key={p} className="text-[10px] font-mono tracking-wider uppercase opacity-80">
                    • {p}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Selection Details Banner */}
      <div className="border border-[#111111] p-8 mb-12 bg-[#E5E0D8]/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777] block mb-1">
              CURRENTLY CALIBRATED ARCHETYPE
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-[#111111] mb-2">
              {selectedArchetype.name}
            </h2>
            <p className="font-mono text-xs text-[#111111]/80 leading-relaxed">
              {selectedArchetype.description}
            </p>
          </div>

          <Button
            variant="solid"
            to={`/shop?category=${selectedArchetype.targetCategory}`}
            size="md"
          >
            EXPLORE FULL {selectedArchetype.targetCategory.toUpperCase()} DROP
          </Button>
        </div>
      </div>

      {/* Recommended Silhouettes Grid */}
      <section>
        <div className="border-b border-[#111111] pb-4 mb-8 flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-[#111111]">
            ALGORITHM RECOMMENDATIONS [{matchedProducts.length}]
          </h3>
          <span className="text-xs font-mono text-[#777777]">
            MATCHED VIA {selectedArchetype.code}
          </span>
        </div>

        <ProductGrid
          products={matchedProducts}
          isLoading={isLoading}
          columns={4}
        />
      </section>
    </div>
  );
};
