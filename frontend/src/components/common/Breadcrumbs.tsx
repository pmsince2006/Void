import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-xs font-mono text-[#777777] uppercase tracking-wider ${className}`}>
      <Link to="/" className="hover:text-[#111111] transition-colors">
        VOID
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-[#777777]/60 shrink-0" />
            {item.href && !isLast ? (
              <Link to={item.href} className="hover:text-[#111111] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#111111] font-medium" aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
