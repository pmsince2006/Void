import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (qty: number) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  min = 1,
  max = 10,
  onChange,
  className = '',
  size = 'md'
}) => {
  const handleDecrement = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  const sizeClasses = size === 'sm' ? 'h-8 text-xs' : 'h-10 text-xs';

  return (
    <div className={`inline-flex items-center border border-[#111111] font-mono ${sizeClasses} ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        className="px-3 h-full flex items-center justify-center hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-10 text-center font-medium select-none text-[#111111]">
        {quantity.toString().padStart(2, '0')}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className="px-3 h-full flex items-center justify-center hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
