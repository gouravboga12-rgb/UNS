import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { addProductLocally, updateProductLocally, deleteProductLocally } from '../store/productsSlice';
import type { Product } from '../store/productsSlice';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  ShieldAlert, 
  TrendingUp, 
  Truck
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.items);
  const categories = useSelector((state: RootState) => state.products.categories);

  // States
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'reviews' | 'enquiries'>('overview');
  
  // Dashboard mock analytics stats
  const [stats, setStats] = useState({
    totalSales: 45890,
    pendingOrders: 1,
    catalogSize: products.length,
    unreadEnquiries: 1
  });

  // Local state storage mirroring mock database lists
  const [localOrders, setLocalOrders] = useState<any[]>([
    {
      id: "ord-1234",
      orderNumber: 1001,
      customerName: "Ganesh Reddy",
      customerPhone: "7396158011",
      shippingAddress: "Plot 42, H.No: 4-12/A, Siddipet, Telangana, 502103",
      totalAmount: 347.00,
      status: "Processing",
      items: "2x Toilet Cleaner, 1x Floor Cleaner",
      createdAt: "2026-06-12"
    }
  ]);

  const [localEnquiries, setLocalEnquiries] = useState<any[]>([
    {
      id: "enq-1",
      name: "Sai Kumar",
      email: "sai.distributor@gmail.com",
      phone: "9876543210",
      subject: "Distributorship Query for Nizamabad",
      message: "Hello, we are interested in registering as a dealer for UNS products in Nizamabad district. Please send catalog and wholesale pricing details.",
      status: "Unread",
      createdAt: "2026-06-12"
    }
  ]);

  const [localReviews, setLocalReviews] = useState<any[]>([]);

  // Aggregate all reviews across products for moderation list
  useEffect(() => {
    const allRev: any[] = [];
    products.forEach(p => {
      if (p.reviews) {
        p.reviews.forEach(r => {
          allRev.push({
            ...r,
            productName: p.name
          });
        });
      }
    });
    setLocalReviews(allRev);
    setStats(prev => ({ ...prev, catalogSize: products.length }));
  }, [products]);

  // Product CRUD modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formImage, setFormImage] = useState('');

  const openAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Home Cleaning Products');
    setFormPrice('100');
    setFormDiscountPrice('90');
    setFormStock('100');
    setFormShortDesc('Premium chemical formulation.');
    setFormImage('https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80');
    setShowProductModal(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price.toString());
    setFormDiscountPrice(prod.discountPrice.toString());
    setFormStock(prod.stock.toString());
    setFormShortDesc(prod.shortDescription);
    setFormImage(prod.images[0]);
    setShowProductModal(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingProduct) {
      // Update
      const updated: Product = {
        ...editingProduct,
        name: formName,
        slug,
        category: formCategory,
        price: Number(formPrice),
        discountPrice: Number(formDiscountPrice),
        stock: Number(formStock),
        shortDescription: formShortDesc,
        images: [formImage]
      };
      dispatch(updateProductLocally(updated));
    } else {
      // Create
      const created: Product = {
        id: `prod-${Math.random().toString(36).substring(2, 9)}`,
        name: formName,
        slug,
        category: formCategory,
        shortDescription: formShortDesc,
        fullDescription: `<p>UNS ${formName} is engineered with high concentration active surfactant molecules to clean thoroughly.</p>`,
        images: [formImage],
        price: Number(formPrice),
        discountPrice: Number(formDiscountPrice),
        stock: Number(formStock),
        rating: 5.0,
        specifications: { "Volume": "500ml", "Form": "Liquid" },
        benefits: ["Disinfects effectively", "Pleasant fragrance"],
        usageInstructions: ["Apply directly", "Scrub and rinse"],
        featured: false,
        seoTitle: `${formName} - UNS Products`,
        seoDescription: formShortDesc,
        createdAt: new Date().toISOString(),
        reviews: []
      };
      dispatch(addProductLocally(created));
    }
    setShowProductModal(false);
  };

  const handleProductDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProductLocally(id));
    }
  };

  // Order Actions
  const updateOrderStatus = (orderId: string, nextStatus: string) => {
    setLocalOrders(localOrders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  // Review Actions
  const approveReview = (revId: string) => {
    setLocalReviews(localReviews.map(r => r.id === revId ? { ...r, approved: true } : r));
  };

  const deleteReview = (revId: string) => {
    setLocalReviews(localReviews.filter(r => r.id !== revId));
  };

  // Enquiry Actions
  const markEnquiryRead = (enqId: string) => {
    setLocalEnquiries(localEnquiries.map(e => e.id === enqId ? { ...e, status: 'Read' } : e));
    setStats(prev => ({ ...prev, unreadEnquiries: Math.max(0, prev.unreadEnquiries - 1) }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* Sidebar Panel (Desktop) */}
      <aside className="w-full lg:w-64 bg-heading text-slate-350 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <ShieldAlert className="text-secondary" size={24} />
          <div>
            <span className="font-heading text-white font-bold text-base block leading-none">UNS Control</span>
            <span className="text-[10px] text-teal-400 font-bold uppercase mt-1 block">Administrator</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left py-2.5 px-4 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'overview' ? 'bg-primary text-white font-bold shadow' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 size={16} /> Dashboard Overview
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left py-2.5 px-4 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'products' ? 'bg-primary text-white font-bold shadow' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package size={16} /> Manage Products
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left py-2.5 px-4 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'orders' ? 'bg-primary text-white font-bold shadow' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingBag size={16} /> Manage Orders
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full text-left py-2.5 px-4 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'reviews' ? 'bg-primary text-white font-bold shadow' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users size={16} /> Review Moderation
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`w-full text-left py-2.5 px-4 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'enquiries' ? 'bg-primary text-white font-bold shadow' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquare size={16} /> Contact Inbox
            {stats.unreadEnquiries > 0 && (
              <span className="ml-auto w-2 h-2 rounded-full bg-accent" />
            )}
          </button>
        </nav>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-heading font-heading">Dashboard Analytics</h2>
              <p className="text-xs text-muted">Weekly performance coordinates overview.</p>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white p-5 rounded-xl border border-border shadow-soft flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Total Revenue</span>
                  <h3 className="font-heading text-xl font-bold text-primary mt-1">₹{stats.totalSales}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-primary flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-border shadow-soft flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Pending Orders</span>
                  <h3 className="font-heading text-xl font-bold text-primary mt-1">{stats.pendingOrders}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-border shadow-soft flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Catalog Products</span>
                  <h3 className="font-heading text-xl font-bold text-primary mt-1">{stats.catalogSize}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package size={20} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-border shadow-soft flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted">New Enquiries</span>
                  <h3 className="font-heading text-xl font-bold text-primary mt-1">{stats.unreadEnquiries}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
              </div>

            </div>

            {/* Custom SVG Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Sales Chart Mock (8 cols) */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-border shadow-soft">
                <h4 className="font-heading font-bold text-sm text-heading mb-6">Sales History (Mock Analytics)</h4>
                
                {/* SVG Graph representation */}
                <div className="aspect-[2/1] w-full flex items-end justify-between border-b border-l border-slate-200 pb-2 pl-2">
                  <div className="w-1/6 flex flex-col items-center gap-2">
                    <div className="w-8 bg-primary/20 rounded-t h-12 transition-all hover:bg-primary" />
                    <span className="text-[9px] font-bold text-muted uppercase">Jan</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2">
                    <div className="w-8 bg-primary/40 rounded-t h-20 transition-all hover:bg-primary" />
                    <span className="text-[9px] font-bold text-muted uppercase">Feb</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2">
                    <div className="w-8 bg-primary/30 rounded-t h-16 transition-all hover:bg-primary" />
                    <span className="text-[9px] font-bold text-muted uppercase">Mar</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2">
                    <div className="w-8 bg-primary/60 rounded-t h-28 transition-all hover:bg-primary" />
                    <span className="text-[9px] font-bold text-muted uppercase">Apr</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2">
                    <div className="w-8 bg-primary/80 rounded-t h-36 transition-all hover:bg-primary" />
                    <span className="text-[9px] font-bold text-muted uppercase">May</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2">
                    <div className="w-8 bg-primary rounded-t h-44 transition-all" />
                    <span className="text-[9px] font-bold text-primary uppercase">Jun</span>
                  </div>
                </div>
              </div>

              {/* Segment share (4 cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-border shadow-soft flex flex-col justify-between">
                <h4 className="font-heading font-bold text-sm text-heading mb-4">Volume Share</h4>
                
                <div className="flex-1 flex items-center justify-center p-4">
                  {/* SVG Pie Representation */}
                  <svg className="w-32 h-32" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0F766E" strokeWidth="3.5" strokeDasharray="65 35" strokeDashoffset="25" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#14B8A6" strokeWidth="3.5" strokeDasharray="20 80" strokeDashoffset="90" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="3.5" strokeDasharray="15 85" strokeDashoffset="110" />
                  </svg>
                </div>

                <div className="space-y-1.5 text-[10px] font-semibold text-muted">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary rounded" /> Home Care (65%)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-secondary rounded" /> Kitchen Care (20%)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-accent rounded" /> Laundry Care (15%)</div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: MANAGE PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-heading font-heading">Product Catalog</h2>
                <p className="text-xs text-muted">Total of {products.length} formulations registered.</p>
              </div>
              <button
                onClick={openAddProduct}
                className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {/* Catalog list table */}
            <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-heading text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-body">
                    {products.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-heading flex items-center gap-2">
                          <img src={prod.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                          {prod.name}
                        </td>
                        <td className="p-4">{prod.category}</td>
                        <td className="p-4">₹{prod.price.toFixed(2)}</td>
                        <td className="p-4">₹{prod.discountPrice.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`font-bold ${prod.stock < 120 ? 'text-red-500' : 'text-slate-650'}`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-1.5 text-muted hover:text-primary rounded-lg hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleProductDelete(prod.id)}
                            className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-heading font-heading">Sales & Orders</h2>
              <p className="text-xs text-muted">Customer checkout pipeline logs.</p>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-heading text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items Summary</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-body">
                    {localOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono font-bold text-heading">UNS-#{order.orderNumber}</td>
                        <td className="p-4">
                          <div className="font-semibold text-heading">{order.customerName}</div>
                          <div className="text-[10px] text-muted">{order.customerPhone}</div>
                        </td>
                        <td className="p-4 truncate max-w-xs">{order.items}</td>
                        <td className="p-4 font-semibold text-heading">₹{order.totalAmount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.status === 'Delivered' 
                              ? 'bg-green-55 bg-green-100 text-green-700' 
                              : order.status === 'Processing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          {order.status === 'Pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Processing')}
                              className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 py-1.5 px-2.5 rounded-lg font-bold"
                            >
                              Pack
                            </button>
                          )}
                          {order.status === 'Processing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Shipped')}
                              className="text-[10px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-1.5 px-2.5 rounded-lg font-bold flex items-center gap-1 inline-flex"
                            >
                              <Truck size={10} /> Ship
                            </button>
                          )}
                          {order.status === 'Shipped' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Delivered')}
                              className="text-[10px] bg-green-50 text-green-600 hover:bg-green-100 py-1.5 px-2.5 rounded-lg font-bold flex items-center gap-0.5 inline-flex"
                            >
                              <Check size={10} /> Deliver
                            </button>
                          )}
                          {order.status === 'Delivered' && (
                            <span className="text-[10px] text-muted font-bold">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEW MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-heading font-heading">Reviews Moderation</h2>
              <p className="text-xs text-muted">Moderation queue for user-submitted testimonials.</p>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-heading text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Review Content</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-body">
                    {localReviews.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted">No reviews submitted yet in system.</td>
                      </tr>
                    ) : (
                      localReviews.map(rev => (
                        <tr key={rev.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-semibold text-heading">{rev.productName}</td>
                          <td className="p-4 font-semibold">{rev.customerName}</td>
                          <td className="p-4 text-amber-400 font-bold">★ {rev.rating}</td>
                          <td className="p-4 truncate max-w-xs">{rev.comment}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              rev.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-750'
                            }`}>
                              {rev.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            {!rev.approved && (
                              <button
                                onClick={() => approveReview(rev.id)}
                                className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg"
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteReview(rev.id)}
                              className="p-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"
                              title="Delete / Reject"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-heading font-heading">Contact Inbox</h2>
              <p className="text-xs text-muted">Received B2B dealer distributorship queries and enquiries.</p>
            </div>

            <div className="space-y-4">
              {localEnquiries.map(enq => (
                <div 
                  key={enq.id}
                  className={`p-6 rounded-2xl border transition-all shadow-soft flex flex-col justify-between ${
                    enq.status === 'Unread' ? 'border-primary/30 bg-teal-50/10' : 'border-border bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">{enq.createdAt}</span>
                      <h4 className="font-heading font-bold text-sm text-heading mt-0.5">{enq.subject}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        enq.status === 'Unread' ? 'bg-primary text-white' : 'bg-slate-150 text-muted border border-border bg-slate-50'
                      }`}>
                        {enq.status}
                      </span>
                      {enq.status === 'Unread' && (
                        <button
                          onClick={() => markEnquiryRead(enq.id)}
                          className="text-[10px] text-primary hover:underline font-bold"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="py-4 text-xs text-slate-650 space-y-2 leading-relaxed">
                    <p>{enq.message}</p>
                    <div className="pt-2 text-[10px] text-muted flex flex-wrap gap-4">
                      <span><strong>Sender:</strong> {enq.name}</span>
                      <span><strong>Email:</strong> {enq.email}</span>
                      <span><strong>Phone:</strong> {enq.phone}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100 gap-2">
                    <a
                      href={`mailto:${enq.email}?subject=Reply:%20${encodeURIComponent(enq.subject)}`}
                      className="bg-primary hover:bg-primary-light text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm"
                    >
                      Email Reply
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?phone=91${enq.phone.replace(/[^0-9]/g, '')}&text=Hello%20${encodeURIComponent(enq.name)},%20this%20is%20UNS%20Home%20Cleaning%20Products%20replying%20to%20your%20dealership%20query...`}
                      target="_blank"
                      className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm inline-flex items-center gap-1"
                    >
                      <MessageSquare size={10} /> WhatsApp Reply
                    </a>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Product Add / Edit CRUD Modal Popup */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-border shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-zoomIn">
            <h3 className="font-heading font-bold text-lg text-heading mb-4">
              {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Cleaning Product"}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Category</label>
                  <select
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary font-semibold"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">MRP Price (₹)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Discount Price (₹)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Stock Inventory</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Short Description</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">Product Image URL (Cloudinary / Stock Link)</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="text-xs text-muted hover:text-heading font-semibold py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors"
                >
                  Save Product
                </button>
              </div>
            </form>

            <button 
              onClick={() => setShowProductModal(false)}
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
export default AdminDashboard;
