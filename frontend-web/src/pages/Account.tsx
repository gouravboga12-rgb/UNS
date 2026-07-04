import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Package, Clock, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticate user check on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('uns_current_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
  }, [navigate]);

  // Fetch orders when user profile is loaded
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (user.phone) queryParams.append('phone', user.phone);
        if (user.email) queryParams.append('email', user.email);

        const response = await fetch(`${API_URL}/orders/my-orders?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          let combined = [...data];
          
          // Prune deleted orders from local storage cache
          const localOrdersRaw = localStorage.getItem('uns_local_orders');
          if (localOrdersRaw) {
            try {
              const localOrders = JSON.parse(localOrdersRaw);
              const otherUsersLocalOrders = localOrders.filter((order: any) => {
                const matchesPhone = user.phone 
                  ? order.customerPhone && order.customerPhone.replace(/[^0-9]/g, '').endsWith(user.phone.replace(/[^0-9]/g, '').slice(-10))
                  : false;
                const matchesEmail = user.email
                  ? order.customerEmail && order.customerEmail.toLowerCase() === user.email.toLowerCase()
                  : false;
                return !matchesPhone && !matchesEmail;
              });
              const updatedLocalOrders = [...otherUsersLocalOrders, ...data];
              localStorage.setItem('uns_local_orders', JSON.stringify(updatedLocalOrders));
            } catch (e) {
              console.error('Error syncing local orders:', e);
            }
          }

          // Sort by creation date
          combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(combined);
        } else {
          // Fallback to local storage (offline support)
          const localOrdersRaw = localStorage.getItem('uns_local_orders');
          if (localOrdersRaw) {
            try {
              const localOrders = JSON.parse(localOrdersRaw);
              const userLocalOrders = localOrders.filter((order: any) => {
                const matchesPhone = user.phone 
                  ? order.customerPhone && order.customerPhone.replace(/[^0-9]/g, '').endsWith(user.phone.replace(/[^0-9]/g, '').slice(-10))
                  : false;
                const matchesEmail = user.email
                  ? order.customerEmail && order.customerEmail.toLowerCase() === user.email.toLowerCase()
                  : false;
                return matchesPhone || matchesEmail;
              });
              userLocalOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setOrders(userLocalOrders);
              return;
            } catch {}
          }
          throw new Error('Failed to load order history.');
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to server.');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('uns_current_user');
    localStorage.removeItem('uns_token');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <title>My Account Dashboard | UNS India</title>
      <meta name="description" content="View your UNS Home Cleaning Products customer profile, manage active sessions, and track your recent orders list." />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar Icon */}
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shadow-inner">
              <User className="text-primary" size={28} />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-heading">
                  {user.name}
                </h1>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-750 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                    <Shield size={10} /> Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1 uppercase tracking-wider font-semibold">
                Customer Profile Portal
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm"
              >
                Admin Control Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="border border-red-200 hover:bg-red-50 text-red-650 hover:text-red-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Details Sidebar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 md:col-span-1 h-fit">
            <h3 className="font-heading font-extrabold text-heading text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
              Profile Info
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} className="text-primary" /> Full Name
                </span>
                <p className="font-semibold text-heading pl-5">{user.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={12} className="text-primary" /> Email Address
                </span>
                <p className="font-semibold text-heading pl-5 break-all">{user.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={12} className="text-primary" /> Phone Number
                </span>
                <p className="font-semibold text-heading pl-5">{user.phone || 'Not added'}</p>
              </div>
            </div>
          </div>

          {/* Orders Tracking Dashboard Area */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h2 className="font-heading font-extrabold text-heading text-base flex items-center gap-2">
                  <Package className="text-primary" size={18} /> Recent Orders Dashboard
                </h2>
                <span className="bg-teal-50 border border-teal-100 text-primary text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {orders.length} Total
                </span>
              </div>

              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-primary"></div>
                  <p className="text-xs text-muted">Retrieving your order logs...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-100 text-red-750 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                  <div className="text-xs">
                    <p className="font-bold">Error loading history</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-14 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                    <Package size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-heading text-sm">No Orders Found</p>
                    <p className="text-xs text-muted max-w-xs mx-auto">
                      We couldn't find any orders placed under your account phone number or email address.
                    </p>
                  </div>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-xl transition-all shadow-sm"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-slate-200 transition-all hover:bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading font-black text-slate-800 text-sm">
                            UNS-#{order.orderNumber}
                          </span>
                          <span className="inline-block px-2.5 py-0.5 bg-teal-50 border border-teal-100 text-primary text-[9px] font-bold rounded-full uppercase">
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[10px] font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Total: <strong className="text-slate-700">₹{order.totalAmount.toFixed(2)}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto">
                        <Link
                          to={`/track-order?orderId=${order.orderNumber}&phone=${order.customerPhone}`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1 border border-slate-200 hover:border-primary hover:bg-primary hover:text-white bg-white text-heading text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm group"
                        >
                          <span>Track Shipment</span>
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Account;
