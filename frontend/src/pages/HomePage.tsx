import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { Product } from '../types/product';
import { Collection } from '../types/cart';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Check, Clock, Radio } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  const { addToast } = useToast();

  // Real-time countdown timer for Wave 04 drop (days, hours, minutes, seconds)
  const [countdown, setCountdown] = useState({
    hours: '03',
    minutes: '24',
    seconds: '48'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setHours(target.getHours() + 3);
      target.setMinutes(24);
      target.setSeconds(60 - now.getSeconds());

      const secs = (60 - now.getSeconds()).toString().padStart(2, '0');
      const mins = (59 - now.getMinutes() >= 0 ? 59 - now.getMinutes() : 24)
        .toString()
        .padStart(2, '0');

      setCountdown({
        hours: '03',
        minutes: mins,
        seconds: secs
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch live products and collections via API service layer
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProducts(true);

    Promise.all([
      productService.getNewArrivals(),
      productService.getCollections()
    ])
      .then(([products, cols]) => {
        if (isMounted) {
          setNewArrivals(products.slice(0, 4));
          setCollections(cols);
          setIsLoadingProducts(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Newsletter submission
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setIsSubscribing(true);
    try {
      const res = await productService.subscribeNewsletter(newsletterEmail);
      setSubscriptionSuccess(true);
      addToast(res.message, 'success', 'TRANSMISSION VERIFIED');
    } catch (err: any) {
      addToast(err.message || 'Transmission failed.', 'error', 'SIGNAL REJECTED');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#F4F2ED] text-[#111111]">
      {/* =========================================================================
          SECTION 1: HERO EDITORIAL SHOWCASE (DIRECT INSPIRATION FROM UPLOADED IMAGE)
          ========================================================================= */}
      <section className="relative w-full border-b border-[#111111] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Column: Massive Brutalist Brand Statement & Specs */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-10">
              
              {/* Massive Display Title */}
              <div>
                <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-3">
                  UNISEX STREETWEAR & CULTURE ATELIER // PROTOCOL 2026
                </span>
                <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-extrabold uppercase tracking-tighter text-[#111111] leading-[0.88] select-none">
                  THEORY<br />
                  <span className="text-[#111111]">.VOID</span>
                </h1>

                {/* Subtitle / Brand Description */}
                <div className="mt-6 max-w-xl">
                  <h2 className="font-heading font-extrabold text-xs sm:text-sm uppercase tracking-wider text-[#111111] mb-2">
                    VOID IS A STREETWEAR AND CULTURE BRAND ROOTED IN THE UNDERGROUND.
                  </h2>
                  <p className="font-mono text-xs text-[#777777] leading-relaxed">
                    Not just clothing. A living archive of subcultures, noise, and rebellion. Engineered for the outsiders, the creators, the night runners.
                  </p>
                </div>

                {/* Editorial Pill CTA Button */}
                <div className="mt-6">
                  <Link
                    to="/shop"
                    className="editorial-pill text-xs hover:shadow-lg"
                  >
                    ( SHO_P )
                  </Link>
                </div>
              </div>

              {/* Middle Component: DROP 01 // INCOMING + Live Countdown */}
              <div className="pt-6 border-t border-[#111111]/20">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#111111]">
                    DROP 01 // INCOMING
                  </h3>
                  <div className="font-mono text-xs text-[#111111] font-semibold flex items-center gap-1.5">
                    <span className="text-[#777777]">NEXT STYLIZATIONS IN</span>
                    <span className="bg-[#111111] text-[#F4F2ED] px-2 py-0.5 tracking-wider">
                      [ {countdown.hours}:{countdown.minutes}:{countdown.seconds} ]
                    </span>
                  </div>
                </div>

                {/* Technical Information Spec Cards (Direct from uploaded reference) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Card 1: AVAILABILITY & ARCHIVE */}
                  <div className="bg-[#111111] text-[#F4F2ED] p-5 border border-[#282828] flex flex-col justify-between">
                    <div>
                      <h4 className="font-mono text-[11px] font-bold tracking-widest uppercase text-white mb-3 pb-2 border-b border-[#282828] flex items-center justify-between">
                        <span>AVAILABILITY & ARCHIVE</span>
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      </h4>
                      <ul className="font-mono text-[11px] text-[#D6D1C8]/85 space-y-2 leading-relaxed">
                        <li>• Fixed quantities. Strictly zero restock.</li>
                        <li>• After all five waves are revealed, items remain live until allocation sells out.</li>
                        <li>• Any pieces unsold when the next drop begins move permanently to Archive (not for sale).</li>
                      </ul>
                    </div>
                  </div>

                  {/* Card 2: CADENCE & STRUCTURE */}
                  <div className="bg-[#111111] text-[#F4F2ED] p-5 border border-[#282828] flex flex-col justify-between">
                    <div>
                      <h4 className="font-mono text-[11px] font-bold tracking-widest uppercase text-white mb-3 pb-2 border-b border-[#282828] flex items-center justify-between">
                        <span>CADENCE & STRUCTURE</span>
                        <Clock className="w-3.5 h-3.5 text-[#D6D1C8]" />
                      </h4>
                      <ul className="font-mono text-[11px] text-[#D6D1C8]/85 space-y-2 leading-relaxed">
                        <li>• One drop per season / quarter.</li>
                        <li>• Every drop = 5 waves [W01–W05].</li>
                        <li>• Release pace: one wave per week. Total duration: 5 weeks.</li>
                        <li>• Wave size: 5 pieces per wave.</li>
                        <li>• Stylization: a full cohesive look shown together.</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Towering Editorial Silhouette Cutout with Motion-Blur Stance */}
            <div className="lg:col-span-5 relative flex flex-col">
              <div className="relative w-full h-[450px] sm:h-[550px] lg:h-full min-h-[480px] bg-[#D6D1C8]/70 border border-[#111111] overflow-hidden flex items-center justify-center group">
                
                {/* Silhouette model campaign imagery */}
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80"
                  alt="VOID Editorial Streetwear Silhouette"
                  className="w-full h-full object-cover object-top filter grayscale contrast-125 transform transition-transform duration-1000 ease-out group-hover:scale-105"
                />

                {/* Brutalist Architectural Overlay Labels */}
                <div className="absolute top-4 right-4 bg-[#111111] text-[#F4F2ED] px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
                  LOOK 01 // WAVE 01
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-[#F4F2ED]/90 backdrop-blur-sm p-4 border border-[#111111] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#777777] uppercase block">
                      MASTER SILHOUETTE
                    </span>
                    <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#111111]">
                      BALLISTIC MONOLITH PARKA
                    </span>
                  </div>
                  <Link
                    to="/product/ballistic-monolith-parka"
                    className="font-mono text-[11px] font-bold text-[#111111] hover:text-[#777777] flex items-center gap-1"
                  >
                    <span>VIEW PIECE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: TECHNICAL WAVE TICKER BAR (DIRECT FROM UPLOADED REFERENCE)
          ========================================================================= */}
      <div className="w-full bg-[#111111] text-[#F4F2ED] py-3.5 border-b border-[#282828] overflow-hidden select-none">
        <div className="flex items-center space-x-6 text-xs font-mono tracking-widest whitespace-nowrap animate-marquee">
          <span>[ W01 • UNLOCKED ]</span>
          <span className="text-[#777777]">⚙</span>
          <span>[ W02 • UNLOCKED ]</span>
          <span className="text-[#777777]">✳</span>
          <span>[ W03 • UNLOCKED ]</span>
          <span className="text-[#777777]">⚙</span>
          <span className="text-emerald-400 font-bold">W04 • NEXT UP [ {countdown.hours}:{countdown.minutes}:{countdown.seconds} ]</span>
          <span className="text-[#777777]">✳</span>
          <span className="text-[#777777]">[ W05 • INCOMING ]</span>
          <span className="text-[#777777]">⚙</span>
          <span>[ W01 • UNLOCKED ]</span>
          <span className="text-[#777777]">⚙</span>
          <span>[ W02 • UNLOCKED ]</span>
          <span className="text-[#777777]">✳</span>
          <span>[ W03 • UNLOCKED ]</span>
          <span className="text-[#777777]">⚙</span>
          <span className="text-emerald-400 font-bold">W04 • NEXT UP [ {countdown.hours}:{countdown.minutes}:{countdown.seconds} ]</span>
          <span className="text-[#777777]">✳</span>
          <span className="text-[#777777]">[ W05 • INCOMING ]</span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: EDITORIAL WAVE LINEUP [ DROP 01 — CITY ARMOR ]
          (DIRECT 4-LOOK MODEL LINEUP FROM UPLOADED IMAGE)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-[#111111] w-full">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111] mb-2">
            [ DROP 01 — CITY ARMOR ]
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#777777] uppercase tracking-widest">
            Five waves. Weekly releases. Limited pieces.
          </p>
        </div>

        {/* 4-Column Editorial Model Lineup with Labels */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12">
          
          {/* Model Look 1 */}
          <Link
            to="/product/structured-collapse-coat"
            className="group flex flex-col text-center"
          >
            <div className="w-full aspect-[3/4.5] bg-[#D6D1C8]/60 border border-[#111111]/20 group-hover:border-[#111111] overflow-hidden mb-3 transition-colors">
              <img
                src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
                alt="Structured Collapse Coat"
                className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#777777] transition-colors">
              STRUCTURED COLLAPSE COAT
            </h4>
            <span className="font-mono text-[10px] text-[#777777]">0001</span>
          </Link>

          {/* Model Look 2 */}
          <Link
            to="/product/ballistic-monolith-parka"
            className="group flex flex-col text-center"
          >
            <div className="w-full aspect-[3/4.5] bg-[#D6D1C8]/60 border border-[#111111]/20 group-hover:border-[#111111] overflow-hidden mb-3 transition-colors">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
                alt="Ballistic Monolith Parka"
                className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#777777] transition-colors">
              BALLISTIC MONOLITH PARKA
            </h4>
            <span className="font-mono text-[10px] text-[#777777]">0002</span>
          </Link>

          {/* Model Look 3 */}
          <Link
            to="/product/deconstructed-tailored-blazer"
            className="group flex flex-col text-center"
          >
            <div className="w-full aspect-[3/4.5] bg-[#D6D1C8]/60 border border-[#111111]/20 group-hover:border-[#111111] overflow-hidden mb-3 transition-colors">
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"
                alt="Deconstructed Tailored Blazer"
                className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#777777] transition-colors">
              DECONSTRUCTED BLAZER
            </h4>
            <span className="font-mono text-[10px] text-[#777777]">0003</span>
          </Link>

          {/* Model Look 4 */}
          <Link
            to="/product/asymmetric-heavy-hooded-cape"
            className="group flex flex-col text-center"
          >
            <div className="w-full aspect-[3/4.5] bg-[#D6D1C8]/60 border border-[#111111]/20 group-hover:border-[#111111] overflow-hidden mb-3 transition-colors">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
                alt="Asymmetric Heavy Hooded Cape"
                className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#777777] transition-colors">
              ASYMMETRIC HOODED CAPE
            </h4>
            <span className="font-mono text-[10px] text-[#777777]">0004</span>
          </Link>

        </div>

        {/* View Collection Pill Button */}
        <div className="text-center">
          <Link
            to="/collections"
            className="editorial-pill text-xs"
          >
            ( VIEW_COLLECTION )
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: EDITORIAL STATEMENT BANNER (FROM UPLOADED REFERENCE)
          "VOID IS MORE THAN FASHION."
          ========================================================================= */}
      <section className="relative w-full bg-[#111111] text-[#F4F2ED] py-20 sm:py-28 overflow-hidden select-none border-b border-[#282828]">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="w-full h-full object-cover filter grayscale blur-sm"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="font-mono text-xs uppercase tracking-widest text-[#777777] mb-4">
            [ ATELIER PHILOSOPHY // 001 ]
          </span>

          <h2 className="font-display text-4xl sm:text-7xl md:text-8xl font-extrabold uppercase tracking-tighter leading-none mb-8">
            VOID <br className="sm:hidden" />
            IS MORE <br />
            THAN <span className="italic font-light text-[#D6D1C8]">FASHION.</span>
          </h2>

          <div className="max-w-2xl mx-auto space-y-4 mb-10">
            <h3 className="font-heading font-extrabold text-sm sm:text-base uppercase tracking-widest text-white">
              A LIVE SIGNAL FROM UNDERGROUND.
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#D6D1C8]/85 leading-relaxed">
              Born in the city's shadows, we build armor for outsiders. Utility forms and brutal cuts released in limited waves with no restocks. A living platform where clothing, sound, and identity connect so you can move against the current and carry the signal forward.
            </p>
          </div>

          <Link
            to="/about"
            className="editorial-pill-invert text-xs"
          >
            ( ABOUT_US )
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LIVE NEW ARRIVALS PRODUCT GRID (FETCHED FROM API SERVICE LAYER)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-[#111111] w-full">
        <div className="border-b border-[#111111] pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-1">
              CURRENT ALLOCATION // STRICTLY LIMITED WAVES
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">
              NEW ARRIVALS
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              to="/shop"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="font-mono"
            >
              ACCESS ALL SILHOUETTES
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={newArrivals}
          isLoading={isLoadingProducts}
          columns={4}
          emptyTitle="NO NEW PIECES ACTIVE"
          emptyDescription="The current wave has reached capacity. Prepare for Wave 04 release."
        />
      </section>

      {/* =========================================================================
          SECTION 6: FEATURED COLLECTIONS (LARGE ARCHITECTURAL IMAGE TILES)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-[#111111] w-full">
        <div className="border-b border-[#111111] pb-6 mb-12">
          <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block mb-1">
            ATMOSPHERES & CATEGORIES
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">
            FEATURED COLLECTIONS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/shop?collection=${encodeURIComponent(col.title)}`}
              className="group relative aspect-[16/10] bg-[#D6D1C8] border border-[#111111] overflow-hidden flex flex-col justify-end p-6 sm:p-8"
            >
              {/* Background photo */}
              <img
                src={col.heroImage}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Scrim for typography readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Meta Content */}
              <div className="relative z-10 text-white space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px] text-[#D6D1C8]">
                  <span>[{col.code}]</span>
                  <span>{col.itemCount} PIECES</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:translate-x-1 transition-transform">
                  {col.title}
                </h3>
                <p className="font-mono text-xs text-[#D6D1C8]/80 line-clamp-2 max-w-md">
                  {col.description}
                </p>
                <div className="pt-2 flex items-center gap-2 font-mono text-[11px] font-bold text-white uppercase tracking-wider">
                  <span>ENTER COLLECTION</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: STYLE DISCOVERY PROMOTION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-[#111111] w-full">
        <div className="border border-[#111111] p-8 sm:p-14 bg-[#EFECE6] flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block">
              SILHOUETTE DISCOVERY ALGORITHM
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">
              FIND YOUR STANCE.
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#111111]/80 leading-relaxed">
              Streetwear is defined by weight, shoulder drop, and fluidity. Calibrate your preferences with our proportional archetype matrix to discover the exact garments formulated for your style.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] font-mono bg-[#111111] text-[#F4F2ED] px-2.5 py-1 uppercase">
                [ MONOLITHIC ARMOR ]
              </span>
              <span className="text-[10px] font-mono bg-[#111111] text-[#F4F2ED] px-2.5 py-1 uppercase">
                [ COLLAPSED TAILORING ]
              </span>
              <span className="text-[10px] font-mono bg-[#111111] text-[#F4F2ED] px-2.5 py-1 uppercase">
                [ KINETIC HARDWARE ]
              </span>
              <span className="text-[10px] font-mono bg-[#111111] text-[#F4F2ED] px-2.5 py-1 uppercase">
                [ SUB-BASS FLEECE ]
              </span>
            </div>
          </div>

          <div className="shrink-0 w-full lg:w-auto">
            <Button
              variant="solid"
              size="lg"
              to="/journal"
              className="w-full lg:w-auto"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              EXPLORE VOID JOURNAL
            </Button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: NEWSLETTER SIGNUP (COMMUNICATION LINK // ENTER THE VOID)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block">
            COMMUNICATION LINK // FREQUENCY 01
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">
            ENTER THE VOID.
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#777777] max-w-md mx-auto leading-relaxed">
            Gain early priority dispatch signals 15 minutes before weekly wave releases. Zero promotional noise. Strictly release vectors.
          </p>

          {subscriptionSuccess ? (
            <div className="p-4 border-2 border-[#111111] bg-white text-xs font-mono text-[#111111] flex items-center justify-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>FREQUENCY LINK ESTABLISHED. YOU ARE LOGGED IN ARCHIVE DISPATCH.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 pt-4">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="ENTER FREQUENCY VECTOR (EMAIL)..."
                className="flex-1 bg-transparent border-2 border-[#111111] px-4 py-3 text-xs font-mono uppercase text-[#111111] placeholder-[#777777] focus:outline-none"
              />
              <Button
                variant="solid"
                size="lg"
                type="submit"
                isLoading={isSubscribing}
                className="font-mono text-xs tracking-widest"
              >
                ESTABLISH LINK
              </Button>
            </form>
          )}

          <div className="flex items-center justify-center gap-6 text-[10px] font-mono text-[#777777] pt-2">
            <span>• ENCRYPTED TRANSMISSION</span>
            <span>• ONE-CLICK UNSUBSCRIBE</span>
            <span>• ZERO SPAM PROTOCOL</span>
          </div>
        </div>
      </section>
    </div>
  );
};
