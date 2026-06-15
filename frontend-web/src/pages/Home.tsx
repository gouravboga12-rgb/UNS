import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { ProductCard } from '../components/ProductCard';
import { 
  Sparkles, 
  Leaf, 
  ArrowRight, 
  ArrowUpRight,
  MessageSquare,
  ZoomIn,
  Download,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp,
  Droplet,
  Users,
  Recycle,
  Award,
  Zap
} from 'lucide-react';

export const Home: React.FC = () => {
  const products = useSelector((state: RootState) => state.products.items);
  const categories = useSelector((state: RootState) => state.products.categories);

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  // States for interactive sliders & widgets
  const [heroImgIndex, setHeroImgIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('catalog');
  const [zoomedImage, setZoomedImage] = React.useState<string | null>(null);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  // ── Counting animation for stats section ──
  const statsRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState({ litres: 0, dealers: 0, refills: 0, families: 0 });
  const [counted, setCounted] = useState(false);

  const statsTargets = { litres: 50000, dealers: 100, refills: 25000, families: 15000 };

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted) {
          setCounted(true);
          const duration = 2000; // 2 seconds
          const steps = 60;
          const interval = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            // ease-out: progress^0.5
            const eased = Math.min(Math.sqrt(progress), 1);
            setCounts({
              litres:   Math.round(eased * statsTargets.litres),
              dealers:  Math.round(eased * statsTargets.dealers),
              refills:  Math.round(eased * statsTargets.refills),
              families: Math.round(eased * statsTargets.families),
            });
            if (step >= steps) clearInterval(timer);
          }, interval);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [counted]);

  const heroImages = [
    { url: '/banners/p6.jpeg', title: 'Advanced Floor Cleaner', desc: 'Deep cleaning & fresh fragrance' },
    { url: '/banners/p13.jpeg', title: 'Power Toilet Cleaner', desc: 'Kills 99.9% germs, removes tough stains' },
    { url: '/banners/p14-bathroom.jpeg', title: 'Premium Bathroom Cleaner', desc: 'Powerful scaling & grime remover' },
    { url: '/banners/p7.jpeg', title: 'Moisturizing Hand Wash', desc: 'Gentle on hands, tough on germs' },
    { url: '/banners/p9.jpeg', title: 'Concentrated Dish Washer', desc: 'Tough on grease, fresh lemon power' },
    { url: '/banners/p8.jpeg', title: 'Streak-Free Glass Cleaner', desc: 'Crystal clear shine, dust repellent' },
    { url: '/banners/p4.jpeg', title: 'Car Wash Shampoo', desc: 'High foaming paint protection' },
    { url: '/banners/p12.jpeg', title: 'Enzymatic Detergent Liquid', desc: 'Brighter clothes, cleaner future' },
  ];

  const showcaseBanners = [
    { id: 'catalog', name: 'Product Catalog', url: '/banners/about_lineup.png', title: 'Complete UNS Product Grid', desc: 'Browse all our 12 home and commercial cleaning formulations.' },
    { id: 'range', name: 'Product Range Flyer', url: '/banners/p11.jpeg', title: 'UNS Cleaning Range & Uses', desc: 'An official overview flyer showcasing the exact purposes, features and applications of the UNS chemical range.' },
    { id: 'brochure', name: 'UNS Company Brochure', url: '/banners/p14.jpeg', title: '3-Panel Corporate Brochure', desc: 'Learn more about why to choose UNS, our high-quality raw materials, and read our detailed company catalog.' },
    { id: 'dealer', name: 'Dealer & Distributor Flyer', url: '/banners/p1.jpeg', title: 'B2B Distributorship Flyer', desc: 'Interested in becoming a dealer? Check out our official trade brochure with contact details and address.' },
    { id: 'lineup', name: 'All Products Lineup', url: '/banners/p5.jpeg', title: 'UNS Complete Shelf Collection', desc: 'See our full chemical lineup including household cleaners, personal hygiene hand washes, laundry care detergents, and soaps.' },
  ];

  const concernList = [
    { title: 'Grease & Grime', category: 'kitchen-cleaning', desc: 'Powerful dishwash solutions', image: '/banners/p9.jpeg' },
    { title: 'Tough Fabric Stains', category: 'laundry-care', desc: 'Advanced laundry liquids & soaps', image: '/banners/p12.jpeg' },
    { title: 'Muddy & Scaled Floors', category: 'home-cleaning', desc: 'High-gloss floor disinfectants', image: '/banners/p6.jpeg' },
    { title: 'Stained Toilets & Baths', category: 'home-cleaning', desc: 'Thick germ-killing active gels', image: '/banners/p13.jpeg' },
    { title: 'Cloudy Windows & Mirrors', category: 'home-cleaning', desc: 'Streak-free window cleaner sprays', image: '/banners/p8.jpeg' },
    { title: 'Dry & Germ-laden Hands', category: 'personal-hygiene', desc: 'Moisturizing neem & tulsi hand wash', image: '/banners/p7.jpeg' },
  ];

  const faqs = [
    {
      q: "Are UNS products safe for babies and pets?",
      a: "Yes, absolutely! Our formulations are pH-balanced and created using natural plant-derived surfactants. They are completely free from harsh acids, chlorine bleach, and phosphates, making them safe for households with infants and domestic pets."
    },
    {
      q: "What is the difference between household and commercial cleaners?",
      a: "Our commercial cleaning range is sold in bulk-sized 5 Litre canisters and is highly concentrated to tackle heavy industrial soilage in offices, factories, hotels, and hospitals. Our household range is packaged in convenient ready-to-use sizes (250ml - 1L) with optimized triggers and nozzles."
    },
    {
      q: "How can I register as an authorized UNS distributor?",
      a: "We are actively expanding our retail distribution network. You can register interest by submitting the contact form on our Contact page or click 'Inquire via WhatsApp' to chat directly with our trade team. We offer marketing support, collaterals, and tiered pricing schemes."
    },
    {
      q: "Is Cash on Delivery (COD) available for orders?",
      a: "Yes! We support Cash on Delivery (COD) as well as order booking through WhatsApp. You can add items to your cart, fill in your details, and place your order securely."
    },
    {
      q: "Where are UNS products manufactured?",
      a: "All our formulations are blended, packed, and quality-audited at our state-of-the-art manufacturing facility located in Siddipet, Telangana, India. We maintain strict batch consistency controls in our analytical laboratory."
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setHeroImgIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleWhatsAppB2B = () => {
    const whatsappNumber = "917396158011";
    const message = encodeURIComponent("Hello UNS! I am interested in dealership / distributorship opportunities. Please share product catalogs and commercial terms.");
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`, '_blank');
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="relative bg-[#FAFAFA] text-slate-800 font-sans">
      
      {/* 1. Scrolling Announcement Bar — Infinite Marquee (pure CSS) */}
      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { display: flex; align-items: center; width: max-content; animation: ticker 28s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
        .ticker-sep { line-height: 1; display: inline-flex; align-items: center; }
      `}</style>
      <div className="w-full bg-teal-950 text-white py-2.5 overflow-hidden border-b border-teal-800 select-none">
        <div className="ticker-track">
          {[...Array(2)].flatMap((_, gi) =>
            [
              '🌱 100% Plant-Derived Active Surfactants',
              '🛡️ Tested 99.9% Germ Protection',
              '👶 Kid Safe & Pet Friendly Formulations',
              '🇮🇳 Proudly Made In India',
              '🚚 Fast Delivery Across South India',
              '💵 COD & WhatsApp Orders Available',
            ].flatMap((item, i) => [
              <span key={`${gi}-${i}`} className="text-xs font-bold uppercase tracking-widest text-white px-8 whitespace-nowrap flex-shrink-0">{item}</span>,
              <span key={`${gi}-sep-${i}`} className="ticker-sep text-teal-400 flex-shrink-0 text-base">•</span>,
            ])
          )}
        </div>
      </div>

      {/* 2. Circle Categories Quick Navigation — Horizontal Scroll */}
      <section className="py-10 bg-white border-b border-slate-100 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-full">
              Quick Browse By Segment
            </span>
          </div>
        </div>

        {/* Horizontally scrollable row — centered when all fit, scrollable on small screens */}
        <div className="relative">
          <div className="flex gap-8 sm:gap-12 overflow-x-auto pb-4 px-4 sm:px-8 lg:px-16 scroll-smooth no-scrollbar justify-start lg:justify-center">
            {(() => {
              const catConfig: Record<string, { gradient: string; img: string }> = {
                'home-cleaning':       { gradient: 'from-emerald-300 via-green-200 to-teal-100',   img: '/banners/p6.jpeg' },
                'kitchen-cleaning':    { gradient: 'from-orange-300 via-amber-200 to-yellow-100',  img: '/banners/p9.jpeg' },
                'personal-hygiene':    { gradient: 'from-purple-300 via-violet-200 to-pink-100',   img: '/banners/p7.jpeg' },
                'laundry-care':        { gradient: 'from-blue-300 via-sky-200 to-cyan-100',        img: '/banners/p12.jpeg' },
                'vehicle-care':        { gradient: 'from-rose-300 via-pink-200 to-red-100',        img: '/banners/p4.jpeg' },
                'commercial-cleaning': { gradient: 'from-teal-300 via-cyan-200 to-emerald-100',   img: '/banners/p14-bathroom.jpeg' },
              };
              // Clean display name: remove " Products" suffix
              const cleanName = (name: string) => name.replace(/ Products$/i, '');
              return categories.map((cat) => {
                const cfg = catConfig[cat.slug] || { gradient: 'from-slate-200 via-slate-100 to-white', img: '/banners/p5.jpeg' };
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className="flex flex-col items-center flex-shrink-0 group cursor-pointer"
                    style={{ minWidth: '110px', maxWidth: '130px' }}
                  >
                    {/* Circle with gradient + product image */}
                    <div className={`relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br ${cfg.gradient} p-1 shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                      {/* Outer ring on hover */}
                      <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-white/70 transition-all duration-300" />
                      {/* Inner circle with image */}
                      <div className="w-full h-full rounded-full overflow-hidden bg-white/20">
                        <img
                          src={cfg.img}
                          alt={cleanName(cat.name)}
                          className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    {/* Category label — clean name only */}
                    <div className="mt-3 text-center px-1">
                      <span className="font-heading text-xs sm:text-sm font-bold text-heading group-hover:text-primary transition-colors leading-snug block">
                        {cleanName(cat.name)}
                      </span>
                    </div>
                  </Link>
                );
              });
            })()}
          </div>

          {/* Fade edges for scroll hint */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
        </div>
      </section>

      {/* 3. Hero Section (Gradient Background + Slider) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-550 via-teal-900 to-teal-950 bg-[#073E3B] text-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#14b8a6,transparent_60%)] opacity-25" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6" data-aos="fade-right">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-800/60 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} /> Ready to make the switch?
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Toxin-Free Clean. <br />
              <span className="text-secondary">Safe For Families.</span>
            </h1>
            <p className="text-slate-350 text-base sm:text-lg max-w-lg leading-relaxed">
              Explore plant-based, dermatologically approved household & commercial cleaning products formulated by UNS. Cruelty-free, safe for kids and pets.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/products"
                className="bg-accent hover:bg-accent-dark text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
              >
                Shop Our Range 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={handleWhatsAppB2B}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3.5 px-8 rounded-full transition-all flex items-center gap-2"
              >
                Become a Dealer 
                <ArrowUpRight size={18} />
              </button>
            </div>
            
            {/* Small badging trust icons */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">★★★★★</span>
                <span className="text-xs text-slate-300 font-semibold">15,000+ Happy Families</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="text-xs text-slate-300 font-semibold">
                Designed & Manufactured in Telangana
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup Flyer Slider */}
          <div className="relative flex justify-center animate-fade-in" data-aos="zoom-in" data-aos-delay="200">
            <div className="w-full max-w-[320px] sm:max-w-[380px] h-[420px] sm:h-[480px] bg-gradient-to-tr from-teal-550 to-teal-800 rounded-3xl relative overflow-hidden shadow-2xl flex items-center justify-center p-3 border-4 border-white/10">
              <img
                src={heroImages[heroImgIndex].url}
                alt={heroImages[heroImgIndex].title}
                className="w-full h-full object-cover rounded-2xl opacity-95 transition-all duration-700 ease-in-out"
                key={heroImgIndex}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent p-5 rounded-b-2xl">
                <span className="text-[9px] uppercase font-bold tracking-widest text-teal-300">Official Product Flyer</span>
                <h3 className="font-heading text-sm sm:text-base font-bold text-white transition-all duration-300">{heroImages[heroImgIndex].title}</h3>
                <p className="text-[11px] text-slate-300 transition-all duration-300">{heroImages[heroImgIndex].desc}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. "Mom's Favorites" (Bestsellers with Social Proof Badges) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
              <Zap size={12} /> Bestsellers
            </span>
            <h2 className="text-3xl font-bold text-heading mt-3">Mom's Favorites</h2>
            <p className="text-muted mt-2">Our customer favorites, rated 5-stars by thousands of families across South India.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {featuredProducts.map((prod, index) => {
              const socialProofLabels = [
                "Trusted by 1.8k+ families",
                "99.9% Germ Protection",
                "Toxin-free plant power",
                "Best seller in laundry"
              ];
              const label = socialProofLabels[index % socialProofLabels.length];
              return (
                <div 
                  key={prod.id} 
                  data-aos="fade-up" 
                  data-aos-delay={index * 100}
                  className="relative group flex flex-col h-full bg-white rounded-2xl border border-border shadow-soft hover:shadow-soft-lg transition-all duration-300"
                >
                  {/* Custom Social Proof gold Badge */}
                  <span className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                    {label}
                  </span>
                  
                  <div className="flex-1 flex flex-col">
                    <ProductCard product={prod} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. "Why We're Different" - Core USPs Row */}
      <section className="py-16 bg-emerald-50/50 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-heading">Why We're Different</h2>
            <p className="text-muted text-sm mt-1">Discover essential cleaning solutions designed to keep your home safe & fresh.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            
            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <Users size={22} />
              </div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-heading">Designed by Doctors</h4>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">Formulated under strict pediatric and safety audits.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <Leaf size={22} />
              </div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-heading">Plant-Based</h4>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">Surfactants derived from active coconut extracts.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <Award size={22} />
              </div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-heading">Baby & Pet Safe</h4>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">Complete skin-safety for crawling toddlers & pets.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <Droplet size={22} />
              </div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-heading">No Added Colorants</h4>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">100% color-free chemical bases without dyes.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <Recycle size={22} />
              </div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-heading">Biodegradable</h4>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">Eco-conscious packaging and compounds.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. "Which Mess Matters?" - Concern-Based Shopping Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14" data-aos="fade-up">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
              Shop by Concern
            </span>
            <h2 className="text-3xl font-bold text-heading mt-3">Which Mess Matters?</h2>
            <p className="text-muted mt-2">Find the exact cleaning solution tailored to solve your specific hygiene challenges.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {concernList.map((item, index) => (
              <Link
                key={index}
                to={`/products?category=${item.category}`}
                className="bg-amber-50/40 rounded-2xl p-6 border border-amber-100/50 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300 flex flex-col justify-between group h-full shadow-soft"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="space-y-2">
                  <h3 className="font-heading text-sm sm:text-base font-bold text-slate-800 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-650 leading-tight">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-amber-100/30">
                  <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Products <ArrowRight size={12} />
                  </span>
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Milestone stats: "It's not just clean, it's UNS Clean" */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-heading mb-3">It's Not Just Clean, It's UNS Clean</h2>
          <p className="text-muted max-w-2xl mx-auto text-sm mb-12">
            Formulating safe and certified cleaning chemicals trusted by retail households and businesses alike.
          </p>

          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center hover:shadow-soft-lg transition-all hover:-translate-y-1 duration-300" data-aos="fade-up">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-800 tabular-nums">
                {counts.litres.toLocaleString()} +
              </span>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-2">Clean Litres Sold</span>
              <p className="text-[10px] text-slate-500 mt-1">Daily retail and wholesale supplies.</p>
            </div>

            <div className="bg-orange-50/60 p-6 rounded-2xl border border-orange-100 flex flex-col items-center hover:shadow-soft-lg transition-all hover:-translate-y-1 duration-300" data-aos="fade-up" data-aos-delay="100">
              <span className="text-3xl sm:text-4xl font-extrabold text-orange-800 tabular-nums">
                {counts.dealers.toLocaleString()} +
              </span>
              <span className="text-xs font-bold text-orange-700 uppercase tracking-wider mt-2">Dealers & Distributors</span>
              <p className="text-[10px] text-slate-500 mt-1">Authorized partners across South India.</p>
            </div>

            <div className="bg-purple-50/60 p-6 rounded-2xl border border-purple-100 flex flex-col items-center hover:shadow-soft-lg transition-all hover:-translate-y-1 duration-300" data-aos="fade-up" data-aos-delay="200">
              <span className="text-3xl sm:text-4xl font-extrabold text-purple-800 tabular-nums">
                {counts.refills.toLocaleString()} +
              </span>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider mt-2">Refills Completed</span>
              <p className="text-[10px] text-slate-500 mt-1">Reducing single-use plastic waste.</p>
            </div>

            <div className="bg-pink-50/60 p-6 rounded-2xl border border-pink-100 flex flex-col items-center hover:shadow-soft-lg transition-all hover:-translate-y-1 duration-300" data-aos="fade-up" data-aos-delay="300">
              <span className="text-3xl sm:text-4xl font-extrabold text-pink-800 tabular-nums">
                {counts.families.toLocaleString()} +
              </span>
              <span className="text-xs font-bold text-pink-700 uppercase tracking-wider mt-2">Happy Families</span>
              <p className="text-[10px] text-slate-500 mt-1">Trusting us with their daily hygiene.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Founder Story & Key Surfactant Details */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            
            {/* The Power of Coconut Surfactants */}
            <div className="bg-emerald-900 text-white p-8 sm:p-12 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-lg" data-aos="fade-right">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#059669,transparent_75%)] opacity-35" />
              <div className="relative z-10 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-850 px-3 py-1 rounded-full border border-emerald-700">
                  Active Ingredients
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold">The Power of Coconut Surfactants</h3>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  Unlike conventional cleaners that use petroleum-derived active chemicals (which leave toxic residue on floors and strip skin moisture), UNS products feature active cleaning agents derived from natural coconut oil.
                </p>
                <ul className="space-y-2 text-xs text-emerald-200">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <strong>Coconut Jhaag:</strong> Soft, rich foam that naturally lifts dirt.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <strong>Dermatologically Approved:</strong> Neutral pH safe for sensitive skin.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <strong>100% Biodegradable:</strong> Discharged greywater does not harm aquatic soil.
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-950 bg-accent hover:bg-accent-light px-5 py-3 rounded-full transition-colors shadow-md">
                  Browse Formulations <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Our Siddipet Manufacturing Story */}
            <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200/60 flex flex-col justify-between shadow-soft" data-aos="fade-left">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                  Our Facility
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-heading">Direct From Manufacturer Pricing</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We formulate, blend, and bottle every single drops of cleaners at our state-of-the-art chemical manufacturing plant in Siddipet, Telangana. By operating our own analytical chemistry lab and automated lines, we bypass distributor margins.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                    <span className="block text-xl font-bold text-primary">50,000L</span>
                    <span className="text-[10px] text-muted">Daily processing limits</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                    <span className="block text-xl font-bold text-primary">pH 7.0</span>
                    <span className="text-[10px] text-muted">Strict batch audits</span>
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <Link to="/about" className="inline-flex items-center gap-2 text-xs font-bold text-white bg-primary hover:bg-primary-light px-5 py-3 rounded-full transition-colors shadow-sm">
                  Our Processing Story <ArrowRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Official Product Flyers & Catalog tab showcase gallery with Zoom lightbox modal */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Official Media & Documentation
            </span>
            <h2 className="text-3xl font-bold text-heading mt-3">Promotional Flyers & Catalog</h2>
            <p className="text-muted mt-2">
              Browse our official flyers, product range brochures, and distributorship terms in English only.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" data-aos="fade-up" data-aos-delay="100">
            
            {/* Tabs List */}
            <div className="lg:col-span-4 space-y-3">
              {showcaseBanners.map((banner) => (
                <button
                  key={banner.id}
                  onClick={() => setActiveTab(banner.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col ${
                    activeTab === banner.id
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-white border-border text-slate-700 hover:border-primary/50 hover:bg-slate-50/50'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${activeTab === banner.id ? 'text-teal-200' : 'text-primary'}`}>
                    {banner.name}
                  </span>
                  <span className="font-heading text-sm font-bold mt-1">
                    {banner.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Preview Panel */}
            {(() => {
              const selectedBanner = showcaseBanners.find(b => b.id === activeTab) || showcaseBanners[0];
              return (
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-border shadow-soft space-y-4">
                  <div className="relative group overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center max-h-[500px]">
                    <img
                      src={selectedBanner.url}
                      alt={selectedBanner.title}
                      className="max-h-[500px] object-contain w-auto transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        onClick={() => setZoomedImage(selectedBanner.url)}
                        className="p-3 bg-white text-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                        title="Zoom Image"
                      >
                        <ZoomIn size={20} />
                      </button>
                      <a
                        href={selectedBanner.url}
                        download
                        className="p-3 bg-white text-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform"
                        title="Download Flyer"
                      >
                        <Download size={20} />
                      </a>
                      <a
                        href={selectedBanner.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-white text-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform"
                        title="Open in New Tab"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-heading text-lg font-bold text-heading">
                      {selectedBanner.title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      {selectedBanner.desc}
                    </p>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setZoomedImage(selectedBanner.url)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-teal-50 hover:bg-teal-100/80 px-4 py-2 rounded-lg transition-colors border border-teal-100 cursor-pointer"
                      >
                        <ZoomIn size={14} /> Full View
                      </button>
                      <a
                        href={selectedBanner.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
                      >
                        <ExternalLink size={14} /> Open in New Tab
                      </a>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </section>

      {/* Lightbox / Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden flex flex-col p-4 shadow-2xl border border-white/10 animate-fade-in">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex-1 overflow-auto flex items-center justify-center p-2">
              <img
                src={zoomedImage}
                alt="Zoomed official flyer"
                className="max-h-[75vh] object-contain w-auto rounded-lg"
              />
            </div>
            <div className="text-center pt-3 pb-1">
              <a
                href={zoomedImage}
                download
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-primary hover:bg-primary-light px-5 py-2.5 rounded-lg transition-colors shadow-md"
              >
                <Download size={16} /> Download High Resolution Flyer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 10. "What's Hiding in Your Everyday Cleaners?" (Educational USP comparison) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6" data-aos="fade-right">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                Did You Know?
              </span>
              <h2 className="text-3xl font-bold text-heading">What's Hiding in Your Everyday Cleaners?</h2>
              <p className="text-sm text-slate-650 leading-relaxed">
                Generic store-bought cleaning chemicals often rely on harsh active ingredients that pose risks to health and surfaces.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-heading">Hydrochloric Acid</h4>
                    <p className="text-xs text-muted">Corrodes plumbing, stains bathroom floors, and releases harmful fumes.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-heading">Chlorine Bleach & Phosphates</h4>
                    <p className="text-xs text-muted">Strips moisture from skin, causes eye irritation, and contaminates greywater run-offs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft" data-aos="fade-left">
              <h3 className="font-heading text-lg font-bold text-center text-heading mb-6">Why UNS Cleans Up Better</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-250">
                      <th className="pb-3 font-semibold text-slate-500">Feature</th>
                      <th className="pb-3 font-bold text-primary">UNS Formulations</th>
                      <th className="pb-3 font-semibold text-slate-400">Generic Cleaners</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-heading">Active Agents</td>
                      <td className="py-3 text-primary font-bold">Plant-based (Coconut)</td>
                      <td className="py-3 text-slate-500">Sulphates & Petro-chemicals</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-heading">pH Balance</td>
                      <td className="py-3 text-primary font-bold">pH 7.0 (Skin Safe)</td>
                      <td className="py-3 text-slate-500">Highly Acidic / Alkaline</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-heading">Skin Toxicity</td>
                      <td className="py-3 text-primary font-bold">Non-irritating (tested)</td>
                      <td className="py-3 text-slate-500">Causes dry skin & burns</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 font-semibold text-heading">Eco-Footprint</td>
                      <td className="py-3 text-primary font-bold">Biodegradable</td>
                      <td className="py-3 text-slate-500">Water pollution load</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-heading">Fume Release</td>
                      <td className="py-3 text-primary font-bold">Zero toxic fumes</td>
                      <td className="py-3 text-slate-500">Releases choking acid gas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 11. Collapsible FAQs Accordion */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Ask Us Anything
            </span>
            <h2 className="text-3xl font-bold text-heading mt-3">Frequently Asked Questions</h2>
            <p className="text-muted text-sm mt-1">Get answers to common queries about our plant-based cleaning solutions.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-border shadow-soft overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-heading font-semibold text-sm sm:text-base text-heading hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp size={18} className="text-primary" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </button>
                <div
                  className={`transition-all duration-350 ease-in-out ${
                    openFaq === index ? 'max-h-48 border-t border-slate-100 p-5' : 'max-h-0 overflow-hidden'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Call To Action B2B WhatsApp Distributor Banner */}
      <section className="bg-teal-900 py-16 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#14b8a6,transparent_60%)] opacity-25" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6" data-aos="fade-up">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold">Become An Authorized UNS Distributor</h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We are looking to expand our distribution network across South India. Get access to exclusive wholesale dealer pricing, marketing collaterals, and dedicated logistics support.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={handleWhatsAppB2B}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
            >
              <MessageSquare size={20} className="fill-current" />
              Inquire via WhatsApp
            </button>
            <Link
              to="/contact"
              className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold py-3.5 px-8 rounded-full transition-all"
            >
              Submit Business Form
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
export default Home;
