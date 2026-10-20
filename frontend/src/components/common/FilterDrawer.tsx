import React from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { ProductFilterParams, ProductCategory } from '../../types/product';
import { Button } from './Button';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductFilterParams;
  onApplyFilters: (filters: ProductFilterParams) => void;
  onResetFilters: () => void;
}

const CATEGORIES: { label: string; value: ProductCategory }[] = [
  { label: 'UPPERS', value: 'uppers' },
  { label: 'BOTTOMS', value: 'bottoms' },
  { label: 'SHOES', value: 'shoes' },
  { label: 'ACCESSORIES', value: 'accessories' }
];

const SORT_OPTIONS: { label: string; value: ProductFilterParams['sort'] }[] = [
  { label: 'FEATURED CURATION', value: 'featured' },
  { label: 'DROP TIMELINE (NEWEST)', value: 'newest' },
  { label: 'PRICE: ASCENDING', value: 'price-asc' },
  { label: 'PRICE: DESCENDING', value: 'price-desc' }
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = React.useState<ProductFilterParams>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleCategoryToggle = (category: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      category: prev.category === category ? undefined : category
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#F4F2ED] border-l border-[#111111] h-full flex flex-col z-10 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#111111]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#111111]" />
            <h2 className="font-heading font-bold text-sm tracking-widest uppercase text-[#111111]">
              INDEX FILTRATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-[#777777] mb-3">
              CATEGORY CLASSIFICATION
            </h3>
            <div className="flex flex-col space-y-2">
              {CATEGORIES.map((cat) => {
                const isActive = localFilters.category === cat.value;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.value)}
                    className={`text-left text-xs font-mono uppercase px-3 py-2 border transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-[#111111] text-[#F4F2ED] border-[#111111]'
                        : 'border-[#111111]/20 hover:border-[#111111] text-[#111111]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] opacity-70">
                      {isActive ? '[ ACTIVE ]' : '—'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort order */}
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-[#777777] mb-3">
              SORT CADENCE
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = localFilters.sort === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setLocalFilters((prev) => ({ ...prev, sort: opt.value }))}
                    className={`text-left text-xs font-mono uppercase px-3 py-2 border transition-all ${
                      isSelected
                        ? 'bg-[#111111] text-[#F4F2ED] border-[#111111]'
                        : 'border-[#111111]/20 hover:border-[#111111] text-[#111111]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-[#777777] mb-3">
              VALUATION RANGE
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-mono text-[#777777] block mb-1">MIN (₹)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={localFilters.minPrice || ''}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      minPrice: e.target.value ? Number(e.target.value) : undefined
                    }))
                  }
                  className="w-full border border-[#111111] bg-transparent p-2 text-xs font-mono"
                />
              </div>
              <span className="font-mono text-[#777777] pt-4">—</span>
              <div className="flex-1">
                <span className="text-[10px] font-mono text-[#777777] block mb-1">MAX (₹)</span>
                <input
                  type="number"
                  placeholder="35000"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      maxPrice: e.target.value ? Number(e.target.value) : undefined
                    }))
                  }
                  className="w-full border border-[#111111] bg-transparent p-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-[#111111] space-y-3 bg-[#F4F2ED]">
          <Button variant="solid" size="lg" className="w-full" onClick={handleApply}>
            APPLY FILTERS
          </Button>
          <button
            type="button"
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="w-full py-2 text-xs font-mono uppercase text-[#777777] hover:text-[#111111] flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET TO RAW STATE
          </button>
        </div>
      </div>
    </div>
  );
};
