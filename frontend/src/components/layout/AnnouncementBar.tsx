import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface AnnouncementBarProps {
  message?: string;
  linkText?: string;
  linkHref?: string;
  dismissible?: boolean;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = 'DROP 01 // HORIZON PROTOCOL NOW LIVE — STRICTLY LIMITED TO 80 PIECES PER SILHOUETTE',
  linkText = 'ACCESS DROP',
  linkHref = '/shop?drop=DROP+01',
  dismissible = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Announcement"
      className="bg-[#111111] text-[#F4F2ED] py-2 px-4 border-b border-[#282828] text-xs font-mono select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center text-center gap-2 overflow-hidden">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="tracking-widest uppercase truncate text-[11px] sm:text-xs text-[#F4F2ED]/90">
            {message}
          </span>
          {linkHref && (
            <Link
              to={linkHref}
              className="hidden sm:inline-flex items-center gap-1 underline underline-offset-4 hover:text-white transition-colors text-[11px] tracking-wider uppercase font-semibold text-[#D6D1C8]"
            >
              <span>{linkText}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="text-[#777777] hover:text-[#F4F2ED] p-0.5 transition-colors shrink-0"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
