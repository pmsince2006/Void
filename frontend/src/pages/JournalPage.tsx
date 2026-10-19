import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface JournalArticle {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  linkText: string;
  linkHref: string;
}

const ARTICLES: JournalArticle[] = [
  {
    id: 'art-01',
    tag: 'TEXTILE STUDY',
    title: 'THE WEIGHT OF HEAVY FLEECE',
    excerpt: 'Inside our custom 700gsm loopback French terry: crossover collarless hoods, mineral-dyed pigments, and structural volume built for everyday wear.',
    date: 'OCT 2026',
    readTime: '3 MIN READ',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
    linkText: 'EXPLORE FLEECE & KNITS',
    linkHref: '/shop?category=knitwear',
  },
  {
    id: 'art-02',
    tag: 'TAILORING ARCHIVE',
    title: 'COLLAPSED STRUCTURE: REWRITING FORM',
    excerpt: 'Raw-edge peak lapels, dropped shoulders, and fluid wool gabardine drapery dismantling formal menswear conventions into relaxed silhouettes.',
    date: 'OCT 2026',
    readTime: '4 MIN READ',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
    linkText: 'EXPLORE TAILORING',
    linkHref: '/shop?collection=COLLAPSED%20TAILORING',
  },
  {
    id: 'art-03',
    tag: 'KINETIC HARDWARE',
    title: 'BALLISTIC CORDS & MAGNETIC LOCKS',
    excerpt: 'German Fidlock magnetic quick-releases and 1050D Cordura: how industrial engineering translates into functional unisex carry rigs.',
    date: 'OCT 2026',
    readTime: '3 MIN READ',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',
    linkText: 'EXPLORE ACCESSORIES',
    linkHref: '/shop?category=accessories',
  },
];

export const JournalPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 py-10 sm:py-16">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'JOURNAL' }]} className="mb-8" />

      {/* Header section */}
      <div className="border-b border-[#111111]/15 pb-8 mb-12 sm:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-2">
            [ EDITORIAL ARCHIVE // DISPATCHES FROM THE ATELIER ]
          </span>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-[#111111]">
            VOID JOURNAL
          </h1>
        </div>

        <p className="font-mono text-xs sm:text-sm text-[#777777] max-w-md leading-relaxed">
          Explorations in architectural form, tactile materiality, and contemporary unisex streetwear culture.
        </p>
      </div>

      {/* Featured Editorial Hero Story */}
      <article className="border border-[#111111]/20 bg-[#F4F2ED] group hover:border-[#111111] transition-colors mb-16 sm:mb-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Image Stage */}
          <div className="lg:col-span-7 min-h-[380px] sm:min-h-[480px] lg:min-h-[560px] bg-[#E5E0D8] overflow-hidden relative border-b lg:border-b-0 lg:border-r border-[#111111]/20 group-hover:border-[#111111] transition-colors">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85"
              alt="Sculptural Proportions in Metropolitan Spaces"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 bg-[#111111] text-[#F4F2ED] text-[10px] font-mono px-3 py-1.5 uppercase tracking-widest">
              FEATURED ESSAY // ISSUE 01
            </div>
          </div>

          {/* Text Stage */}
          <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-between bg-[#F4F2ED]">
            <div>
              <div className="flex items-center justify-between font-mono text-xs text-[#777777] mb-4">
                <span>OCTOBER 2026</span>
                <span>5 MIN READ</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#111111] mb-6 leading-none">
                SCULPTURAL PROPORTIONS IN METROPOLITAN SPACES
              </h2>
              <p className="font-mono text-xs sm:text-sm text-[#777777] leading-relaxed mb-4">
                A study in oversized silhouettes, 620gsm bonded Italian wool, and deliberate garment volume designed to disrupt uniform urban landscapes.
              </p>
              <p className="font-mono text-xs sm:text-sm text-[#777777] leading-relaxed mb-8">
                When architecture merges with apparel, clothing ceases to be decorative and becomes protective form.
              </p>
            </div>

            <div className="pt-6 border-t border-[#111111]/15">
              <Link
                to="/shop?collection=CITY%20ARMOR"
                className="editorial-pill text-xs inline-flex items-center gap-2 group/btn"
              >
                <span>EXPLORE CITY ARMOR</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Curated Grid of Editorial Stories */}
      <div className="border-b border-[#111111]/15 pb-4 mb-8 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-[#777777]">
          [ ATELIER ARCHIVE ARTICLES ]
        </span>
        <span className="font-mono text-xs text-[#777777]">
          03 DISPATCHES
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {ARTICLES.map((article) => (
          <article
            key={article.id}
            className="border border-[#111111]/20 bg-[#F4F2ED] group hover:border-[#111111] transition-colors flex flex-col overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="w-full aspect-[16/10] bg-[#E5E0D8] overflow-hidden relative border-b border-[#111111]/20 group-hover:border-[#111111] transition-colors">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 bg-[#111111] text-[#F4F2ED] text-[9px] font-mono px-2.5 py-1 uppercase tracking-widest">
                {article.tag}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] text-[#777777] mb-3">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#111111] mb-3 leading-tight">
                  {article.title}
                </h3>
                <p className="font-mono text-xs text-[#777777] leading-relaxed mb-6">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-[#111111]/15">
                <Link
                  to={article.linkHref}
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#777777] transition-colors"
                >
                  <span>{article.linkText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
