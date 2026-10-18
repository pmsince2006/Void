import React from 'react';
import { ProductColor } from '../../types/product';

export interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: string;
  onSelectColor: (colorName: string) => void;
  className?: string;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onSelectColor,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono tracking-widest text-[#777777] uppercase">
          COLORWAY
        </label>
        <span className="text-[11px] font-mono text-[#111111] uppercase">
          {selectedColor || 'SELECT COLOR'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name;
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onSelectColor(color.name)}
              className={`group flex items-center gap-2 p-1 border transition-all ${
                isSelected
                  ? 'border-[#111111] bg-black/5'
                  : 'border-transparent hover:border-[#D6D1C8]'
              }`}
              title={color.name}
            >
              <span
                className="w-5 h-5 rounded-full border border-black/20 block shadow-inner"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs font-mono uppercase text-[#111111] pr-1">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
