import React from 'react';
import { Link } from 'react-router-dom';
import { X, Search, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
  onOpenSearch: () => void;
  onOpenAccount?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  links,
  onOpenSearch,
  onOpenAccount,
}) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-[#F4F2ED] animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#111111]">
        <Link
          to="/"
          onClick={onClose}
          className="font-display text-2xl font-extrabold tracking-tighter uppercase text-[#111111]"
        >
          VOID<span className="text-[#777777]">.</span>
        </Link>
        <button
          onClick={onClose}
          className="p-2 text-[#111111] hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Search Bar in Mobile Menu */}
      <div className="p-4 border-b border-[#111111]/15">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2.5 border border-[#111111] text-xs font-mono uppercase text-[#777777] bg-white/40"
        >
          <span>SEARCH ARCHIVE DIRECTORY...</span>
          <Search className="w-4 h-4 text-[#111111]" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col space-y-6">
        {links.map((link, idx) => (
          <Link
            key={link.label}
            to={link.href}
            onClick={onClose}
            className="flex items-center justify-between group py-1"
          >
            <span className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#111111] group-hover:translate-x-2 transition-transform">
              {link.label}
            </span>
            <span className="font-mono text-xs text-[#777777]">
              [0{idx + 1}]
            </span>
          </Link>
        ))}

        {onOpenAccount && (
          <button
            onClick={onOpenAccount}
            className="flex items-center justify-between group py-1 text-left w-full"
          >
            <span className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#111111] group-hover:translate-x-2 transition-transform flex items-center gap-2">
              <User className="w-5 h-5 text-[#111111]" />
              <span>{user ? user.name.split(' ')[0] : 'ACCOUNT'}</span>
            </span>
            <span className="font-mono text-xs text-[#777777]">
              {user ? '[ACTIVE]' : '[AUTH]'}
            </span>
          </button>
        )}

        <div className="pt-8 border-t border-[#111111]/20 space-y-4">
          <Link
            to="/shop?drop=DROP+01"
            onClick={onClose}
            className="w-full py-3 bg-[#111111] text-[#F4F2ED] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <span>ACCESS DROP 01 // HORIZON</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#777777]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
            <span>AUTHENTICATED UNISEX SILHOUETTES • ZERO RESTOCKS</span>
          </div>
        </div>
      </nav>

      {/* Footer info in mobile nav */}
      <div className="p-6 border-t border-[#111111] text-xs font-mono text-[#777777] flex justify-between items-center bg-[#E5E0D8]/40">
        <span>VOID ATELIER © 2026</span>
        <span>UTC +00:00</span>
      </div>
    </div>
  );
};
