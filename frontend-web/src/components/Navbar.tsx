import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import type { RootState } from '../store';
import { ShoppingCart, Menu, X, Search, ChevronDown, User } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper: returns active or default nav link classes
  const navLinkClass = (path: string) =>
    `font-medium text-sm transition-colors relative ${
      location.pathname === path || location.pathname.startsWith(path + '/')
        ? 'text-primary after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-primary'
        : 'text-body hover:text-primary'
    }`;

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const categories = useSelector((state: RootState) => state.products.categories);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const u = localStorage.getItem('uns_current_user');
      setCurrentUser(u ? JSON.parse(u) : null);
    };
    checkUser();
    window.addEventListener('authChange', checkUser);
    return () => {
      window.removeEventListener('authChange', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('uns_current_user');
    localStorage.removeItem('uns_token');
    setCurrentUser(null);
    dispatch(clearCart());
    navigate('/');
    window.dispatchEvent(new Event('authChange'));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-24">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center flex-shrink-0 gap-3">
            <img src={logoImg} alt="UNS Logo" className="h-12 md:h-20 w-auto object-contain" />
            <div className="hidden lg:flex flex-col justify-center">
              <span className="font-heading text-2xl font-extrabold text-primary tracking-wide leading-none">UNS</span>
              <span className="font-heading text-[13px] font-bold text-heading tracking-tight leading-snug">HOME CLEANING PRODUCTS</span>
              <span className="text-[9px] text-muted font-semibold tracking-widest uppercase mt-0.5">Clean Today... Healthy Tomorrow...</span>
            </div>
          </Link>

          {/* Search bar Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search home, kitchen, laundry care..."
              className="w-full bg-slate-50 border border-border rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
              <Search size={18} />
            </button>
          </form>

          {/* Navigation Items Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-1 text-body hover:text-primary font-medium text-sm transition-colors"
              >
                Categories <ChevronDown size={14} />
              </button>
              {categoriesOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-border rounded-lg shadow-lg py-2 z-50 animate-fadeIn">
                  <Link 
                    to="/products" 
                    onClick={() => setCategoriesOpen(false)}
                    className="block px-4 py-2 text-sm text-body hover:bg-teal-50 hover:text-primary font-semibold border-b border-slate-100"
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      onClick={() => setCategoriesOpen(false)}
                      className="block px-4 py-2 text-sm text-body hover:bg-teal-50 hover:text-primary transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/about" className={navLinkClass('/about')}>About & Blog</Link>
            <Link to="/track-order" className={navLinkClass('/track-order')}>Track Order</Link>
            <Link to="/contact" className={navLinkClass('/contact')}>Contact</Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center gap-2 relative group">
                <button className="flex items-center gap-1.5 p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-slate-100" title="Account Settings">
                  <User size={20} />
                  <span className="hidden md:inline text-xs font-semibold text-heading max-w-24 truncate">{currentUser.name}</span>
                </button>
                {/* Hover dropdown */}
                <div className="absolute right-0 top-full mt-0 w-44 bg-white border border-border rounded-lg shadow-lg py-1.5 hidden group-hover:block z-50 animate-fadeIn">
                  <div className="px-3 py-1 border-b border-slate-100 text-[10px] text-muted truncate">
                    {currentUser.email}
                  </div>
                  {currentUser.role === 'admin' && (
                    <Link to="/admin/" className="block px-3 py-2 text-xs text-body hover:bg-teal-50 hover:text-primary font-bold">
                      Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-red-650 hover:bg-red-50 hover:text-red-750 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/signin" className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-slate-100" title="Account">
                <User size={20} />
              </Link>
            )}

            <Link to="/cart" className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-slate-100 relative" title="Shopping Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-accent rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted hover:text-primary lg:hidden transition-colors rounded-full hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white py-4 px-6 animate-slideIn">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-slate-50 border border-border rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              <Search size={18} />
            </button>
          </form>

          <nav className="flex flex-col space-y-4">
            <div>
              <span className="text-muted text-xs uppercase tracking-wider font-semibold block mb-2">Categories</span>
              <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-primary/20">
                <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-sm text-body hover:text-primary font-semibold">All Categories</Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm text-body hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-body hover:text-primary font-medium">About & Blog</Link>
            <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="text-body hover:text-primary font-medium">Track Order</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-body hover:text-primary font-medium">Contact Us</Link>
          </nav>
        </div>
      )}
    </header>
  );
};
