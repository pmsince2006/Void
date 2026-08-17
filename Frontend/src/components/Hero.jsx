import { Link } from 'react-router-dom'
import heroImage from '../assets/hero_streetwear.jpg'

/**
 * Hero Component for VOID Homepage
 * Features:
 * - Full-bleed dark editorial visual area with dark gradient overlay for text readability
 * - High-contrast editorial typography ("BUILT FOR THE UNDEFINED.")
 * - Minimal supporting streetwear statement
 * - Clean, minimal action CTAs ("SHOP COLLECTION", "EXPLORE NEW")
 */
export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] sm:min-h-screen flex items-end justify-start bg-black overflow-hidden pt-16">
      {/* Background Image Container with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="VOID Streetwear Editorial Look"
          className="w-full h-full object-cover object-center opacity-70 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
        />
        {/* Dark Vignette Overlay for Crisp Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-24 w-full flex flex-col justify-end">
        <div className="max-w-2xl space-y-6">
          {/* Collection / Sub-tagline badge */}
          <div className="inline-block">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 border border-neutral-800 bg-black/50 px-3 py-1 backdrop-blur-sm">
              VOL. 01 / ESSENTIALS
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-[0.95]">
            BUILT FOR THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
              UNDEFINED.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-base text-neutral-300 font-normal tracking-wide max-w-md leading-relaxed">
            Streetwear engineered for those who break boundaries and define their own path.
          </p>

          {/* Calls to Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            {/* Primary CTA */}
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors duration-200"
            >
              SHOP COLLECTION
            </Link>

            {/* Secondary CTA */}
            <Link
              to="/new"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-black/60 border border-neutral-700 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-white hover:bg-black/90 transition-all duration-200 backdrop-blur-sm"
            >
              EXPLORE NEW
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
