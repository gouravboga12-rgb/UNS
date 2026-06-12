import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { addItem } from '../store/cartSlice';
import { 
  ShoppingCart, 
  MessageSquare, 
  CheckCircle, 
  ChevronRight, 
  Star, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const products = useSelector((state: RootState) => state.products.items);
  const product = products.find(p => p.slug === slug);

  // States
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'instructions' | 'specs'>('benefits');
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.images[0]);
      setReviewsList(product.reviews || []);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-heading">Product Not Found</h2>
        <p className="text-muted text-sm mt-2">The product you are looking for does not exist.</p>
        <Link to="/products" className="mt-4 bg-primary text-white py-2 px-6 rounded-lg text-xs font-semibold inline-block">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
      dispatch(addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        imageUrl: product.images[0]
      }));
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleWhatsAppEnquiry = () => {
    const whatsappNumber = "917396158011";
    const message = encodeURIComponent(`Hello UNS! I am interested in inquiring about "${product.name}". Please share product pricing, package choices, and shipping details.`);
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`, '_blank');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewName.trim() && reviewComment.trim()) {
      const newReview = {
        id: `rev-local-${Math.random().toString(36).substring(2, 9)}`,
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        approved: true, // Auto-approve locally for demo
        createdAt: new Date().toISOString()
      };
      
      setReviewsList([newReview, ...reviewsList]);
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      setReviewSubmitted(true);
      setTimeout(() => {
        setReviewSubmitted(false);
        setShowReviewModal(false);
      }, 2000);
    }
  };

  const discountPercent = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-muted mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight size={12} />
          <span className="text-heading font-semibold line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-soft mb-12">
          
          {/* Left: Images Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-border">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            {/* Gallery Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-slate-50 transition-all ${
                      activeImage === img ? 'border-primary' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Purchase Sidebar */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Heading */}
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={10} /> {product.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-heading mt-1">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(product.rating) ? "fill-current" : "text-slate-200"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted font-bold mt-0.5">{product.rating} ({reviewsList.length} reviews)</span>
                </div>
              </div>

              {/* Price Tag */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-primary">₹{product.discountPrice.toFixed(2)}</span>
                    {product.discountPrice < product.price && (
                      <span className="text-sm text-muted line-through">₹{product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted font-medium block mt-1">(Prices include GST)</span>
                </div>
                {discountPercent > 0 && (
                  <span className="bg-accent text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Description snippet */}
              <div 
                className="text-xs sm:text-sm text-body leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: product.fullDescription }}
              />

              {/* Interactive Info Tabs */}
              <div>
                <div className="flex border-b border-border text-xs sm:text-sm font-semibold text-muted mb-4">
                  <button
                    onClick={() => setActiveTab('benefits')}
                    className={`pb-2 pr-4 transition-all relative ${
                      activeTab === 'benefits' ? 'text-primary border-b-2 border-primary' : 'hover:text-primary'
                    }`}
                  >
                    Product Benefits
                  </button>
                  <button
                    onClick={() => setActiveTab('instructions')}
                    className={`pb-2 px-4 transition-all relative ${
                      activeTab === 'instructions' ? 'text-primary border-b-2 border-primary' : 'hover:text-primary'
                    }`}
                  >
                    Usage Instructions
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2 px-4 transition-all relative ${
                      activeTab === 'specs' ? 'text-primary border-b-2 border-primary' : 'hover:text-primary'
                    }`}
                  >
                    Technical Details
                  </button>
                </div>

                <div className="min-h-36 py-2">
                  {/* Benefits */}
                  {activeTab === 'benefits' && (
                    <ul className="space-y-2.5">
                      {product.benefits.map((ben, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle className="text-accent flex-shrink-0 mt-0.5" size={16} />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Instructions */}
                  {activeTab === 'instructions' && (
                    <ol className="space-y-3.5">
                      {product.usageInstructions.map((ins, i) => (
                        <li key={i} className="flex gap-3 text-xs text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-100 text-primary flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{ins}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Specifications */}
                  {activeTab === 'specs' && (
                    <div className="border border-border rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                      {Object.keys(product.specifications).map((key) => (
                        <div key={key} className="grid grid-cols-2 p-3 bg-white hover:bg-slate-50">
                          <span className="font-semibold text-heading">{key}</span>
                          <span className="text-body">{product.specifications[key]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Shopping Action block */}
            <div className="pt-8 border-t border-border mt-8 space-y-4">
              
              {/* Quantity Selector & Quick Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                
                {/* Quantity */}
                <div className="flex items-center border border-border rounded-lg bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 hover:bg-white rounded transition-colors text-muted hover:text-primary"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-heading">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 hover:bg-white rounded transition-colors text-muted hover:text-primary"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 min-w-40 bg-slate-105 border border-primary text-primary hover:bg-teal-50 font-bold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 min-w-40 bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  Buy Now
                </button>

              </div>

              {/* Priority Floating WhatsApp Enquiry Trigger */}
              <button
                onClick={handleWhatsAppEnquiry}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md text-sm sm:text-base animate-whatsapp-pulse"
              >
                <MessageSquare className="fill-current" size={20} />
                Order / Enquire via WhatsApp
              </button>

            </div>

          </div>

        </div>

        {/* Review list & feedback section */}
        <section className="bg-white border border-border rounded-3xl p-6 sm:p-10 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-heading">Customer Reviews</h2>
              <p className="text-xs text-muted">What users think of this formulation.</p>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors self-start"
            >
              Write a Review
            </button>
          </div>

          {reviewsList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted">No reviews submitted yet for this product. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-slate-100">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="pt-6 first:pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-heading font-semibold text-sm text-heading">{rev.customerName}</h4>
                    <span className="text-[10px] text-muted">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < rev.rating ? "fill-current" : "text-slate-100"}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Review Submission Modal Dialog */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-border shadow-2xl p-6 relative animate-zoomIn">
            <h3 className="font-heading font-bold text-lg text-heading mb-4">Write a Product Review</h3>
            
            {reviewSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle className="text-accent mx-auto" size={40} />
                <h4 className="font-heading font-bold text-heading text-sm">Review Submitted!</h4>
                <p className="text-xs text-muted">Thank you for sharing your valuable feedback.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl transition-colors ${star <= reviewRating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">Review Comment</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your review here..."
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary resize-none"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="text-xs text-muted hover:text-heading font-semibold py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-heading"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default ProductDetail;
