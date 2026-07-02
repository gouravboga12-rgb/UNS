import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageSquare, Facebook, Instagram } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Footer: React.FC = () => {


  return (
    <footer className="bg-heading text-slate-300 border-t-4 border-primary pb-20 lg:pb-0">
      
      {/* Upper Footer: Branding & Grid Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info — Premium Layout */}
          <div className="flex flex-col space-y-5">

            {/* Logo + Name Card */}
            <Link to="/" className="group block">
              <div className="flex items-center gap-4 bg-white/5 border border-teal-500/20 rounded-2xl px-4 py-3 hover:border-teal-400/40 hover:bg-white/8 transition-all duration-300">
                {/* Logo with glow ring */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-xl bg-teal-400/20 blur-md" />
                  <img
                    src={logoImg}
                    alt="UNS Home Cleaning Logo"
                    className="relative h-16 w-16 object-contain bg-white rounded-xl p-1 shadow-lg"
                  />
                </div>

                {/* Name Stack */}
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading text-3xl font-black text-white tracking-wider leading-none">
                    UNS
                  </span>
                  <span className="font-heading text-[11px] font-bold text-teal-300 tracking-[0.12em] leading-tight uppercase">
                    HOME CLEANING PRODUCTS
                  </span>
                  {/* Decorative teal underline */}
                  <div className="h-[2px] w-full bg-gradient-to-r from-teal-400 via-emerald-400 to-transparent rounded-full mt-1" />
                  <span className="text-[9px] text-teal-500/80 font-semibold tracking-[0.2em] uppercase italic mt-1">
                    Clean Today... Healthy Tomorrow...
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed">
              India's trusted manufacturer of household, commercial & industrial cleaning formulations — crafted at our Siddipet, Telangana facility.
            </p>

            <div className="flex space-x-3">
              <a
                href="https://wa.me/917396158011"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-teal-400"
                title="WhatsApp"
              >
                <MessageSquare size={18} />
              </a>
              <a
                href="tel:+917396158011"
                className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-teal-400"
                title="Call Us"
              >
                <Phone size={18} />
              </a>
              <a
                href="https://www.facebook.com/share/1KtLC58igp/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-teal-400"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/unscleaningproducts?utm_source=qr&igsh=MWF1bmMyNDF2b2ExdA=="
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-teal-400"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-white font-heading font-semibold text-base">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Our Products</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About & Blogs</Link></li>
              <li><Link to="/track-order" className="hover:text-primary transition-colors">Order Tracking</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-white font-heading font-semibold text-base">Product Categories</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/products?category=home-cleaning" className="hover:text-primary transition-colors">Home Cleaning</Link></li>
              <li><Link to="/products?category=kitchen-cleaning" className="hover:text-primary transition-colors">Kitchen Cleaning</Link></li>
              <li><Link to="/products?category=personal-hygiene" className="hover:text-primary transition-colors">Personal Hygiene</Link></li>
              <li><Link to="/products?category=laundry-care" className="hover:text-primary transition-colors">Laundry Care</Link></li>
              <li><Link to="/products?category=vehicle-care" className="hover:text-primary transition-colors">Vehicle Washing</Link></li>
              <li><Link to="/products?category=commercial-cleaning" className="hover:text-primary transition-colors">Commercial Cleaning</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-white font-heading font-semibold text-base">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="text-teal-400 flex-shrink-0 mt-0.5" size={18} />
                <span>Siddipet, Telangana, India - 502103</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-teal-400 flex-shrink-0" size={18} />
                <a href="tel:+917396158011" className="hover:text-primary transition-colors">+91 7396158011</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-teal-400 flex-shrink-0" size={18} />
                <a href="mailto:unshomecleaningproductspvtltd@gmail.com" className="hover:text-primary transition-colors break-all">unshomecleaningproductspvtltd@gmail.com</a>
              </li>
            </ul>


          </div>

        </div>
      </div>

      {/* Bottom Footer: Copyright */}
      <div className="bg-[#0b1120] py-6 text-center text-xs text-slate-500 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} UNS HOME CLEANING PRODUCTS PVT LTD. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-400 font-medium my-2 sm:my-0">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
          </div>
          <p className="flex items-center justify-center gap-1.5">
            Developed by{' '}
            <a 
              href="https://www.codtechitsolutions.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-teal-400 font-semibold hover:underline hover:text-teal-300 transition-colors"
            >
              CODTECH IT SOLUTION
            </a>
          </p>
        </div>
      </div>

    </footer>
  );
};
