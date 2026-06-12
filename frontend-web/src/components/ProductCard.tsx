import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { ShoppingCart, MessageSquare, Star } from 'lucide-react';
import type { Product } from '../store/productsSlice';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page when clicking button
    dispatch(addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.images[0]
    }));
  };

  const handleWhatsAppEnquiry = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating
    const whatsappNumber = "917396158011";
    const message = encodeURIComponent(`Hello UNS! I am interested in the product: ${product.name}. Please share pricing and wholesale availability.`);
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`, '_blank');
  };

  const discountPercent = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-soft hover:shadow-soft-lg hover-card-zoom border border-border overflow-hidden transition-all duration-300 flex flex-col group h-full">
      
      {/* Product Image */}
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden aspect-square bg-slate-50">
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-accent text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm">
            {discountPercent}% OFF
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
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] text-primary font-bold uppercase tracking-wider block mb-1">
            {product.category}
          </span>
          
          {/* Title */}
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-heading hover:text-primary transition-colors line-clamp-1 mb-1.5">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(product.rating) ? "fill-current" : "text-slate-200"}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted font-semibold mt-0.5">{product.rating}</span>
          </div>

          {/* Short description */}
          <p className="text-xs text-muted line-clamp-2 mb-4">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action Area */}
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold text-primary">
              ₹{product.discountPrice.toFixed(2)}
            </span>
            {product.discountPrice < product.price && (
              <span className="text-xs text-muted line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-light text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors shadow-sm"
              title="Add to Cart"
            >
              <ShoppingCart size={14} />
              <span>Add</span>
            </button>

            {/* WhatsApp enquiry */}
            <button
              onClick={handleWhatsAppEnquiry}
              className="flex items-center justify-center gap-1.5 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
              title="Inquire on WhatsApp"
            >
              <MessageSquare size={14} />
              <span>Inquire</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
export default ProductCard;
