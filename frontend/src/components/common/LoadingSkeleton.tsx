import React from 'react';

export interface LoadingSkeletonProps {
  type?: 'product-card' | 'text' | 'rect' | 'circle';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'product-card',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (type === 'product-card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="border border-[#111111]/20 p-3 space-y-4 animate-pulse">
            <div className="w-full aspect-[3/4] bg-[#D6D1C8]/60" />
            <div className="space-y-2">
              <div className="h-3 w-1/3 bg-[#D6D1C8]/60" />
              <div className="h-4 w-3/4 bg-[#D6D1C8]/60" />
              <div className="h-4 w-1/4 bg-[#D6D1C8]/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-2 animate-pulse ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-4 bg-[#D6D1C8]/60 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`bg-[#D6D1C8]/60 animate-pulse ${
        type === 'circle' ? 'rounded-full' : ''
      } ${className}`}
    />
  );
};
