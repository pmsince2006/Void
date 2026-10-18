import React from 'react';
import { Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  columns = 4,
  emptyTitle,
  emptyDescription,
  className = '',
}) => {
  if (isLoading) {
    return <LoadingSkeleton type="product-card" count={columns * 2} className={className} />;
  }

  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  const columnStyles = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }[columns];

  return (
    <div className={`grid ${columnStyles} gap-6 md:gap-8 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
