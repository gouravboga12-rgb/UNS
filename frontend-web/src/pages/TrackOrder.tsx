import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { ProductCard } from '../components/ProductCard';
import { Loader2, ClipboardList, MapPin, Truck, CheckCircle2, X } from 'lucide-react';
import { API_URL } from '../config';


export const TrackOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Check authenticated user
  const u = localStorage.getItem('uns_current_user');
  const currentUser = u ? JSON.parse(u) : null;
  const userPhone = currentUser?.phone || '';
  
  // Track Mode selector ('order' matches Koparo Clean UI, 'tracking' represents AWB tracking)
  const [trackMode, setTrackMode] = useState<'order' | 'tracking'>('order');

  // Form input states
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phone, setPhone] = useState(userPhone);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // User orders history state
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Selector for bestseller/recommended shelf products
  const products = useSelector((state: RootState) => state.products.items);
  const bestSellers = products.filter(p => p.featured).slice(0, 5);
  const displayProducts = bestSellers.length ? bestSellers : products.slice(0, 5);

  useEffect(() => {
    if (userPhone) {
      setPhone(userPhone);
    }
  }, [userPhone]);

  useEffect(() => {
    const defaultOrder = searchParams.get('orderId');
    if (defaultOrder && userPhone) {
      handleTrack(defaultOrder, userPhone);
    }
  }, [searchParams, userPhone]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!currentUser) return;
      setLoadingOrders(true);
      
      let fetched: any[] = [];
      try {
        const queryParams = new URLSearchParams();
        if (currentUser.phone) queryParams.append('phone', currentUser.phone);
        if (currentUser.email) queryParams.append('email', currentUser.email);

        const response = await fetch(`${API_URL}/orders/my-orders?${queryParams.toString()}`);
        if (response.ok) {
          fetched = await response.json();
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
      }

      // Merge with uns_local_orders
      const localOrdersRaw = localStorage.getItem('uns_local_orders');
      if (localOrdersRaw) {
        try {
          const localOrders = JSON.parse(localOrdersRaw);
          const userLocalOrders = localOrders.filter((order: any) => {
            const matchesPhone = currentUser.phone 
              ? order.customerPhone && order.customerPhone.replace(/[^0-9]/g, '').endsWith(currentUser.phone.replace(/[^0-9]/g, '').slice(-10))
              : false;
            const matchesEmail = currentUser.email
              ? order.customerEmail && order.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
              : false;
            return matchesPhone || matchesEmail;
          });

          // Combine and deduplicate
          const combined = [...fetched];
          userLocalOrders.forEach((lo: any) => {
            const exists = combined.some(o => o.id === lo.id || o.orderNumber === lo.orderNumber);
            if (!exists) {
              combined.push(lo);
            }
          });
          
          // Sort by date/createdAt descending
          combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          fetched = combined;
        } catch (e) {
          console.error('Error parsing local orders:', e);
        }
      }

      setUserOrders(fetched);
      if (fetched.length > 0 && !orderData) {
        setOrderId(fetched[0].orderNumber.toString());
        setOrderData(fetched[0]);
      }
      setLoadingOrders(false);
    };

    fetchUserOrders();
  }, [currentUser?.phone, currentUser?.email]);

  const handleTrack = async (id: string, ph: string) => {
    const targetPhone = userPhone || ph;
    if (!id.trim() || !targetPhone.trim()) return;
    
    setSearching(true);
    setError(null);
    setOrderData(null);

    try {
      const response = await fetch(`${API_URL}/orders/track?orderId=${encodeURIComponent(id)}&phone=${encodeURIComponent(targetPhone)}`);
      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
      } else {
        // Fallback for offline demo
        if (id === '1001' && targetPhone.replace(/[^0-9]/g, '').endsWith('7396158011')) {
          setOrderData({
            orderNumber: 1001,
            customerName: "Ganesh Reddy",
            customerPhone: "7396158011",
            shippingAddress: "Plot 42, H.No: 4-12/A, Siddipet, Telangana, 502103",
            totalAmount: 347.00,
            status: "Processing",
            createdAt: "2026-06-12T10:00:00Z",
            trackingTimeline: [
              { status: "Order Placed", time: "2026-06-12T10:00:00Z", description: "Order successfully received by UNS systems." },
              { status: "Processing", time: "2026-06-12T14:30:00Z", description: "Order items have been packed and are ready for pickup." }
            ],
            items: [
              { name: "Toilet Cleaner Liquid", quantity: 2, price: 99.00 },
              { name: "Floor Cleaner Liquid", quantity: 1, price: 149.00 }
            ]
          });
        } else {
          setError("No order found matching these details. Verify your Order ID and registered phone number.");
        }
      }
    } catch {
      // Local fallback on server connection error
      if (id === '1001' && targetPhone.replace(/[^0-9]/g, '').endsWith('7396158011')) {
        setOrderData({
          orderNumber: 1001,
          customerName: "Ganesh Reddy",
          customerPhone: "7396158011",
          shippingAddress: "Plot 42, H.No: 4-12/A, Siddipet, Telangana, 502103",
          totalAmount: 347.00,
          status: "Processing",
          createdAt: "2026-06-12T10:00:00Z",
          trackingTimeline: [
            { status: "Order Placed", time: "2026-06-12T10:00:00Z", description: "Order successfully received by UNS systems." },
            { status: "Processing", time: "2026-06-12T14:30:00Z", description: "Order items have been packed and are ready for pickup." }
          ],
          items: [
            { name: "Toilet Cleaner Liquid", quantity: 2, price: 99.00 },
            { name: "Floor Cleaner Liquid", quantity: 1, price: 149.00 }
          ]
        });
      } else {
        setError("Could not connect to verification server. For demo, try Order ID '1001' & Phone '7396158011'.");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleTrackByPhoneOnly = async (ph: string) => {
    if (!ph.trim()) return;
    
    setSearching(true);
    setError(null);
    setOrderData(null);
    setUserOrders([]);

    try {
      const response = await fetch(`${API_URL}/orders/my-orders?phone=${encodeURIComponent(ph)}`);
      if (response.ok) {
        const orders = await response.json();
        setUserOrders(orders);
        if (orders.length > 0) {
          setOrderData(orders[0]); // Auto-display the most recent one
          setOrderId(orders[0].orderNumber.toString());
        } else {
          setError("No orders found matching this phone number.");
        }
      } else {
        setError("Failed to find orders for this phone number.");
      }
    } catch (err) {
      setError("Connection failed. Could not verify orders.");
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      handleTrack(orderId, phone);
    } else {
      handleTrackByPhoneOnly(phone);
    }
  };

  // Helper to determine status step color
  const getStepIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'order placed':
        return <ClipboardList size={18} />;
      case 'processing':
        return <Loader2 size={18} className="animate-spin" />;
      case 'shipped':
        return <Truck size={18} />;
      case 'delivered':
        return <CheckCircle2 size={18} />;
      default:
        return <MapPin size={18} />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 border-emerald-100 text-emerald-600';
      case 'shipped':
        return 'bg-blue-50 border-blue-100 text-blue-600';
      case 'processing':
        return 'bg-amber-55 border-amber-150 text-amber-700';
      case 'cancelled':
        return 'bg-red-50 border-red-100 text-red-600';
      default:
        return 'bg-slate-50 border-slate-100 text-slate-600';
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen relative overflow-hidden">
      
      {/* Decorative Blur Blobs to match About Page visual guidelines */}
      <div className="absolute top-[10%] left-[-15%] w-[30rem] h-[30rem] rounded-full bg-teal-150/10 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-15%] w-[30rem] h-[30rem] rounded-full bg-emerald-150/10 blur-3xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Top Product Shelf Banner Image (to match Koparo Clean tracking header visual) */}
        <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden aspect-[21/6] sm:aspect-[21/4] border border-border shadow-soft bg-teal-950 mb-12 relative group select-none">
          <img 
            src="/banners/uns_track_banner.png" 
            alt="UNS Products Shelf banner" 
            className="w-full h-full object-cover object-center opacity-90 group-hover:scale-101 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/40 to-transparent" />
        </div>

        {/* Title & Introduction */}
        <div className="text-center max-w-xl mx-auto mb-10" data-aos="fade-up">
          <h1 className="text-3xl font-extrabold font-heading text-heading tracking-tight">Track Your Shipment</h1>
          <p className="text-xs text-muted mt-2">
            Stay updated with real-time delivery tracking of your UNS hygiene products.
          </p>
        </div>

        {/* tracking form box (Styled to match koparoclean.clickpost.ai/en) */}
        <div className="bg-white p-8 rounded-3xl border border-border shadow-soft mb-12 max-w-3xl mx-auto space-y-6" data-aos="fade-up">
          
          {/* Mode Selector Radio Options */}
          <div className="flex justify-center items-center gap-8 border-b border-slate-100 pb-4">
            <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer text-heading select-none">
              <input
                type="radio"
                name="trackMode"
                checked={trackMode === 'order'}
                onChange={() => setTrackMode('order')}
                className="w-4 h-4 text-primary bg-slate-50 border-slate-350 focus:ring-primary focus:ring-2 accent-primary"
              />
              Order ID
            </label>
            <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer text-heading select-none">
              <input
                type="radio"
                name="trackMode"
                checked={trackMode === 'tracking'}
                onChange={() => setTrackMode('tracking')}
                className="w-4 h-4 text-primary bg-slate-50 border-slate-350 focus:ring-primary focus:ring-2 accent-primary"
              />
              Tracking ID (AWB)
            </label>
          </div>

          {/* Integrated Horizontal Search Container Bar */}
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-full p-2.5 shadow-inner gap-3">
            <div className="flex flex-1 items-center w-full px-3 gap-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider whitespace-nowrap select-none">
                {trackMode === 'order' ? "Order ID" : "Tracking ID"}:
              </span>
              <input
                type="text"
                placeholder={trackMode === 'order' ? "Enter Order ID (optional)" : "Enter AWB / Tracking ID (optional)"}
                className="w-full bg-transparent border-none py-1.5 px-2 text-xs focus:outline-none text-heading font-medium"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            
            <div className="hidden sm:block w-[1px] h-7 bg-slate-250" />
            
            <div className="flex flex-1 items-center w-full px-3 gap-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider whitespace-nowrap select-none">Phone:</span>
              <input
                type="tel"
                required
                placeholder="Enter Registered Phone"
                className="w-full bg-transparent border-none py-1.5 px-2 text-xs focus:outline-none text-heading font-medium"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="w-full sm:w-auto bg-black hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl sm:rounded-full text-xs shadow-md transition-all duration-300 transform active:scale-97 flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              {searching ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Verifying...
                </>
              ) : (
                "Track Your Order"
              )}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg text-xs text-center font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Tracking Details Results */}
        {orderData && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-soft max-w-4xl mx-auto mb-16 space-y-8 animate-fadeIn" data-aos="fade-up">
            
            {/* Summary Row */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-6 gap-6">
              <div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Order Reference</span>
                <h3 className="font-heading font-bold text-lg text-heading mt-0.5">UNS-#{orderData.orderNumber}</h3>
              </div>
              <div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Recipient Name</span>
                <p className="text-xs font-semibold text-heading mt-0.5">{orderData.customerName}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Estimated Total</span>
                <p className="text-xs font-bold text-primary mt-0.5">₹{orderData.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Current Status</span>
                <div className="mt-0.5">
                  <span className="inline-block px-2.5 py-0.5 bg-teal-50 border border-teal-100 text-primary text-[10px] font-bold rounded-full uppercase">
                    {orderData.status}
                  </span>
                </div>
              </div>
              
              {/* Tracking ID & Link */}
              {orderData.trackingId && (
                <div>
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Tracking ID</span>
                  <span className="text-xs font-mono font-bold text-heading mt-0.5 block">{orderData.trackingId}</span>
                  {orderData.trackingLink && (
                    <a 
                      href={orderData.trackingLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-primary hover:underline font-bold block mt-0.5"
                    >
                      Track via Courier ↗
                    </a>
                  )}
                </div>
              )}

              {/* Invoice Action Button */}
              <div>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  View / Download Invoice
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <h4 className="font-heading font-bold text-sm text-heading mb-4">Shipment Progress Timeline</h4>
              
              <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-8">
                {orderData.trackingTimeline.map((item: any, index: number) => {
                  const isLatest = index === orderData.trackingTimeline.length - 1;
                  
                  return (
                    <div key={index} className="relative">
                      {/* Timeline Dot Indicator */}
                      <span className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        isLatest 
                          ? 'bg-primary border-primary text-white animate-pulse' 
                          : 'bg-teal-50 border-teal-200 text-primary'
                      }`}>
                        {getStepIcon(item.status)}
                      </span>

                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-heading font-bold text-xs sm:text-sm text-heading">{item.status}</h5>
                          <span className="text-[10px] text-muted">{new Date(item.time).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Summary */}
            <div className="border-t border-slate-100 pt-6">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted mb-4">Items in Package</h4>
              <div className="space-y-3">
                {orderData.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-slate-650">{item.name} <strong className="text-heading text-[10px]">x{item.quantity}</strong></span>
                    <span className="font-semibold text-heading">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ship Address */}
            <div className="border-t border-slate-100 pt-6 text-xs space-y-2">
              <strong className="font-bold text-heading uppercase tracking-wider text-[10px] block text-muted">Shipping Destination</strong>
              <p className="text-slate-600 leading-relaxed">{orderData.shippingAddress}</p>
            </div>

          </div>
        )}

        {/* User's Order History */}
        <div className="max-w-3xl mx-auto mb-16 space-y-6" data-aos="fade-up">
          <div className="border-t border-slate-200/60 pt-10">
            <h2 className="text-xl font-bold text-heading">Your Recent Orders</h2>
            <p className="text-xs text-muted mt-1">
              {currentUser 
                ? "Click any order below to track its live shipment timeline or view the invoice."
                : "Sign in to view your order history automatically."}
            </p>
          </div>

          {!currentUser ? (
            <div className="bg-slate-50 border border-border rounded-2xl p-6 text-center space-y-3">
              <p className="text-xs text-muted font-medium">You are not signed in. Log in to view your previous order history and statuses.</p>
              <Link 
                to="/signin"
                className="inline-block bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-6 rounded-xl shadow-sm transition-colors font-semibold"
              >
                Sign In
              </Link>
            </div>
          ) : loadingOrders ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-primary" size={24} />
              <span className="text-xs text-muted ml-2 font-medium">Loading your orders...</span>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-8 text-center text-xs text-muted">
              You haven't placed any orders yet. Once you order, they will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userOrders.map((order) => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-2xl border p-5 hover:shadow-soft transition-all duration-300 flex flex-col justify-between ${
                    orderData?.orderNumber === order.orderNumber ? 'border-primary ring-2 ring-primary/10' : 'border-border'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Order ID</span>
                        <span className="font-heading font-black text-sm text-heading">UNS-#{order.orderNumber}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider shadow-xs ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Date and Total */}
                    <div className="flex justify-between text-xs text-slate-500 mb-3 font-medium pb-2 border-b border-slate-100">
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-heading">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-4">
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="text-[11px] text-slate-650 flex justify-between">
                          <span className="truncate max-w-[170px]">{item.name}</span>
                          <span className="font-semibold text-heading whitespace-nowrap">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-[10px] text-muted italic">+ {order.items.length - 3} more item(s)</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto gap-2">
                    <button
                      onClick={() => {
                        setOrderId(order.orderNumber.toString());
                        setOrderData(order);
                        setError(null);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className="flex-1 bg-slate-50 border border-border hover:bg-slate-100 hover:border-slate-300 text-heading text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors text-center"
                    >
                      Track Order
                    </button>
                    <button
                      onClick={() => {
                        setOrderData(order);
                        setShowInvoiceModal(true);
                      }}
                      className="flex-1 bg-primary hover:bg-primary-light text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors text-center shadow-xs"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Products Shelf (Bestsellers Shelf styled to match Koparo Clean tracking footer) */}
        <div className="space-y-6 pt-12 border-t border-slate-200/60" data-aos="fade-up">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-bold text-primary bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">UNS Bestsellers</span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-heading mt-3">You May Also Like</h3>
            <p className="text-xs text-muted mt-1">Recommended plant-based, safe formulations chosen by our community of families.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 pt-4">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

      </div>

      {showInvoiceModal && orderData && (
        <InvoiceModal orderData={orderData} onClose={() => setShowInvoiceModal(false)} />
      )}
    </div>
  );
};

// Invoice Modal Component integration at end of TrackOrder.tsx
const InvoiceModal: React.FC<{ orderData: any; onClose: () => void }> = ({ orderData, onClose }) => {
  const subtotal = orderData.totalAmount - (orderData.totalAmount > 500 ? 0 : 50);
  const shipping = orderData.totalAmount > 500 ? 0 : 50;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 md:p-10 flex justify-center items-start print:bg-white print:p-0 print:block">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
      <div 
        id="printable-invoice"
        className="bg-white rounded-2xl max-w-2xl w-full border border-border shadow-2xl p-6 sm:p-8 relative my-8 print:my-0 print:border-none print:shadow-none print:p-0 animate-zoomIn"
      >
        {/* Close trigger */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-heading print-hidden p-1 rounded-full hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-slate-150 pb-5 mb-5 print:border-slate-200">
          <div>
            <h2 className="font-heading text-lg font-black text-primary tracking-wide">UNS HOME CLEANING PRODUCTS</h2>
            <p className="text-[10px] text-muted font-bold tracking-tight mt-0.5">Clean Today... Healthy Tomorrow...</p>
            <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
              Plot No. 12, Industrial Area, Phase 1,<br/>
              Siddipet, Telangana, 502103<br/>
              Email: unshomecleaningproductspvtltd@gmail.com | Phone: +91 7396158011
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-black text-heading uppercase tracking-wider">TAX INVOICE</h3>
            <p className="text-[10px] text-muted mt-1">Invoice No: <strong className="text-heading font-bold">INV-{orderData.orderNumber}</strong></p>
            <p className="text-[10px] text-muted">Order ID: <strong className="font-mono text-heading font-bold">{orderData.id}</strong></p>
            <p className="text-[10px] text-muted">Date: {new Date(orderData.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Billing / Shipping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-xs leading-relaxed">
          <div>
            <h4 className="font-bold text-[10px] uppercase text-muted tracking-wider mb-1">Billing Address:</h4>
            <p className="font-bold text-heading">{orderData.customerName}</p>
            <p>Phone: {orderData.customerPhone}</p>
            {orderData.customerEmail && <p>Email: {orderData.customerEmail}</p>}
          </div>
          <div>
            <h4 className="font-bold text-[10px] uppercase text-muted tracking-wider mb-1">Shipping Destination:</h4>
            <p className="text-slate-650">{orderData.shippingAddress}</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border border-border rounded-xl overflow-hidden mb-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border font-bold text-heading text-[10px] uppercase tracking-wider">
                <th className="p-3 w-12 text-center">S.No</th>
                <th className="p-3">Product Description</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-center w-16">Qty</th>
                <th className="p-3 text-right">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-body">
              {orderData.items.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/20">
                  <td className="p-3 text-center text-muted">{idx + 1}</td>
                  <td className="p-3 font-semibold text-heading">{item.name}</td>
                  <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right font-semibold text-heading">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sum calculation card */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Shipping Charges</span>
              <span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-heading border-t border-slate-100 pt-2">
              <span>Grand Total</span>
              <span className="text-primary font-black text-base">₹{orderData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment details / footer notes */}
        <div className="border-t border-slate-150 pt-4 text-[9px] text-muted leading-relaxed mb-6 space-y-1">
          <p><strong>Payment Status:</strong> Pending Verification</p>
          <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
        </div>

        {/* Print controls */}
        <div className="flex justify-end gap-3 print-hidden border-t border-slate-100 pt-4">
          <button
            onClick={() => window.print()}
            className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            Print / Save as PDF
          </button>
          <button
            onClick={onClose}
            className="text-xs text-muted hover:text-heading font-semibold py-2 px-4 border border-border rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
