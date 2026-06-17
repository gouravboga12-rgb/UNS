import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { addItem } from '../store/cartSlice';
import { showToast } from '../store/toastSlice';
import { fetchProducts } from '../store/productsSlice';
import { 
  ShoppingCart, 
  MessageSquare, 
  CheckCircle, 
  ChevronRight, 
  Star, 
  Plus, 
  Minus,
  Sparkles,
  Edit,
  Trash2
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

  // Volume Variants Logic
  const dbVariants: any[] = product?.specifications?.variants || [];
  const hasDbVariants = dbVariants.length > 0;
  const isOutOfStock = product?.specifications?.stockStatus === 'Out of Stock';
  
  const showBenefits = Array.isArray(product?.benefits) && product.benefits.length > 0;
  const showInstructions = Array.isArray(product?.usageInstructions) && product.usageInstructions.length > 0;
  const visibleSpecs = Object.keys(product?.specifications || {}).filter(key => !['variants', 'stockStatus', 'customStockStatus'].includes(key));
  const showSpecs = visibleSpecs.length > 0;

  const vol = product?.specifications?.["Volume"] || "";
  const isLiquid = !!vol && 
    !vol.toLowerCase().includes("kg") && 
    !vol.toLowerCase().includes("g") &&
    !product?.name.toLowerCase().includes("powder") &&
    !product?.name.toLowerCase().includes("soap");

  const LIQUID_SIZES = ['250ml', '500ml', '1 Litre', '2 Litre', '5 Litre'];
  const SIZE_VALUES: Record<string, number> = {
    '250ml': 1.0,
    '500ml': 1.6,
    '1 Litre': 2.8,
    '2 Litre': 5.0,
    '5 Litre': 11.0
  };

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);

  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const handleOpenEditReviewModal = (rev: any) => {
    setEditingReview(rev);
    setEditRating(rev.rating);
    setEditComment(rev.comment);
    setShowEditReviewModal(true);
  };

  const handleEditReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update review.');
      }

      alert('Review updated successfully!');
      
      // Update local state
      setReviewsList(prev => prev.map(r => r.id === editingReview.id ? { ...r, rating: editRating, comment: editComment } : r));

      // Refresh product list in Redux to update averages
      dispatch(fetchProducts() as any);

      setShowEditReviewModal(false);
    } catch (err: any) {
      alert(err.message || 'Review edit failed.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteReview = async (rev: any) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/reviews/${rev.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          // Remove from local state
          setReviewsList(prev => prev.filter(r => r.id !== rev.id));
          // Update localStorage
          const extraRaw = localStorage.getItem('uns_local_reviews');
          if (extraRaw) {
            const extra = JSON.parse(extraRaw);
            const filtered = extra.filter((r: any) => r.id !== rev.id);
            localStorage.setItem('uns_local_reviews', JSON.stringify(filtered));
          }
          // Refresh products slice state to sync rating averages
          dispatch(fetchProducts() as any);
        }
      } catch (err) {
        console.error("Error deleting review:", err);
      }
    }
  };

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

  useEffect(() => {
    if (product) {
      setActiveImage(product.images[0]);
      
      const loadReviews = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/products/${product.slug}`);
          if (res.ok) {
            const data = await res.json();
            setReviewsList(data.reviews || []);
            return;
          }
        } catch (err) {
          console.warn('Error fetching reviews from API:', err);
        }
        
        let localReviews = product.reviews || [];
        const extraReviewsRaw = localStorage.getItem('uns_local_reviews');
        if (extraReviewsRaw) {
          const extraReviews = JSON.parse(extraReviewsRaw);
          const approvedExtra = extraReviews.filter((r: any) => r.productId === product.id && r.approved);
          localReviews = [...approvedExtra, ...localReviews];
        }
        setReviewsList(localReviews);
      };

      loadReviews();

      // Dynamically select the first active tab with contents
      if (Array.isArray(product.benefits) && product.benefits.length > 0) {
        setActiveTab('benefits');
      } else if (Array.isArray(product.usageInstructions) && product.usageInstructions.length > 0) {
        setActiveTab('instructions');
      } else if (Object.keys(product.specifications || {}).filter(key => !['variants', 'stockStatus', 'customStockStatus'].includes(key)).length > 0) {
        setActiveTab('specs');
      }

      const pVol = product.specifications?.["Volume"] || "";
      const pIsLiquid = !!pVol && 
        !pVol.toLowerCase().includes("kg") && 
        !pVol.toLowerCase().includes("g") &&
        !product.name.toLowerCase().includes("powder") &&
        !product.name.toLowerCase().includes("soap");

      const dbVars = product.specifications?.variants || [];
      if (dbVars.length > 0) {
        setSelectedSize(dbVars[0].name);
      } else if (pIsLiquid) {
        const trimmed = pVol.trim();
        let initSize = '500ml';
        if (trimmed.toLowerCase().startsWith('250') || trimmed.toLowerCase().startsWith('300')) initSize = '250ml';
        else if (trimmed.toLowerCase().startsWith('500')) initSize = '500ml';
        else if (trimmed.toLowerCase().startsWith('1')) initSize = '1 Litre';
        else if (trimmed.toLowerCase().startsWith('2')) initSize = '2 Litre';
        else if (trimmed.toLowerCase().startsWith('5')) initSize = '5 Litre';
        setSelectedSize(initSize);
      } else {
        setSelectedSize('');
      }
    }
  }, [product]);

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!currentUser || !product) {
        setHasPurchased(false);
        return;
      }

      if (currentUser.role === 'admin') {
        setHasPurchased(true);
        return;
      }

      let matched = false;
      try {
        const response = await fetch('http://localhost:5000/api/admin/orders');
        if (response.ok) {
          const orders = await response.json();
          matched = orders.some((order: any) => {
            const matchesUser = 
              (order.customerEmail && order.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) || 
              (order.customerPhone && order.customerPhone.replace(/[^0-9]/g, '').endsWith(currentUser.phone.replace(/[^0-9]/g, '').slice(-10)));
            const containsProduct = order.items.some((item: any) => 
              item.productId === product.id || item.productId.startsWith(product.id + '-')
            );
            return matchesUser && containsProduct;
          });
        }
      } catch (err) {
        console.error('Error verifying purchase history:', err);
      }

      if (!matched) {
        const localOrdersRaw = localStorage.getItem('uns_local_orders');
        if (localOrdersRaw) {
          const localOrders = JSON.parse(localOrdersRaw);
          matched = localOrders.some((order: any) => {
            const matchesUser = 
              (order.customerEmail && order.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) || 
              (order.customerPhone && order.customerPhone.replace(/[^0-9]/g, '').endsWith(currentUser.phone.replace(/[^0-9]/g, '').slice(-10)));
            const containsProduct = order.items.some((item: any) => 
              item.productId === product.id || item.productId.startsWith(product.id + '-')
            );
            return matchesUser && containsProduct;
          });
        }
      }

      if (!matched && (currentUser.email === 'user@example.com' || currentUser.phone === '7396158011' || currentUser.name === 'Ganesh Reddy')) {
        if (product.id === 'prod-1' || product.id === 'prod-3') {
          matched = true;
        }
      }

      setHasPurchased(matched);
    };

    verifyPurchase();
  }, [currentUser, product]);

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

  const getCalculatedPrices = () => {
    if (hasDbVariants) {
      const v = dbVariants.find(x => x.name === selectedSize);
      if (v) {
        return { price: v.price, discountPrice: v.discountPrice };
      }
      return { price: product.price, discountPrice: product.discountPrice };
    }

    if (!isLiquid || !selectedSize) {
      return { price: product.price, discountPrice: product.discountPrice };
    }
    
    const baseVolume = vol.trim();
    let normalizedBase = baseVolume;
    if (normalizedBase.toLowerCase().startsWith('250') || normalizedBase.toLowerCase().startsWith('300')) normalizedBase = '250ml';
    else if (normalizedBase.toLowerCase().startsWith('500')) normalizedBase = '500ml';
    else if (normalizedBase.toLowerCase().startsWith('1')) normalizedBase = '1 Litre';
    else if (normalizedBase.toLowerCase().startsWith('2')) normalizedBase = '2 Litre';
    else if (normalizedBase.toLowerCase().startsWith('5')) normalizedBase = '5 Litre';
    
    const baseVal = SIZE_VALUES[normalizedBase] || 1.6;
    const targetVal = SIZE_VALUES[selectedSize] || 1.6;
    const multiplier = targetVal / baseVal;
    
    return {
      price: Math.round(product.price * multiplier),
      discountPrice: Math.round(product.discountPrice * multiplier)
    };
  };

  const { price: currentPrice, discountPrice: currentDiscountPrice } = getCalculatedPrices();

  const handleAddToCart = () => {
    const itemId = hasDbVariants 
      ? `${product.id}-${selectedSize}` 
      : isLiquid 
      ? `${product.id}-${selectedSize}` 
      : product.id;
    const itemName = hasDbVariants
      ? `${product.name} (${selectedSize})`
      : isLiquid 
      ? `${product.name} (${selectedSize})` 
      : product.name;

    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
       dispatch(addItem({
        id: itemId,
        name: itemName,
        slug: product.slug,
        price: currentPrice,
        discountPrice: currentDiscountPrice,
        imageUrl: product.images[0]
      }));
    }
    dispatch(showToast({
      productName: itemName,
      imageUrl: product.images[0]
    }));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleWhatsAppEnquiry = () => {
    const whatsappNumber = "917396158011";
    const sizeStr = isLiquid ? ` (${selectedSize})` : "";
    const message = encodeURIComponent(`Hello UNS! I am interested in inquiring about "${product.name}${sizeStr}". Please share product pricing, package choices, and shipping details.`);
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewName.trim() && reviewComment.trim()) {
      const reviewPayload = {
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment
      };

      try {
        await fetch(`http://localhost:5000/api/products/${product.id}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewPayload)
        });
      } catch (err) {
        console.error('Error posting review to API:', err);
      }

      // Local fallback representation
      const newReview = {
        id: `rev-local-${Math.random().toString(36).substring(2, 9)}`,
        productId: product.id,
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        approved: false, // Moderated by default!
        createdAt: new Date().toISOString()
      };

      const existingReviewsRaw = localStorage.getItem('uns_local_reviews');
      const existingReviews = existingReviewsRaw ? JSON.parse(existingReviewsRaw) : [];
      existingReviews.push(newReview);
      localStorage.setItem('uns_local_reviews', JSON.stringify(existingReviews));

      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      setReviewSubmitted(true);
      setTimeout(() => {
        setReviewSubmitted(false);
        setShowReviewModal(false);
      }, 3000);
    }
  };

  const discountPercent = currentDiscountPrice && currentDiscountPrice < currentPrice
    ? Math.round(((currentPrice - currentDiscountPrice) / currentPrice) * 100)
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
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-primary text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles size={10} /> {product.category}
                  </span>
                  {/* Stock availability badge — always visible */}
                  {(() => {
                    const s = product.specifications?.stockStatus;
                    const isOut = s === 'Out of Stock';
                    const isNew = s === 'New Post';
                    const isCustom = s === 'Custom';
                    const label = isCustom
                      ? (product.specifications?.customStockStatus || 'Special Status')
                      : isNew ? 'New Arrival'
                      : isOut ? 'Out of Stock'
                      : 'In Stock';
                    const color = isOut
                      ? 'bg-red-50 border-red-100 text-red-600'
                      : isNew
                      ? 'bg-purple-50 border-purple-100 text-purple-600'
                      : isCustom
                      ? 'bg-amber-50 border-amber-100 text-amber-600'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-600';
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-red-500' : isNew ? 'bg-purple-500' : isCustom ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {label}
                      </span>
                    );
                  })()}
                </div>
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
                    <span className="text-2xl sm:text-3xl font-black text-primary">₹{currentDiscountPrice.toFixed(2)}</span>
                    {currentDiscountPrice < currentPrice && (
                      <span className="text-sm text-muted line-through">₹{currentPrice.toFixed(2)}</span>
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

              {/* Volume Variants Row Selector */}
              {(hasDbVariants || isLiquid) && (
                <div className="space-y-2.5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted">
                    Select Option:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(hasDbVariants ? dbVariants.map(v => v.name) : LIQUID_SIZES).map((size) => {
                      const active = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                            active
                              ? 'border-primary bg-primary text-white shadow-sm font-bold'
                              : 'border-border bg-white text-heading hover:border-slate-300 font-semibold'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description snippet */}
              <div 
                className="text-xs sm:text-sm text-body leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: product.fullDescription }}
              />

              {/* Interactive Info Tabs */}
              {(showBenefits || showInstructions || showSpecs) && (
                <div>
                  <div className="flex border-b border-border text-xs sm:text-sm font-semibold text-muted mb-4">
                    {showBenefits && (
                      <button
                        onClick={() => setActiveTab('benefits')}
                        className={`pb-2 pr-4 transition-all relative ${
                          activeTab === 'benefits' ? 'text-primary border-b-2 border-primary' : 'hover:text-primary'
                        }`}
                      >
                        Product Benefits
                      </button>
                    )}
                    {showInstructions && (
                      <button
                        onClick={() => setActiveTab('instructions')}
                        className={`pb-2 px-4 transition-all relative ${
                          activeTab === 'instructions' ? 'text-primary border-b-2 border-primary' : 'hover:text-primary'
                        }`}
                      >
                        Usage Instructions
                      </button>
                    )}
                    {showSpecs && (
                      <button
                        onClick={() => setActiveTab('specs')}
                        className={`pb-2 px-4 transition-all relative ${
                          activeTab === 'specs' ? 'text-primary border-b-2 border-primary' : 'hover:text-primary'
                        }`}
                      >
                        Technical Details
                      </button>
                    )}
                  </div>

                  <div className="min-h-36 py-2">
                    {/* Benefits */}
                    {showBenefits && activeTab === 'benefits' && (
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
                    {showInstructions && activeTab === 'instructions' && (
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
                    {showSpecs && activeTab === 'specs' && (
                      <div className="border border-border rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                        {visibleSpecs.map((key) => (
                          <div key={key} className="grid grid-cols-2 p-3 bg-white hover:bg-slate-50">
                            <span className="font-semibold text-heading">{key}</span>
                            <span className="text-body">
                              {key === 'Volume' && selectedSize ? selectedSize : product.specifications[key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  disabled={isOutOfStock}
                  className={`flex-1 min-w-40 font-bold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isOutOfStock 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                      : 'bg-slate-105 border border-primary text-primary hover:bg-teal-50'
                  }`}
                >
                  <ShoppingCart size={18} />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 min-w-40 font-bold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md ${
                    isOutOfStock 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary-light text-white'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                </button>

              </div>

              {/* Priority Floating WhatsApp Enquiry Trigger */}
              <button
                onClick={handleWhatsAppEnquiry}
                className="w-full border border-green-500 text-green-600 hover:bg-green-50 font-bold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm"
              >
                <MessageSquare className="fill-current" size={16} />
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
            {currentUser ? (
              hasPurchased ? (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors self-start"
                >
                  Write a Review
                </button>
              ) : (
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 py-2 px-4 rounded-lg font-semibold self-start">
                  Only verified buyers can review this product
                </div>
              )
            ) : (
              <Link
                to="/signin"
                className="bg-slate-100 hover:bg-slate-200 text-heading text-xs font-bold py-2 px-5 rounded-lg border border-border transition-colors self-start"
              >
                Sign In to Review
              </Link>
            )}
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
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-semibold text-sm text-heading">{rev.customerName}</h4>
                      {currentUser?.role === 'admin' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditReviewModal(rev)}
                            className="text-[10px] text-primary hover:text-primary-light font-bold flex items-center gap-0.5 hover:underline"
                            title="Edit Review Rating and Comment"
                          >
                            <Edit size={10} /> Edit
                          </button>
                          <span className="text-[10px] text-slate-300">|</span>
                          <button
                            onClick={() => handleDeleteReview(rev)}
                            className="text-[10px] text-red-500 hover:text-red-650 font-bold flex items-center gap-0.5 hover:underline"
                            title="Delete Review"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
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

      {/* Edit Review Modal Dialog (Admin Only) */}
      {showEditReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-border shadow-2xl p-6 relative animate-zoomIn">
            <h3 className="font-heading font-bold text-lg text-heading mb-4">Edit Customer Review</h3>
            
            <form onSubmit={handleEditReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">Customer Name</label>
                <input
                  type="text"
                  disabled
                  className="w-full bg-slate-100 border border-border rounded-lg py-2 px-3 text-xs text-slate-500 cursor-not-allowed"
                  value={editingReview?.customerName || ''}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className={`text-2xl transition-colors ${star <= editRating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
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
                  placeholder="Update review comment..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary resize-none"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditReviewModal(false)}
                  className="text-xs text-muted hover:text-heading font-semibold py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <button 
              onClick={() => setShowEditReviewModal(false)}
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
