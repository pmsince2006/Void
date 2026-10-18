import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, ProductFilterParams } from '../types/product';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { FilterDrawer } from '../components/common/FilterDrawer';
import { Button } from '../components/common/Button';
import { SlidersHorizontal } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const drop = searchParams.get('drop') || undefined;
  const sort = (searchParams.get('sort') as ProductFilterParams['sort']) || 'featured';

  const filters: ProductFilterParams = {
    category,
    search,
    drop,
    sort
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    productService
      .getProducts(filters)
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load pieces from the archive.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [category, search, drop, sort]);

  const handleApplyFilters = (newFilters: ProductFilterParams) => {
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.sort) params.set('sort', newFilters.sort);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const categories = [
    { label: 'ALL SILHOUETTES', value: '' },
    { label: 'OUTERWEAR', value: 'outerwear' },
    { label: 'TAILORING', value: 'tailoring' },
    { label: 'KNITWEAR & FLEECE', value: 'knitwear' },
    { label: 'BOTTOMS', value: 'bottoms' },
    { label: 'ACCESSORIES', value: 'accessories' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'ARCHIVE SHOP' }]} className="mb-6" />

      {/* Header title */}
      <div className="border-b border-[#111111] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-1">
            INDEX DIRECTORY // {products.length} SILHOUETTES CATALOGED
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">
            {category ? `${category.toUpperCase()} // CATALOG` : 'ARCHIVE REPOSITORY'}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterDrawerOpen(true)}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            className="font-mono"
          >
            FILTERS & SORT
          </Button>
        </div>
      </div>

      {/* Quick Category Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#111111]/15 scrollbar-none">
        {categories.map((cat) => {
          const isActive = (cat.value === '' && !category) || category === cat.value;
          return (
            <button
              key={cat.label}
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                if (cat.value) {
                  p.set('category', cat.value);
                } else {
                  p.delete('category');
                }
                setSearchParams(p);
              }}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap border transition-all ${
                isActive
                  ? 'bg-[#111111] text-[#F4F2ED] border-[#111111]'
                  : 'border-[#111111]/20 hover:border-[#111111] text-[#111111]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search Input Filter */}
      {search && (
        <div className="mb-6 flex items-center justify-between bg-black/5 p-3 text-xs font-mono">
          <span>ACTIVE QUERY PROTOCOL: "{search}"</span>
          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              p.delete('search');
              setSearchParams(p);
            }}
            className="underline uppercase hover:text-[#777777]"
          >
            CLEAR SEARCH
          </button>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="p-4 border border-rose-800 text-rose-900 bg-rose-50 text-xs font-mono mb-8">
          {error}
        </div>
      )}

      {/* Product Grid */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        columns={4}
        emptyTitle="NO PIECES MATCH CRITERIA"
        emptyDescription="Try selecting a different category or clearing active filters."
      />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};
