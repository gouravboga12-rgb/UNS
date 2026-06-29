import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { showToast } from '../store/toastSlice';
import { ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../store/productsSlice';

interface ProductCardProps {
  product: Product;
  customBadge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, customBadge }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOutOfStock = product.specifications?.stockStatus === 'Out of Stock';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page when clicking button
    
    const user = localStorage.getItem('uns_current_user');
    if (!user) {
      alert("Please login or sign up to add items to your cart.");
      navigate('/signin');
      return;
    }
    
    const dbVars = product.specifications?.variants || [];
    const hasDbVariants = dbVars.length > 0;

    const itemId = hasDbVariants ? `${product.id}-${dbVars[0].name}` : product.id;
    const itemName = hasDbVariants ? `${product.name} (${dbVars[0].name})` : product.name;

    dispatch(addItem({
      id: itemId,
      name: itemName,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.images[0]
    }));
    dispatch(showToast({
      productName: itemName,
      imageUrl: product.images[0]
    }));
  };

  const discountPercent = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-soft hover:shadow-soft-lg hover-card-zoom border border-border overflow-hidden transition-all duration-300 flex flex-col group h-full">
      
      {/* Product Image */}
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden aspect-square bg-slate-50">
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-1.5 items-start justify-between pointer-events-none">
          {discountPercent > 0 ? (
            <span className="bg-accent text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm pointer-events-auto">
              {discountPercent}% OFF
            </span>
          ) : (
            <div />
          )}
          {(customBadge || product.specifications?.stockStatus) && (
            <div className="flex flex-col items-start sm:items-end gap-1 pointer-events-none">
              {customBadge && (
                <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm pointer-events-auto whitespace-nowrap">
                  {customBadge}
                </span>
              )}
              {product.specifications?.stockStatus && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm border pointer-events-auto whitespace-nowrap ${
                  product.specifications.stockStatus === 'Out of Stock' 
                    ? 'bg-red-50 border-red-100 text-red-600'
                    : product.specifications.stockStatus === 'New Post'
                    ? 'bg-purple-50 border-purple-100 text-purple-600'
                    : product.specifications.stockStatus === 'Custom'
                    ? 'bg-amber-50 border-amber-100 text-amber-600'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>
                  {product.specifications.stockStatus === 'Custom' 
                    ? (product.specifications.customStockStatus || 'Stock')
                    : product.specifications.stockStatus === 'New Post'
                    ? 'New'
                    : product.specifications.stockStatus
                  }
                </span>
              )}
            </div>
          )}
        </div>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[9px] sm:text-[11px] text-primary font-bold uppercase tracking-wider block mb-1">
            {product.category}
          </span>
          
          {/* Title */}
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-heading hover:text-primary transition-colors line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < Math.floor(product.rating) ? "fill-current" : "text-slate-200"}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted font-semibold mt-0.5">{product.rating}</span>
          </div>

          {/* Short description */}
          <p className="text-[10px] sm:text-xs text-muted line-clamp-2 mb-3">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action Area */}
        <div>
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-xs sm:text-base font-bold text-primary">
              ₹{product.discountPrice.toFixed(2)}
            </span>
            {product.discountPrice < product.price && (
              <span className="text-[10px] sm:text-xs text-muted line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="w-full">
            
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-semibold py-2 px-2.5 rounded-lg transition-colors shadow-sm ${
                isOutOfStock 
                  ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary-light text-white'
              }`}
              title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            >
              <ShoppingCart size={13} />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
export default ProductCard;
