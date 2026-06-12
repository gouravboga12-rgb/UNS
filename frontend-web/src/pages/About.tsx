import React, { useState } from 'react';
import { Calendar, User, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle, X, ZoomIn, Star, Truck, Leaf, Award, Building2, Handshake } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
}

export const About: React.FC = () => {
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const blogs: Blog[] = [
    {
      id: "blog-1",
      title: "5 Essential Hygiene Habits to Prevent Infections at Home",
      slug: "5-essential-hygiene-habits",
      summary: "Simple everyday home cleaning and hygiene practices that keep germs and bacteria at bay, protecting your family.",
      content: "## Keeping Germs Away: A Simple Guide\n\nMaintaining a clean home is the first line of defense against infections. Here are 5 critical habits to adopt:\n\n1. **High-Touch Surface Disinfection**: Regularly sanitize doorknobs, switches, remote controls, and countertops using a quality cleaner like *UNS Glass or Bathroom Cleaner*.\n2. **Clean Floors Daily**: Floors accumulate dust, pet dander, and outside dirt. Use a disinfectant floor cleaner like the *UNS Floor Cleaner* to keep floors safe for children.\n3. **Sanitize Utility Outlets**: Kitchen sinks and toilet bowls are breeding grounds for bacteria. Clean them with targeted gels at least twice a week.\n4. **Correct Handwashing**: Wash hands with antibacterial hand wash for at least 20 seconds before meals and after returning from outside.\n5. **Ventilate Rooms**: Open windows to let fresh air circulate and clear stale indoor pollutants.",
      imageUrl: "/banners/p7.jpeg",
      author: "Dr. Sunitha Sharma (Hygiene Expert)",
      createdAt: "2026-06-08T09:00:00Z",
      seoTitle: "5 Home Hygiene Habits to Keep Your Family Safe - UNS Blogs",
      seoDescription: "Discover critical everyday hygiene habits and floor cleaning tips to eliminate household bacteria and keep infections away."
    },
    {
      id: "blog-2",
      title: "How to Remove Hard Water Stains from Bathroom Tiles & Taps",
      slug: "remove-hard-water-stains",
      summary: "Tired of white crusty deposits on your taps and tiles? Learn the science behind scaling and how to dissolve it effortlessly.",
      content: "## Understanding Hard Water Stains\n\nHard water contains high amounts of minerals like calcium and magnesium. When water evaporates, it leaves behind crusty, white deposits known as limescale. These stains look unsightly and can clog faucets.\n\n### The Solution\n\nTo dissolve limescale, you need an acid-safe formulation. Our *UNS Bathroom Cleaner Liquid* is designed to dissolve mineral scales quickly without corroding chrome plumbing fixtures.\n\n### Step-by-Step Guide:\n1. Apply the bathroom cleaner directly onto the scaling.\n2. Allow it to sit for 10 minutes to break the mineral bonds.\n3. Use a soft scrub pad to wipe the scales away.\n4. Rinse with clean water and dry immediately to prevent new deposits.",
      imageUrl: "/banners/p14-bathroom.jpeg",
      author: "UNS Product Development Team",
      createdAt: "2026-06-05T14:30:00Z",
      seoTitle: "How to Clean Tiles Hard Water Stains Easily - UNS Cleaning Tips",
      seoDescription: "Learn how to remove tough bathroom limescale and white scaling from taps, showerheads, and ceramic tiles using UNS Bathroom Cleaner."
    },
    {
      id: "blog-3",
      title: "Complete Guide to UNS Cleaning Product Range & Prices",
      slug: "uns-product-range-guide",
      summary: "Explore our full line of 12+ household, commercial, and personal hygiene cleaning formulations. Discover which product works best for every need.",
      content: "## UNS Complete Product Catalog\n\nUNS HOME CLEANING PRODUCTS PVT LTD offers a comprehensive range of 12+ professional-grade cleaning solutions at affordable MRP prices:\n\n### Household Cleaning\n- **Toilet Cleaner Liquid** – MRP ₹90 | Kills 99.9% germs, removes tough stains & bad odors.\n- **Bathroom Cleaner Liquid** – MRP ₹95 | Dissolves soap scum, shines tiles & fittings.\n- **Floor Cleaner Liquid** – MRP ₹90 | Deep cleaning with long-lasting floral fragrance.\n- **Glass Cleaner Liquid** – MRP ₹90 | Streak-free shine, dust-repellent formula.\n\n### Kitchen & Laundry\n- **Dish Wash Liquid** – MRP ₹90 | Powerful grease cutting, safe on hands.\n- **Detergent Liquid** – MRP ₹120 | 3x cleaning power, brighter clothes.\n- **Detergent Soap** – MRP ₹25 | Active clean, gentle on fabric.\n\n### Personal Hygiene\n- **Hand Wash Liquid** – MRP ₹90 | Soft on hands, tough on germs.\n- **Air Freshener** – MRP ₹210 | Long-lasting fragrance, refreshes every moment.\n\n### Industrial & Commercial\n- **White Phenyl** – MRP ₹90 | Kills germs, cleans & freshens all surfaces.\n- **Colour/Scented Phenyl** – MRP ₹90 | Strong cleaning with pleasant fragrance.\n- **Car Wash Shampoo** – MRP ₹210 | Rich foam, sparkling shine.\n\n*Bulk orders and dealership enquiries welcome. Call: 7396158011*",
      imageUrl: "/banners/p24.jpeg",
      author: "UNS Marketing Team",
      createdAt: "2026-06-10T11:00:00Z",
      seoTitle: "UNS Product Range & MRP Price List - Complete Cleaning Catalog",
      seoDescription: "Explore UNS Home Cleaning Products full range including Toilet Cleaner, Floor Cleaner, Hand Wash, Detergent, Phenyl and more with MRP pricing."
    }
  ];

  const whyChooseUsPoints = [
    { icon: <Award size={20} className="text-primary" />, title: "High Quality Raw Materials", desc: "Premium-grade active ingredients sourced from certified suppliers ensuring every batch meets international standards." },
    { icon: <ShieldCheck size={20} className="text-primary" />, title: "Effective Germ Protection", desc: "Kills 99.9% of bacteria, viruses, and fungi on contact – laboratory tested and certified for home, office, and hospital use." },
    { icon: <Leaf size={20} className="text-primary" />, title: "Safe on Hands & Surfaces", desc: "pH-balanced, skin-friendly surfactants safe for babies, hands, pets, and sensitive surfaces like marble and chrome." },
    { icon: <Star size={20} className="text-primary" />, title: "Pleasant Fragrance", desc: "Infused with natural pine oil, citronella, and floral extracts that leave your home smelling fresh for hours." },
    { icon: <CheckCircle size={20} className="text-primary" />, title: "Affordable Best Prices", desc: "Direct factory pricing without distributor margins. Available MRP starting at ₹25 – quality cleaning within every budget." },
    { icon: <Handshake size={20} className="text-primary" />, title: "Trusted by Thousands", desc: "Chosen by homes, hospitals, hotels, schools, offices, and corporate parks across South India since 2021." },
    { icon: <Building2 size={20} className="text-primary" />, title: "Factory Direct Supply", desc: "Custom blending, bulk filling, and direct-to-site dispatch available for large commercial and institutional orders." },
    { icon: <Truck size={20} className="text-primary" />, title: "Pan-India Timely Delivery", desc: "Fast delivery network across Telangana and South India. COD and WhatsApp orders accepted for retail customers." },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100 min-h-screen relative pb-20 overflow-hidden">
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[25%] left-[-15%] w-[35rem] h-[35rem] rounded-full bg-teal-200/15 blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[55%] right-[-15%] w-[30rem] h-[30rem] rounded-full bg-emerald-200/15 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[10%] w-[25rem] h-[25rem] rounded-full bg-sky-200/10 blur-3xl pointer-events-none z-0" />

      {/* 1. Immersive Header Hero Banner */}
      <div className="relative bg-teal-950 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-teal-800 z-10">
        <div className="absolute inset-0 z-0 opacity-40 select-none pointer-events-none">
          <img
            src="/banners/p11.jpeg"
            alt="UNS Home Cleaning Products Range"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950 via-teal-900/90 to-teal-950/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-5">
            <span className="inline-block bg-teal-500/30 text-teal-300 border border-teal-500/40 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
              About UNS Cleaners
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-heading tracking-tight text-white drop-shadow-md">
              Our Story & Expert Cleaning Insights
            </h1>
            <p className="text-sm sm:text-base text-teal-100 leading-relaxed drop-shadow">
              Indian manufacturer of high-quality household, commercial, and industrial cleaning formulations based in Siddipet, Telangana. Explore our production process and professional hygiene tips.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {['99.9% Germ Protection', 'Factory Direct Pricing', 'Safe for Family', 'Trusted Since 2021'].map((tag) => (
                <span key={tag} className="bg-white/10 border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Check if we are viewing a single blog article */}
        {selectedBlog ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100/80 p-6 sm:p-10 shadow-soft max-w-4xl mx-auto space-y-6 animate-fadeIn">
            
            {/* Back Button */}
            <button
              onClick={() => setSelectedBlog(null)}
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline mb-4"
            >
              <ArrowLeft size={14} /> Back to About & Blogs
            </button>

            {/* Banner with Click-to-Zoom */}
            <div 
              onClick={() => setZoomImageUrl(selectedBlog.imageUrl)}
              className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 border border-border cursor-zoom-in relative group"
            >
              <img 
                src={selectedBlog.imageUrl} 
                alt={selectedBlog.title} 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 text-teal-900 rounded-full p-3 shadow-md flex items-center gap-1.5 text-xs font-bold">
                  <ZoomIn size={16} /> Click to Zoom Flyer
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-medium pb-4 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {new Date(selectedBlog.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <User size={14} /> By {selectedBlog.author}
              </span>
            </div>

            {/* Content */}
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-heading">{selectedBlog.title}</h1>
            <div className="prose max-w-none text-xs sm:text-sm text-body leading-relaxed space-y-4 whitespace-pre-wrap">
              {selectedBlog.content}
            </div>

          </div>
        ) : (
          <div className="space-y-20">
            
            {/* 1. Corporate Profile section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white/70 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-soft">
              <div className="space-y-6" data-aos="fade-right">
                <h2 className="text-3xl sm:text-4xl font-bold font-heading text-heading">
                  About UNS Home Cleaning Products
                </h2>
                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
                  UNS HOME CLEANING PRODUCTS PVT LTD is an Indian manufacturer of high-quality household, commercial, and industrial cleaning formulations. Headquartered in Siddipet, Telangana, our brand represents visual cleanliness combined with absolute hygiene.
                </p>
                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
                  We specialize in custom chemical blending, filling, and bulk transport supply. Over the years, we have emerged as a reliable vendor for housekeeping services, corporate parks, multi-specialty hospitals, and luxury hotels across South India.
                </p>
                
                {/* Features Grid - 4 key points from brochure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading font-bold text-xs text-heading">Active Disinfection</h4>
                      <p className="text-[11px] text-muted leading-normal">Kills 99.9% of germs, bacteria, and viruses on contact.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading font-bold text-xs text-heading">Factory Direct Pricing</h4>
                      <p className="text-[11px] text-muted leading-normal">Direct wholesale price structures without distributor margins.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading font-bold text-xs text-heading">Broad Application</h4>
                      <p className="text-[11px] text-muted leading-normal">Perfect for residences, offices, schools, hotels, and gyms.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading font-bold text-xs text-heading">Safety Audited</h4>
                      <p className="text-[11px] text-muted leading-normal">Skin-friendly surfactants safe for babies, hands, and pets.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corporate Profile Image - full product range */}
              <div className="flex flex-col items-center gap-3" data-aos="fade-left">
                <div 
                  onClick={() => setZoomImageUrl('/banners/p11.jpeg')}
                  className="w-full max-w-md aspect-[3/4] sm:aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden relative shadow-md cursor-zoom-in group"
                >
                  <img
                    src="/banners/p11.jpeg"
                    alt="UNS Complete Product Range"
                    className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 text-teal-900 rounded-full p-3 shadow-md flex items-center gap-1.5 text-xs font-bold">
                      <ZoomIn size={16} /> Click to Zoom Range Flyer
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted font-medium italic">Figure: UNS Complete Home Cleaning Range Flyer</span>
              </div>
            </section>

            {/* 2. Why Choose UNS - 8 points from brochure */}
            <section className="bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-soft space-y-10">
              <div className="text-center max-w-2xl mx-auto" data-aos="fade-up">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full">Why Choose UNS?</span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-heading mt-3">Reasons Families & Businesses Trust Us</h3>
                <p className="text-xs text-muted mt-2">From our official brochure – quality, safety, and value that sets UNS apart from the competition.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {whyChooseUsPoints.map((point, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-teal-50 to-white p-5 rounded-2xl border border-teal-100/60 shadow-xs hover:shadow-soft transition-all space-y-3 hover:-translate-y-1 duration-300"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100/60 flex items-center justify-center">
                      {point.icon}
                    </div>
                    <h4 className="font-heading font-bold text-sm text-heading">{point.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{point.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Manufacturing process details with Storyboard (p18.jpeg) */}
            <section className="bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-soft space-y-10">
              <div className="text-center max-w-2xl mx-auto" data-aos="fade-up">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full">How We Manufacture</span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-heading mt-3">Our Production Process</h3>
                <p className="text-xs text-muted mt-2">Stringent quality control protocols from active ingredient sourcing to final bottling, mapped from our storyboard flyer.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Steps Description */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4" data-aos="fade-up">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-primary flex-shrink-0 font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-heading flex items-center gap-2">
                        Formulation Blending <span className="text-[10px] text-muted font-medium font-sans bg-slate-100 px-2 py-0.5 rounded">Active Agitators</span>
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Surfactants, disinfectants, and natural pine essential oils are combined inside stainless steel bulk agitator reactors under precise heat conditions.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4" data-aos="fade-up" data-aos-delay="100">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-primary flex-shrink-0 font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-heading flex items-center gap-2">
                        Quality Analytics <span className="text-[10px] text-muted font-medium font-sans bg-slate-100 px-2 py-0.5 rounded">Lab Compliance</span>
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Samples from each product batch are checked in our quality lab to confirm pH values, viscosity density, and active disinfection germ-kill coefficients.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4" data-aos="fade-up" data-aos-delay="200">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-primary flex-shrink-0 font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-heading flex items-center gap-2">
                        Automatic Bottling <span className="text-[10px] text-muted font-medium font-sans bg-slate-100 px-2 py-0.5 rounded">Packing & Crating</span>
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Automated nozzle machines pour liquid gels, cap the bottles, apply brand labels, and package products into crates for immediate transport dispatch.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4" data-aos="fade-up" data-aos-delay="300">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-primary flex-shrink-0 font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-heading flex items-center gap-2">
                        Dispatch & Delivery <span className="text-[10px] text-muted font-medium font-sans bg-slate-100 px-2 py-0.5 rounded">Pan-India Logistics</span>
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Products are dispatched via our logistics partners across Telangana and South India. Bulk institutional orders are shipped directly to site via customized transport.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Storyboard Flyer Card */}
                <div className="lg:col-span-5 flex flex-col items-center gap-2" data-aos="fade-left">
                  <div 
                    onClick={() => setZoomImageUrl('/banners/p18.jpeg')}
                    className="w-full aspect-video rounded-2xl overflow-hidden border border-border cursor-zoom-in relative group shadow-sm bg-slate-50"
                  >
                    <img 
                      src="/banners/p18.jpeg" 
                      alt="Manufacturing Storyboard" 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/95 text-teal-900 rounded-full px-3 py-1.5 shadow-md flex items-center gap-1 text-[10px] font-bold">
                        <ZoomIn size={12} /> Zoom Storyboard
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted tracking-wider uppercase font-bold">Official Production Storyboard</span>
                </div>
              </div>
            </section>

            {/* 4. Catalog & Reference Details (Ref: p14.jpeg 3-Panel Brochure) */}
            <section className="bg-teal-50/50 p-8 sm:p-12 rounded-3xl border border-teal-100/60 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-6" data-aos="fade-right">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-teal-100/80 px-2.5 py-1 rounded-full">Official Catalog Specifications</span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-heading text-heading mt-3">Reference Brochure Specifications</h3>
                  <p className="text-xs text-muted mt-1">Key parameters, compliance rules, and application verticals extracted from the UNS official company brochure catalog sheets.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-1.5" data-aos="fade-up">
                      <span className="text-xl">🏢</span>
                      <h4 className="font-heading font-bold text-sm text-heading">Commercial Verticals</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Formulated for high-traffic environments: corporate offices, airports, restaurants, hospitals, and academic campuses.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-1.5" data-aos="fade-up" data-aos-delay="100">
                      <span className="text-xl">🧪</span>
                      <h4 className="font-heading font-bold text-sm text-heading">Chemical Blending</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Advanced formulations with controlled pH levels and high concentration ratios, allowing safe dilutions up to 1:500.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-1.5" data-aos="fade-up" data-aos-delay="200">
                      <span className="text-xl">🌿</span>
                      <h4 className="font-heading font-bold text-sm text-heading">Pure Essential Scent</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Formulated with pure pine oil (Grade-1 Disinfectant Phenyls) and natural citronella/pine fragrance extracts.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-1.5" data-aos="fade-up" data-aos-delay="300">
                      <span className="text-xl">📋</span>
                      <h4 className="font-heading font-bold text-sm text-heading">Regulatory Standards</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Manufactured under strict ISO-compliant guidelines at our Siddipet plant, ensuring consistent density and pH per batch.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brochure image - clickable to zoom */}
                <div className="flex flex-col items-center gap-3" data-aos="fade-left">
                  <div
                    onClick={() => setZoomImageUrl('/banners/p14.jpeg')}
                    className="w-full rounded-2xl overflow-hidden border border-border cursor-zoom-in relative group shadow-sm"
                  >
                    <img
                      src="/banners/p14.jpeg"
                      alt="UNS 3-Panel Corporate Brochure"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 text-teal-900 rounded-full p-3 shadow-md flex items-center gap-1.5 text-xs font-bold">
                        <ZoomIn size={16} /> Zoom Brochure
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted font-medium italic">Figure: Official UNS 3-Panel Company Brochure (English)</span>
                </div>
              </div>
            </section>

            {/* 5. Product Pricing Grid - p24.jpeg reference */}
            <section className="space-y-6" data-aos="fade-up">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full">Full Product Pricing</span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-heading mt-3">Complete Catalog with MRP Pricing</h3>
                <p className="text-xs text-muted mt-2">Our full 12-product pricing grid – all at affordable factory-direct rates. Click to zoom and explore all products.</p>
              </div>
              <div
                onClick={() => setZoomImageUrl('/banners/p24.jpeg')}
                className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border cursor-zoom-in relative group shadow-sm"
              >
                <img
                  src="/banners/p24.jpeg"
                  alt="UNS Product Pricing Grid"
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 text-teal-900 rounded-full p-3 shadow-md flex items-center gap-1.5 text-xs font-bold">
                    <ZoomIn size={16} /> View Full Pricing Catalog
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Blogs section */}
            <section className="space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4" data-aos="fade-right">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-heading text-heading">Hygiene & Cleaning Blogs</h3>
                  <p className="text-xs text-muted mt-1">Read guides written by our product experts to keep your home safe.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogs.map((blog, index) => (
                  <div
                    key={blog.id}
                    className="bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-soft border border-border hover:shadow-soft-lg group transition-all duration-300 flex flex-col h-full"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div 
                      onClick={() => setZoomImageUrl(blog.imageUrl)}
                      className="h-52 overflow-hidden bg-slate-100 relative cursor-zoom-in group/img"
                    >
                      <img 
                        src={blog.imageUrl} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/95 text-teal-900 text-[10px] font-bold rounded-full px-2.5 py-1 flex items-center gap-1 shadow-md">
                          <ZoomIn size={12} /> Zoom Flyer
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4 font-sans">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted font-bold uppercase tracking-wider">
                          <Calendar size={12} /> {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                        <h3 className="font-heading font-bold text-base text-heading group-hover:text-primary transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                          {blog.summary}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setSelectedBlog(blog)}
                        className="text-primary hover:text-primary-light font-bold text-xs flex items-center gap-1 self-start group/btn"
                      >
                        Read Full Article 
                        <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

      </div>

      {/* Custom Full-Screen Lightbox Modal for Brochures/Flyers */}
      {zoomImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs animate-fadeIn p-4 sm:p-8" onClick={() => setZoomImageUrl(null)}>
          <button 
            onClick={() => setZoomImageUrl(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors focus:outline-none"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>
          
          <div 
            className="relative max-w-full max-h-[90vh] rounded-xl overflow-hidden shadow-2xl bg-white/5 border border-white/10 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={zoomImageUrl} 
              alt="Zoomed Brochure/Flyer" 
              className="w-auto h-auto max-w-full max-h-[88vh] object-contain select-none pointer-events-auto rounded-lg"
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-teal-950/70 backdrop-blur-md text-white/90 text-[10px] font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full select-none">
              UNS English-Only Reference Flyer
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default About;
