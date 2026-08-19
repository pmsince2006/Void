import { Link } from 'react-router-dom'

/**
 * CollectionCard Component
 * Displays a single collection/category card with imagery, title, and subtle hover interaction.
 *
 * @param {Object} props
 * @param {string} props.title - Category or Collection name (e.g., "DENIMS")
 * @param {string} props.image - Image URL
 * @param {string} [props.path] - Target route for React Router Link (default: "/collections")
 */
export default function CollectionCard({ title, image, path = '/collections' }) {
  return (
    <Link
      to={path}
      className="group relative block w-full h-[450px] sm:h-[520px] bg-neutral-950 overflow-hidden border border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all duration-300"
    >
      {/* Background Image */}
      <img
        src={image}
        alt={`${title} Collection`}
        className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500 ease-out"
        loading="lazy"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/95" />

      {/* Content Area */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-center items-center z-10">
        <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-mono mb-2">
          CATEGORY
        </span>
        <h3 className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-white uppercase mb-4 transition-transform duration-300 group-hover:-translate-y-1">
          {title}
        </h3>

        {/* Subtle CTA Button/Text */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-white uppercase border-b border-white/60 pb-1 group-hover:border-white transition-all">
          <span>SHOP NOW</span>
          <svg
            className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
}
