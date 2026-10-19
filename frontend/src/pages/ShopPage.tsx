import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, ProductFilterParams } from '../types/product';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { FilterDrawer } from '../components/common/FilterDrawer';
import { Button } from '../components/common/Button';
import { SlidersHorizontal, X } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [gridColumns, setGridColumns] = useState<2 | 4>(2);

  const category = searchParams.get('category') || undefined;
  const collection = searchParams.get('collection') || undefined;
  const search = searchParams.get('search') || undefined;
  const drop = searchParams.get('drop') || undefined;
  const sort = (searchParams.get('sort') as ProductFilterParams['sort']) || 'featured';

  const filters: ProductFilterParams = {
    category,
    collection,
    search,
    drop,
    sort
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    productService
      .getProducts({ category, collection, search, drop, sort })
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
  }, [category, collection, search, drop, sort]);

  const handleApplyFilters = (newFilters: ProductFilterParams) => {
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.collection) params.set('collection', newFilters.collection);
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
    <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 py-10 sm:py-16">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'SHOP' }]} className="mb-8" />

      {/* Header title */}
      <div className="border-b border-[#111111]/15 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-2">
            {collection
              ? `[ COLLECTION // ${collection.toUpperCase()} ]`
              : category
              ? `[ CATEGORY // ${category.toUpperCase()} ]`
              : `[ ARCHIVE REPOSITORY // ${products.length} PIECES AVAILABLE ]`}
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111111]">
            {collection || (category ? `${category.toUpperCase()}` : 'ALL SILHOUETTES')}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* View Density Toggle: 2-Col (4 Rows) / 4-Col (2 Rows) */}
          <div className="hidden sm:flex items-center border border-[#111111]/20 p-0.5">
            <button
              type="button"
              onClick={() => setGridColumns(2)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                gridColumns === 2
                  ? 'bg-[#111111] text-[#F4F2ED]'
                  : 'text-[#777777] hover:text-[#111111]'
              }`}
              title="Large Editorial 2-Column View (4 Rows)"
            >
              2 COL
            </button>
            <button
              type="button"
              onClick={() => setGridColumns(4)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                gridColumns === 4
                  ? 'bg-[#111111] text-[#F4F2ED]'
                  : 'text-[#777777] hover:text-[#111111]'
              }`}
              title="Standard 4-Column View"
            >
              4 COL
            </button>
          </div>

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
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap border transition-all ${
                isActive
                  ? 'bg-[#111111] text-[#F4F2ED] border-[#111111]'
                  : 'border-[#111111]/20 hover:border-[#111111] text-[#111111] bg-transparent'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Active Filter Tags */}
      {(search || collection) && (
        <div className="mb-8 flex flex-wrap items-center gap-3">
          {collection && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#111111] text-[#F4F2ED] text-xs font-mono">
              <span>COLLECTION: {collection}</span>
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.delete('collection');
                  setSearchParams(p);
                }}
                className="hover:opacity-70 transition-opacity ml-1"
                aria-label="Remove collection filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {search && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#111111] text-[#F4F2ED] text-xs font-mono">
              <span>SEARCH: "{search}"</span>
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.delete('search');
                  setSearchParams(p);
                }}
                className="hover:opacity-70 transition-opacity ml-1"
                aria-label="Remove search filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs font-mono uppercase tracking-wider text-[#777777] hover:text-[#111111] underline underline-offset-4 ml-2"
          >
            CLEAR ALL
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
        columns={gridColumns}
        emptyTitle="NO PIECES MATCH CRITERIA"
        emptyDescription="Try selecting a different category or clearing active filters."
      />

      {/* Catalogue Status Footer */}
      {!isLoading && products.length > 0 && (
        <div className="mt-16 pt-8 border-t border-[#111111]/15 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#777777] gap-4">
          <span>SHOWING {products.length} OF {products.length} CATALOGED PIECES</span>
          <span className="uppercase text-[11px]">DROP 01 // HORIZON PROTOCOL</span>
        </div>
      )}

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
