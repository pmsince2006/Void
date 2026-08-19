import { Link } from 'react-router-dom'
import { products } from '../data/products'
import ProductCard from './ProductCard'

/**
 * ProductGrid Component
 * Renders the "NEW ARRIVALS" product catalog in a responsive 4-column layout.
 */
export default function ProductGrid() {
  return (
    <section className="w-full bg-black py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-neutral-500">
            VOL. 01 // ESSENTIAL DROPS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase text-white">
            NEW ARRIVALS
          </h2>
          <div className="w-12 h-[1px] bg-neutral-800 mt-2" />
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Products CTA */}
        <div className="flex justify-center pt-6">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-black text-xs font-extrabold tracking-[0.25em] uppercase hover:bg-neutral-200 transition-colors duration-200"
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>
      </div>
    </section>
  )
}
