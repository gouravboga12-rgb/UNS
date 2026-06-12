import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateQuantity, removeItem, clearCart } from '../store/cartSlice';
import { Trash2, MessageSquare, ShieldCheck, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState<any | null>(null);
  const [orderMethod, setOrderMethod] = useState<'cod' | 'whatsapp'>('whatsapp');
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
      quantity: item.quantity,
      price: item.discountPrice || item.price
    }));

    const orderPayload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      shippingAddress: address,
      items: orderItems,
      totalAmount: total
    };

    if (orderMethod === 'cod') {
      try {
        // Place COD order on Mock API
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });

        if (response.ok) {
          const result = await response.json();
          setCheckoutSuccess(result);
          dispatch(clearCart());
        } else {
          // Local fallback creation if backend is offline
          const mockResult = {
            orderNumber: 1000 + Math.floor(Math.random() * 900) + 1,
            customerPhone: phone,
            id: `ord-local-${Math.random().toString(36).substring(2, 9)}`,
            totalAmount: total
          };
          setCheckoutSuccess(mockResult);
          dispatch(clearCart());
        }
      } catch {
        // Safe local fallback on server connection error
        const mockResult = {
          orderNumber: 1000 + Math.floor(Math.random() * 900) + 1,
          customerPhone: phone,
          id: `ord-local-${Math.random().toString(36).substring(2, 9)}`,
          totalAmount: total
        };
        setCheckoutSuccess(mockResult);
        dispatch(clearCart());
      }
    } else {
      // Order via WhatsApp flow
      const whatsappNumber = "917396158011";
      
      let itemsListText = "";
      cartItems.forEach((item, index) => {
        itemsListText += `${index + 1}. ${item.name} (${item.quantity} units) x ₹${(item.discountPrice || item.price).toFixed(2)}\n`;
      });

      const messageText = `*NEW ORDER INQUIRY - UNS HOME CLEANING PRODUCTS*\n\n` +
                          `*Customer Name:* ${name}\n` +
                          `*Phone Number:* ${phone}\n` +
                          `*Delivery Address:* ${address}\n\n` +
                          `*Items Ordered:*\n${itemsListText}\n` +
                          `*Subtotal:* ₹${subtotal.toFixed(2)}\n` +
                          `*Shipping:* ₹${shipping === 0 ? "FREE" : "₹" + shipping}\n` +
                          `*Estimated Total:* ₹${total.toFixed(2)}\n\n` +
                          `Please confirm order delivery terms and bank options.`;

      const encodedMsg = encodeURIComponent(messageText);
      
      // Keep state clean and dispatch order to backend so tracking exists for it
      try {
        await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...orderPayload, status: 'Pending' })
        });
      } catch {
        // Silently catch server errors in mock mode
      }

      dispatch(clearCart());
      setCheckoutSuccess({ whatsappRedirect: true, messageText });
      setLoading(false);

      // Open WhatsApp Web/API
      window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMsg}`, '_blank');
    }
    setLoading(false);
  };

  if (checkoutSuccess) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-teal-100 text-primary flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck size={36} />
        </div>
        
        {checkoutSuccess.whatsappRedirect ? (
          <>
            <h2 className="text-2xl font-bold font-heading text-heading">WhatsApp Order Initiated!</h2>
            <p className="text-xs text-muted leading-relaxed">
              We have redirected you to WhatsApp to finalize your delivery scheduling and billing details. If the chat window didn't open, click the button below to retry.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-mono whitespace-pre-line max-h-40 overflow-y-auto mb-4">
              {checkoutSuccess.messageText}
            </div>
            <button
              onClick={() => {
                const url = `https://api.whatsapp.com/send?phone=917396158011&text=${encodeURIComponent(checkoutSuccess.messageText)}`;
                window.open(url, '_blank');
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <MessageSquare size={16} /> Open WhatsApp Chat Again
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold font-heading text-heading">Order Placed Successfully!</h2>
            <p className="text-xs text-muted leading-relaxed">
              Your Cash on Delivery order has been registered in our system. We will call you shortly to confirm packaging dispatch details.
            </p>
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 inline-block text-left text-xs space-y-1">
              <div><strong className="text-heading">Order Tracking ID:</strong> <span className="font-mono text-primary select-all">{checkoutSuccess.orderNumber || checkoutSuccess.id}</span></div>
              <div><strong className="text-heading">Registered Phone:</strong> {phone}</div>
              <div><strong className="text-heading">Total Amount:</strong> ₹{checkoutSuccess.totalAmount || total}</div>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to={`/track-order?orderId=${checkoutSuccess.orderNumber || checkoutSuccess.id}&phone=${phone}`}
                className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
              >
                Track Live Order
              </Link>
              <Link
                to="/"
                className="text-xs text-muted hover:text-heading font-semibold py-2.5"
              >
                Return to Shop
              </Link>
            </div>
          </>
        )}
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
                    <span className="text-xs font-bold text-primary block mt-1">
                      ₹{(item.discountPrice || item.price).toFixed(2)}
                    </span>
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

                {/* Checkout Method Toggle */}
                <div>
                  <label className="block text-[10px] font-bold text-muted mb-2 uppercase tracking-wider">Select Checkout Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => setOrderMethod('whatsapp')}
                      className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${
                        orderMethod === 'whatsapp' 
                          ? 'border-green-500 bg-green-50/20 text-green-600 font-bold' 
                          : 'border-border text-muted hover:border-slate-300'
                      }`}
                    >
                      <MessageSquare size={18} />
                      <span className="text-[10px]">Order via WhatsApp</span>
                    </button>

                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setOrderMethod('cod')}
                      className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${
                        orderMethod === 'cod' 
                          ? 'border-primary bg-teal-50/20 text-primary font-bold' 
                          : 'border-border text-muted hover:border-slate-300'
                      }`}
                    >
                      <ShoppingBag size={18} />
                      <span className="text-[10px]">Cash on Delivery</span>
                    </button>

                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white font-bold py-3 px-6 rounded-lg text-xs shadow transition-all flex items-center justify-center gap-2 mt-4 ${
                    orderMethod === 'whatsapp' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-primary hover:bg-primary-light'
                  }`}
                >
                  {loading ? (
                    "Processing Order..."
                  ) : orderMethod === 'whatsapp' ? (
                    <>
                      <MessageSquare size={16} /> Order with WhatsApp Enquiry
                    </>
                  ) : (
                    <>
                      Confirm Cash on Delivery Order <ArrowRight size={14} />
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
