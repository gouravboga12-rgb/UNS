import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import type { RootState } from '../store';
import { hideToast } from '../store/toastSlice';

export const ToastNotification: React.FC = () => {
  const dispatch = useDispatch();
  const { visible, productName, imageUrl, id } = useSelector((state: RootState) => state.toast);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, id, dispatch]);

  if (!visible) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-slideIn flex items-start gap-4">
      {/* Product Thumbnail */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
        <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 font-sans">
        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-wider mb-0.5">
          <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check size={10} className="stroke-[3]" />
          </div>
          SUCCESS
        </div>
        <h4 className="text-sm font-bold text-heading truncate mb-0.5">{productName}</h4>
        <p className="text-[10px] text-muted font-bold tracking-wider uppercase mb-2">ADDED TO CART</p>
        <Link 
          to="/cart" 
          onClick={() => dispatch(hideToast())}
          className="text-xs font-black text-heading hover:text-primary transition-colors underline uppercase tracking-tight"
        >
          VIEW CART
        </Link>
      </div>

      {/* Close Button */}
      <button 
        onClick={() => dispatch(hideToast())}
        className="text-slate-400 hover:text-slate-650 transition-colors p-1"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
