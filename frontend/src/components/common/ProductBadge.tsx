import React from 'react';
import { ProductBadgeType } from '../../types/product';

export interface ProductBadgeProps {
  type?: ProductBadgeType | string;
  className?: string;
  variant?: 'bracket' | 'solid' | 'outline' | 'subtle';
  size?: 'sm' | 'md';
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({
  type = 'DROP 01',
  className = '',
  variant = 'bracket',
  size = 'sm'
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-widest',
    md: 'text-xs px-2.5 py-1 tracking-wider'
  }[size];

  if (variant === 'bracket') {
    return (
      <span className={`inline-flex items-center font-mono font-medium text-[#111111] uppercase tracking-widest ${sizeClasses} ${className}`}>
        [ {type} ]
      </span>
    );
  }

  const variantStyles = {
    solid: 'bg-[#111111] text-[#F4F2ED] border border-[#111111]',
    outline: 'border border-[#111111] text-[#111111] bg-transparent',
    subtle: 'bg-[#D6D1C8]/60 text-[#111111]'
  }[variant];

  return (
    <span
      className={`inline-flex items-center uppercase font-mono font-medium ${variantStyles} ${sizeClasses} ${className}`}
    >
      {type}
    </span>
  );
};
