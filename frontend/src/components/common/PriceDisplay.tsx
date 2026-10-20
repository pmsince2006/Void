import React from 'react';

export interface PriceDisplayProps {
  price: number;
  currency?: string;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCurrencyCode?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  currency = 'INR',
  originalPrice,
  size = 'md',
  className = '',
  showCurrencyCode = false,
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-medium',
    xl: 'text-xl font-heading font-semibold'
  }[size];

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(price);

  const formattedOriginal = originalPrice
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
      }).format(originalPrice)
    : null;

  return (
    <div className={`inline-flex items-center gap-2 font-mono ${sizeClasses} ${className}`}>
      <span className="text-[#111111] tracking-tight">{formattedPrice}</span>
      {formattedOriginal && (
        <span className="line-through text-[#777777] text-xs">
          {formattedOriginal}
        </span>
      )}
      {showCurrencyCode && (
        <span className="text-[10px] text-[#777777] uppercase tracking-wider">{currency}</span>
      )}
    </div>
  );
};
