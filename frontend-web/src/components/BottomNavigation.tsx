import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LayoutGrid, User, Home, Wallet, ShoppingCart } from 'lucide-react';
import type { RootState } from '../store';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to determine active state
  const isActive = (paths: string[], exact = false) => {
    if (exact) {
      return paths.includes(path);
    }
    return paths.some(p => path === p || (p !== '/' && path.startsWith(p)));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden flex justify-around items-center h-16">
      
      {/* Categories */}
      <Link
        to="/products?showCategories=true"
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
          isActive(['/categories', '/products']) || location.search.includes('showCategories=true') ? 'text-primary font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <LayoutGrid size={20} className={isActive(['/categories', '/products']) ? 'scale-105 transition-transform' : ''} />
        <span className="text-[10px] mt-1 tracking-tight">Categories</span>
      </Link>

      {/* Account */}
      <Link
        to="/signin"
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
          isActive(['/signin', '/signup', '/admin']) ? 'text-primary font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <User size={20} className={isActive(['/signin', '/signup', '/admin']) ? 'scale-105 transition-transform' : ''} />
        <span className="text-[10px] mt-1 tracking-tight">Account</span>
      </Link>

      {/* Home */}
      <Link
        to="/"
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
          isActive(['/'], true) ? 'text-primary font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className={`p-2 rounded-full transition-all ${
          isActive(['/'], true) ? 'bg-primary/10 text-primary scale-110 shadow-sm' : 'text-slate-400'
        }`}>
          <Home size={22} />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
      </Link>

      {/* Wholesale */}
      <Link
        to="/contact"
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
          isActive(['/contact']) ? 'text-primary font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Wallet size={20} className={isActive(['/contact']) ? 'scale-105 transition-transform' : ''} />
        <span className="text-[10px] mt-1 tracking-tight">Wholesale</span>
      </Link>

      {/* Cart */}
      <Link
        to="/cart"
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center relative transition-all ${
          isActive(['/cart']) ? 'text-primary font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <ShoppingCart size={20} className={isActive(['/cart']) ? 'scale-105 transition-transform' : ''} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-white">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1 tracking-tight">Cart</span>
      </Link>

    </div>
  );
};

export default BottomNavigation;
