import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * Navbar Component for VOID Streetwear
 * Features:
 * - Text-based VOID brand logo
 * - Center desktop navigation links (SHOP, NEW, COLLECTIONS)
 * - Right utility section (Search icon, ACCOUNT link, BAG indicator)
 * - Mobile responsive hamburger toggle drawer
 */
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile menu on route change
  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  const navLinks = [
    { name: 'SHOP', path: '/shop' },
    { name: 'NEW', path: '/new' },
    { name: 'COLLECTIONS', path: '/collections' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-900 text-white transition-all duration-300">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main Navigation"
      >
        {/* Left Section: Logo & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="md:hidden text-neutral-400 hover:text-white focus:outline-none p-1 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              // Close X icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>

          {/* VOID Wordmark Logo */}
          <Link
            to="/"
            onClick={handleNavClick}
            className="text-xl sm:text-2xl font-black tracking-[0.3em] uppercase text-white hover:opacity-80 transition-opacity"
          >
            VOID
          </Link>
        </div>

        {/* Center Section: Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-10 text-xs font-medium tracking-[0.2em]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative py-1 text-neutral-300 hover:text-white transition-colors duration-200 uppercase ${
                  isActive ? 'text-white font-semibold' : ''
                }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 w-full h-[1px] bg-white transition-transform duration-300 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
                  }`}
                />
              </Link>
            )
          })}
        </div>

        {/* Right Section: Search, Account, Bag */}
        <div className="flex items-center space-x-5 sm:space-x-8 text-xs font-medium tracking-[0.15em]">
          {/* Search Icon */}
          <button
            type="button"
            className="text-neutral-400 hover:text-white transition-colors p-1"
            aria-label="Search items"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>

          {/* Account Link */}
          <Link
            to="/account"
            onClick={handleNavClick}
            className="hidden sm:inline-block text-neutral-400 hover:text-white transition-colors uppercase"
          >
            ACCOUNT
          </Link>

          {/* Bag Indicator */}
          <Link
            to="/shop"
            onClick={handleNavClick}
            className="text-neutral-300 hover:text-white transition-colors uppercase whitespace-nowrap"
          >
            BAG (0)
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-900 bg-black/95 backdrop-blur-lg px-6 py-6 transition-all duration-300">
          <div className="flex flex-col space-y-5 text-sm font-medium tracking-[0.2em]">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={handleNavClick}
                className="text-neutral-300 hover:text-white transition-colors py-1 border-b border-neutral-900/50"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/account"
              onClick={handleNavClick}
              className="sm:hidden text-neutral-400 hover:text-white transition-colors py-1 pt-2"
            >
              ACCOUNT
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
