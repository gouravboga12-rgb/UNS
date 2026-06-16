import React from 'react';
import { Link } from 'react-router-dom';
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
  const isOutOfStock = product.specifications?.stockStatus === 'Out of Stock';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page when clicking button
    
    const volume = product.specifications?.["Volume"] || "";
    const isLiquid = !!volume && 
      !volume.toLowerCase().includes("kg") && 
      !volume.toLowerCase().includes("g") &&
      !product.name.toLowerCase().includes("powder") &&
      !product.name.toLowerCase().includes("soap");

    const itemId = isLiquid ? `${product.id}-${volume.trim()}` : product.id;
    const itemName = isLiquid ? `${product.name} (${volume.trim()})` : product.name;

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
        {/* Left Badges Stack */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {discountPercent > 0 && (
            <span className="bg-accent text-white text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-sm whitespace-nowrap">
              {discountPercent}% OFF
            </span>
          )}
          {customBadge && (
            <span className="bg-amber-500 text-white text-[8px] sm:text-[10px] font-extrabold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm max-w-[110px] sm:max-w-none truncate sm:whitespace-normal" title={customBadge}>
              {customBadge}
            </span>
          )}
        </div>

        {product.specifications?.stockStatus && (
          <span className={`absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 sm:px-2 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shadow-sm border ${
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
