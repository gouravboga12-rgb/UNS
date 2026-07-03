import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateQuantity, removeItem, clearCart } from '../store/cartSlice';
import { Trash2, ShieldCheck, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';


// Helper: Dynamically load Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Authenticated user pre-fill
  const u = localStorage.getItem('uns_current_user');
  const currentUser = u ? JSON.parse(u) : null;

  // Form states
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.discountPrice || item.price) * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleQuantityChange = (id: string, q: number) => {
    dispatch(updateQuantity({ id, quantity: q }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) return;

    setLoading(true);
    const orderItems = cartItems.map(item => ({
      productId: item.id,
      name: item.name,
      slug: item.slug,
      image: item.imageUrl,
      quantity: item.quantity,
      price: item.discountPrice || item.price
    }));

    const orderPayload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      shippingAddress: address,
      items: orderItems,
      totalAmount: total,
      paymentMethod: 'online'
    };

    // Razorpay Checkout flow
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Failed to load Razorpay payment gateway. Please check your internet connection.");
      setLoading(false);
      return;
    }

    let registeredOrder: any = null;
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (response.ok) {
        registeredOrder = await response.json();
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to create order on the server.");
        setLoading(false);
        return;
      }
    } catch (err) {
      alert("Server connection failed. Could not place order.");
      setLoading(false);
      return;
    }

    if (!registeredOrder || !registeredOrder.razorpayOrderId) {
      alert("Failed to initialize Razorpay payment session.");
      setLoading(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T7T6MVvx0hvF4f',
      amount: Math.round(total * 100), // in paise
      currency: 'INR',
      name: 'UNS Home Cleaning Products',
      description: `Order #${registeredOrder.orderNumber}`,
      image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=120&h=120&q=80',
      order_id: registeredOrder.razorpayOrderId,
      handler: async (response: any) => {
        setLoading(true);
        try {
          const verificationPayload = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: registeredOrder.id
          };

          const verifyResponse = await fetch(`${API_URL}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verificationPayload)
          });

          if (verifyResponse.ok) {
            const verifiedData = await verifyResponse.json();
            dispatch(clearCart());
            localStorage.setItem('uns_tracking_phone', phone);
            setCheckoutSuccess({
              whatsappRedirect: false,
              orderNumber: verifiedData.order?.orderNumber || registeredOrder.orderNumber,
              phone: phone,
              total: total,
              paymentId: response.razorpay_payment_id
            });
          } else {
            const verifyErr = await verifyResponse.json();
            alert(verifyErr.error || "Payment verification failed. Please contact support.");
          }
        } catch (err) {
          alert("Verification connection failed. Please check your tracking dashboard.");
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: name,
        email: email || 'customer@example.com',
        contact: phone
      },
      notes: {
        address: address
      },
      theme: {
        color: '#0d9488'
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (checkoutSuccess) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-teal-100 text-primary flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck size={36} />
        </div>
        
        <h2 className="text-2xl font-bold font-heading text-heading">
          Order Placed & Paid Successfully!
        </h2>
        <p className="text-xs text-muted leading-relaxed">
          Your payment has been successfully processed and verified. We are preparing your order items for dispatch. You can track its live status below.
        </p>
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 inline-block text-left text-xs space-y-1 w-full max-w-md mx-auto">
          <div><strong className="text-heading">Order Tracking ID:</strong> <span className="font-mono text-primary select-all">{checkoutSuccess.orderNumber}</span></div>
          <div><strong className="text-heading">Registered Phone:</strong> {checkoutSuccess.phone}</div>
          <div><strong className="text-heading">Total Amount:</strong> ₹{checkoutSuccess.total}</div>
          <div><strong className="text-heading">Transaction ID:</strong> <span className="font-mono text-slate-600">{checkoutSuccess.paymentId}</span></div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            to="/products"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
          >
            Continue Shopping
          </Link>
          <Link
            to={`/track-order?orderId=${checkoutSuccess.orderNumber}&phone=${checkoutSuccess.phone}`}
            className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center"
          >
            Track Live Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold font-heading text-heading mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-soft max-w-xl mx-auto space-y-4">
            <ShoppingBag className="text-muted mx-auto" size={48} />
            <h3 className="font-heading font-bold text-heading text-base">Your Cart is Empty</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Choose from our premium floor cleaners, laundry wash liquids, and home disinfectant formulas to start shopping.
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-8 rounded-lg text-xs shadow-sm transition-colors inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-7 space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-border shadow-soft flex gap-4 items-center justify-between hover:shadow-soft-lg transition-all"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                  />
                  
                  {/* Title & Price */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`}>
                      <h4 className="text-xs sm:text-sm font-semibold text-heading hover:text-primary transition-colors truncate">
                        {item.name}
                      </h4>
                    </Link>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs font-bold text-primary">
                        ₹{((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-muted font-medium">
                          (₹{(item.discountPrice || item.price).toFixed(2)} × {item.quantity})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="flex items-center border border-border rounded-lg bg-slate-50 p-0.5">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-white rounded transition-colors text-muted hover:text-primary"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-heading">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-white rounded transition-colors text-muted hover:text-primary"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-muted hover:text-red-500 rounded-full hover:bg-red-50/50 transition-all flex-shrink-0"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              ))}
            </div>

            {/* Right Column: Checkout Billing Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-border shadow-soft space-y-6">
              <h3 className="font-heading font-bold text-base text-heading pb-3 border-b border-slate-100">
                Order Summary & Checkout
              </h3>

              {/* Costs Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-heading">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-heading">
                    {shipping === 0 ? <span className="text-accent">FREE</span> : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-muted font-medium italic">Add ₹{Math.max(0, 501 - subtotal)} more for free shipping</p>
                )}
                <div className="flex justify-between text-sm font-bold pt-3 border-t border-slate-100 text-heading">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Billing Info Form */}
              <form onSubmit={handleCheckout} className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Delivery Details</h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 73961 58011"
                      className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Shipping Address *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="House / Office number, Street name, City, Pincode"
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary resize-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-bold py-3 px-6 rounded-lg text-xs shadow transition-all flex items-center justify-center gap-2 mt-4 bg-primary hover:bg-primary-light"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <ShieldCheck size={16} /> Pay & Complete Order
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
export default Cart;
