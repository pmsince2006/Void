import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { MobileNavigation } from './MobileNavigation';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { useNavigate } from 'react-router-dom';

export const SiteHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { totalCount: cartCount, openCart } = useCart();
  const { totalCount: wishlistCount, openWishlist } = useWishlist();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'SHOP', href: '/shop' },
    { label: 'COLLECTIONS', href: '/collections' },
    { label: 'JOURNAL', href: '/journal' },
    { label: 'ABOUT', href: '/about' },
  ];

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      setSearchModalOpen(false);
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-[#F4F2ED]/95 backdrop-blur-md border-[#111111]/15 py-3.5 shadow-sm'
            : 'bg-[#F4F2ED] border-transparent py-4'
        }`}
      >
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 flex items-center justify-between">
          {/* Left: Brand Wordmark */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter uppercase text-[#111111] hover:opacity-80 transition-opacity"
            >
              VOID<span className="text-[#777777]">.</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-xs font-mono uppercase tracking-widest transition-colors relative py-1 ${
                    isActive
                      ? 'text-[#111111] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-[#111111]'
                      : 'text-[#777777] hover:text-[#111111]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions (Search, Account, Wishlist, Cart, Mobile Toggle) */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111111] hover:text-[#777777] transition-colors"
              aria-label="Open search dialog"
            >
              <Search className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden lg:inline text-[11px]">SEARCH</span>
            </button>

            {/* Account Link */}
            <Link
              to="/about"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111111] hover:text-[#777777] transition-colors"
              aria-label="User Account"
            >
              <User className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden lg:inline text-[11px]">ACCOUNT</span>
            </Link>

            {/* Wishlist Trigger */}
            <button
              onClick={openWishlist}
              className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-[#111111] hover:text-[#777777] transition-colors relative"
              aria-label={`Watchlist with ${wishlistCount} items`}
            >
              <Heart className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden sm:inline text-[11px]">SAVED</span>
              <span className="text-[10px] font-mono font-bold bg-[#111111] text-[#F4F2ED] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111111] hover:text-[#777777] transition-colors border border-[#111111] px-2.5 py-1.5 hover:bg-[#111111] hover:text-[#F4F2ED]"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
              <span className="text-[11px]">BAG</span>
              <span className="text-[11px] font-mono font-bold">
                [{cartCount}]
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-1 text-[#111111] hover:text-[#777777] transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={navLinks}
        onOpenSearch={() => {
          setMobileMenuOpen(false);
          setSearchModalOpen(true);
        }}
      />

      {/* Search Modal */}
      <Modal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        title="INDEX SEARCH"
        subtitle="VOID ARCHIVE DIRECTORY"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <SearchInput
            autoFocus
            onSearch={handleSearchSubmit}
            placeholder="TYPE PIECE NAME, CODE, OR SILHOUETTE (E.G. COAT, PARKA, BLAZER)"
          />
          <div className="pt-2">
            <p className="text-[10px] font-mono tracking-widest text-[#777777] uppercase mb-2">
              POPULAR QUERY PROTOCOLS:
            </p>
            <div className="flex flex-wrap gap-2">
              {['STRUCTURED COLLAPSE COAT', 'BALLISTIC MONOLITH PARKA', 'TAILORED BLAZER', 'SUB-BASS HOODIE', 'ARCHIVE TROUSER'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => handleSearchSubmit(term)}
                    className="text-[10px] font-mono uppercase px-2.5 py-1 border border-[#111111]/30 hover:border-[#111111] hover:bg-[#111111] hover:text-[#F4F2ED] transition-all"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
