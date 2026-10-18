import React from 'react';

export interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
  unavailableSizes?: string[];
  className?: string;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSelectSize,
  unavailableSizes = [],
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono tracking-widest text-[#777777] uppercase">
          SIZE SPECIFICATION
        </label>
        <span className="text-[11px] font-mono text-[#111111]">
          {selectedSize || 'SELECT SIZE'}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          const isUnavailable = unavailableSizes.includes(size);

          return (
            <button
              key={size}
              type="button"
              disabled={isUnavailable}
              onClick={() => onSelectSize(size)}
              className={`py-2 px-3 text-xs font-mono uppercase tracking-wider border transition-all text-center relative ${
                isSelected
                  ? 'bg-[#111111] text-[#F4F2ED] border-[#111111]'
                  : isUnavailable
                  ? 'opacity-30 border-[#D6D1C8] cursor-not-allowed text-[#777777] line-through'
                  : 'bg-transparent text-[#111111] border-[#111111] hover:bg-[#111111]/5'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};
