import { Link } from 'react-router-dom'

/**
 * ProductCard Component
 * Displays individual product card with image, category, name, price, and optional NEW badge.
 *
 * @param {Object} props
 * @param {Object} props.product - Single product item from products.js
 */
export default function ProductCard({ product }) {
  if (!product) return null

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(product.price)

  return (
    <Link
      to={`/shop`}
      className="group flex flex-col w-full bg-black border border-neutral-900 focus:outline-none transition-all duration-300"
    >
      {/* Product Image Container (~75% Card Height) */}
      <div className="relative w-full aspect-[3/4] bg-neutral-950 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
          loading="lazy"
        />

        {/* Optional "NEW" Badge */}
        {product.isNew && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 bg-white text-black text-[10px] font-extrabold tracking-[0.2em] uppercase shadow-sm">
              NEW
            </span>
          </div>
        )}

        {/* Hover Quick Overlay / Vignette */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Product Details Section */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow space-y-2 border-t border-neutral-900/60 bg-black">
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-500 uppercase block mb-1">
            {product.category}
          </span>
          <h4 className="text-sm sm:text-base font-bold tracking-wider text-white uppercase group-hover:text-neutral-300 transition-colors line-clamp-1">
            {product.name}
          </h4>
        </div>

        <div className="pt-1 flex items-center justify-between border-t border-neutral-900/40">
          <span className="text-sm font-semibold tracking-widest text-neutral-200">
            {formattedPrice}
          </span>
          <span className="text-[10px] tracking-[0.2em] text-neutral-400 font-mono group-hover:translate-x-0.5 transition-transform">
            DETAILS &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
