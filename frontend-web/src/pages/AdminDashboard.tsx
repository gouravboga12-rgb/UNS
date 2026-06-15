import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { 
  fetchProducts, 
  fetchCategories,
  addProductLocally, 
  updateProductLocally, 
  deleteProductLocally,
  addCategoryLocally,
  updateCategoryLocally,
  deleteCategoryLocally,
  updateReviewLocally,
  approveReviewLocally,
  deleteReviewLocally 
} from '../store/productsSlice';
import type { Product, Category } from '../store/productsSlice';
import { 
  BarChart3, 
  Package, 
  FolderHeart,
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
  Printer,
  Upload,
  Link2,
  Lock,
  Mail,
  Search,
  LogOut
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const generateId = () => Math.random().toString(36).substring(2, 9);

export const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  
  // Redux lists
  const products = useSelector((state: RootState) => state.products.items);
  const categories = useSelector((state: RootState) => state.products.categories);

  // States
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'orders' | 'reviews' | 'enquiries'>('overview');
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalSales: 45890,
    pendingOrders: 1,
    catalogSize: products.length,
    unreadEnquiries: 1
  });

  // DB entities
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [localEnquiries, setLocalEnquiries] = useState<any[]>([]);
  const [localReviews, setLocalReviews] = useState<any[]>([]);
  
  // Editing and form modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReviewEditModal, setShowReviewEditModal] = useState(false);
  const [showOrderEditModal, setShowOrderEditModal] = useState(false);

  // Active items for modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  // Category Form states
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('');
  const [uploadingCatImg, setUploadingCatImg] = useState(false);

  // Product Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formImage, setFormImage] = useState('');
  const [uploadingProdImg, setUploadingProdImg] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [formVariants, setFormVariants] = useState<{ name: string; price: string; discountPrice: string; stock: string }[]>([]);

  // Order Form states
  const [orderStatus, setOrderStatus] = useState('');
  const [orderTrackingId, setOrderTrackingId] = useState('');
  const [orderTrackingLink, setOrderTrackingLink] = useState('');
  const [orderStatusDesc, setOrderStatusDesc] = useState('');

  // Review Form states
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Search and Filter states for admin tabs
  const [catSearch, setCatSearch] = useState('');
  
  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('all');
  const [prodStockFilter, setProdStockFilter] = useState('all');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');

  const [enqSearch, setEnqSearch] = useState('');
  const [enqStatusFilter, setEnqStatusFilter] = useState('all');

  // Filtered Lists for rendering
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(catSearch.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(catSearch.toLowerCase()))
  );

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(prodSearch.toLowerCase());
    
    const matchesCategory = prodCatFilter === 'all' || p.category === prodCatFilter;
    
    let matchesStock = true;
    if (prodStockFilter === 'low') {
      matchesStock = p.stock > 0 && p.stock < 20;
    } else if (prodStockFilter === 'out') {
      matchesStock = p.stock === 0;
    } else if (prodStockFilter === 'ok') {
      matchesStock = p.stock >= 20;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const filteredOrders = localOrders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toString().includes(orderSearch) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch) ||
      o.shippingAddress.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.items && o.items.some((item: any) => item.name.toLowerCase().includes(orderSearch.toLowerCase())));

    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredReviews = localReviews.filter(r => {
    const productName = r.productName || '';
    const matchesSearch = 
      productName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      r.customerName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(reviewSearch.toLowerCase()));

    const matchesStatus = 
      reviewStatusFilter === 'all' || 
      (reviewStatusFilter === 'approved' && r.approved) || 
      (reviewStatusFilter === 'pending' && !r.approved);

    const matchesRating = 
      reviewRatingFilter === 'all' || 
      r.rating.toString() === reviewRatingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  const filteredEnquiries = localEnquiries.filter(e => {
    const matchesSearch = 
      e.name.toLowerCase().includes(enqSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(enqSearch.toLowerCase()) ||
      e.phone.includes(enqSearch) ||
      e.subject.toLowerCase().includes(enqSearch.toLowerCase()) ||
      e.message.toLowerCase().includes(enqSearch.toLowerCase());

    const matchesStatus = enqStatusFilter === 'all' || e.status === enqStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const u = localStorage.getItem('uns_current_user');
      if (u) {
        const user = JSON.parse(u);
        if (user.role === 'admin' && user.email === 'unshomecleaningproductspvtltd@gmail.com') {
          setIsAdmin(true);
          return;
        }
      }
      setIsAdmin(false);
    };
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => {
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  // Fetch all administrative data from backend or fallback to localStorage
  useEffect(() => {
    if (!isAdmin) return;

    const loadAdminData = async () => {
      // 1. Orders
      try {
        const res = await fetch(`${API_URL}/admin/orders`);
        if (res.ok) {
          const data = await res.json();
          setLocalOrders(data);
          localStorage.setItem('uns_local_orders', JSON.stringify(data));
        }
      } catch {
        const saved = localStorage.getItem('uns_local_orders');
        if (saved) setLocalOrders(JSON.parse(saved));
        else {
          const defaultOrders = [
            {
              id: "ord-1234",
              orderNumber: 1001,
              customerName: "Ganesh Reddy",
              customerPhone: "7396158011",
              customerEmail: "ganesh@example.com",
              shippingAddress: "Plot 42, H.No: 4-12/A, Siddipet, Telangana, 502103",
              totalAmount: 347.00,
              status: "Processing",
              items: [
                { productId: "prod-1", name: "Toilet Cleaner Liquid", quantity: 2, price: 99.00 },
                { productId: "prod-3", name: "Floor Cleaner Liquid", quantity: 1, price: 149.00 }
              ],
              createdAt: "2026-06-12T10:00:00Z"
            }
          ];
          setLocalOrders(defaultOrders);
          localStorage.setItem('uns_local_orders', JSON.stringify(defaultOrders));
        }
      }

      // 2. Reviews
      try {
        const res = await fetch(`${API_URL}/admin/reviews`);
        if (res.ok) {
          const data = await res.json();
          setLocalReviews(data);
          localStorage.setItem('uns_local_reviews', JSON.stringify(data));
        }
      } catch {
        // Aggregate reviews from Redux products state and append any localStorage reviews
        const allRev: any[] = [];
        products.forEach(p => {
          if (p.reviews) {
            p.reviews.forEach(r => {
              allRev.push({ ...r, productName: p.name });
            });
          }
        });
        const extraRaw = localStorage.getItem('uns_local_reviews');
        const extra = extraRaw ? JSON.parse(extraRaw) : [];
        
        // Merge and deduplicate
        const merged = [...extra];
        allRev.forEach(r => {
          if (!merged.some(m => m.id === r.id)) {
            merged.push(r);
          }
        });
        setLocalReviews(merged);
        localStorage.setItem('uns_local_reviews', JSON.stringify(merged));
      }

      // 3. Enquiries
      try {
        const res = await fetch(`${API_URL}/admin/enquiries`);
        if (res.ok) {
          const data = await res.json();
          setLocalEnquiries(data);
          localStorage.setItem('uns_local_enquiries', JSON.stringify(data));
        }
      } catch {
        const saved = localStorage.getItem('uns_local_enquiries');
        if (saved) setLocalEnquiries(JSON.parse(saved));
        else {
          const defaultEnq = [
            {
              id: "enq-1",
              name: "Sai Kumar",
              email: "sai.distributor@gmail.com",
              phone: "9876543210",
              subject: "Distributorship Query for Nizamabad",
              message: "Hello, we are interested in registering as a dealer for UNS products in Nizamabad district. Please send catalog and wholesale pricing details.",
              status: "Unread",
              createdAt: "2026-06-12T15:20:00Z"
            }
          ];
          setLocalEnquiries(defaultEnq);
          localStorage.setItem('uns_local_enquiries', JSON.stringify(defaultEnq));
        }
      }
    };

    loadAdminData();
    dispatch(fetchProducts() as any);
    dispatch(fetchCategories() as any);
  }, [isAdmin, dispatch]);

  // Compute analytics stats dynamically
  useEffect(() => {
    const totalSales = localOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, o) => acc + o.totalAmount, 0);
    const pending = localOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const unread = localEnquiries.filter(e => e.status === 'Unread').length;

    setStats({
      totalSales: Math.round(totalSales),
      pendingOrders: pending,
      catalogSize: products.length,
      unreadEnquiries: unread
    });
  }, [localOrders, localEnquiries, products]);

  // Handle Admin secure login submission
  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'unshomecleaningproductspvtltd@gmail.com' && adminPassword === '7396158011uns') {
      const adminUser = {
        name: 'UNS Admin',
        email: 'unshomecleaningproductspvtltd@gmail.com',
        phone: '7396158011',
        role: 'admin'
      };
      localStorage.setItem('uns_current_user', JSON.stringify(adminUser));
      setIsAdmin(true);
      window.dispatchEvent(new Event('authChange'));
    } else {
      alert('Invalid admin credentials. Please verify ID and Password.');
    }
  };

  // Handle Admin secure signout
  const handleAdminSignOut = () => {
    localStorage.removeItem('uns_current_user');
    setIsAdmin(false);
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/';
  };

  // Upload file to Cloudinary helper
  const handleImageUpload = async (file: File, type: 'product' | 'category') => {
    if (type === 'product') setUploadingProdImg(true);
    else setUploadingCatImg(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const result = await response.json();
        if (type === 'product') setFormImage(result.url);
        else setCatImg(result.url);
      } else {
        alert('Cloudinary upload failed. Using fallback URL.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Could not connect to media server. Please check connection.');
    } finally {
      if (type === 'product') setUploadingProdImg(false);
      else setUploadingCatImg(false);
    }
  };

  // Category CRUD Submission
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingCategory) {
      const updatedCategory: Category = {
        ...editingCategory,
        name: catName,
        slug,
        description: catDesc,
        imageUrl: catImg || 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80'
      };

      try {
        const response = await fetch(`${API_URL}/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCategory)
        });
        if (response.ok) {
          const data = await response.json();
          dispatch(updateCategoryLocally(data));
        } else {
          dispatch(updateCategoryLocally(updatedCategory));
        }
      } catch {
        dispatch(updateCategoryLocally(updatedCategory));
      }
      setShowCategoryModal(false);
      alert('Category updated successfully!');
    } else {
      const newCategory: Category = {
        id: `cat-${generateId()}`,
        name: catName,
        slug,
        description: catDesc,
        imageUrl: catImg || 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80'
      };

      try {
        const response = await fetch(`${API_URL}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCategory)
        });
        if (response.ok) {
          const data = await response.json();
          dispatch(addCategoryLocally(data));
        } else {
          dispatch(addCategoryLocally(newCategory));
        }
      } catch {
        dispatch(addCategoryLocally(newCategory));
      }
      setShowCategoryModal(false);
      alert('Category added successfully!');
    }

    setCatName('');
    setCatDesc('');
    setCatImg('');
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatImg('');
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatImg(cat.imageUrl || '');
    setShowCategoryModal(true);
  };

  const handleCategoryDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? Any products assigned to this category will not be deleted but they will lose their category classification.")) {
      try {
        const res = await fetch(`${API_URL}/categories/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          dispatch(deleteCategoryLocally(id));
        } else {
          dispatch(deleteCategoryLocally(id));
        }
      } catch {
        dispatch(deleteCategoryLocally(id));
      }
      alert('Category deleted successfully!');
    }
  };

  // Product CRUD Modal actions
  const openAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Home Cleaning Products');
    setFormPrice('120');
    setFormDiscountPrice('99');
    setFormStock('100');
    setFormShortDesc('Premium chemical formulation.');
    setFormImage('https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80');
    setHasVariants(false);
    setFormVariants([]);
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
    const dbVars = prod.specifications?.variants || [];
    if (Array.isArray(dbVars) && dbVars.length > 0) {
      setHasVariants(true);
      setFormVariants(dbVars.map((v: any) => ({
        name: v.name,
        price: v.price.toString(),
        discountPrice: v.discountPrice.toString(),
        stock: v.stock.toString()
      })));
    } else {
      setHasVariants(false);
      setFormVariants([]);
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    if (!formImage) {
      alert("Please upload a product image.");
      return;
    }

    let finalPrice = Number(formPrice);
    let finalDiscountPrice = Number(formDiscountPrice);
    let finalStock = Number(formStock);
    let finalSpecifications: Record<string, any> = editingProduct ? { ...editingProduct.specifications } : { "Volume": "500ml", "Form": "Liquid" };

    if (hasVariants) {
      if (formVariants.length === 0) {
        alert("Please add at least one variant option or disable variants.");
        return;
      }
      const invalid = formVariants.some(v => !v.name.trim() || !v.price || !v.discountPrice || !v.stock);
      if (invalid) {
        alert("Please fill all fields for all added variants.");
        return;
      }

      // Populate specs with variants
      const mappedVars = formVariants.map(v => ({
        name: v.name,
        price: Number(v.price),
        discountPrice: Number(v.discountPrice),
        stock: Number(v.stock)
      }));

      finalSpecifications = {
        ...finalSpecifications,
        variants: mappedVars
      };

      // Auto-set top level values to first variant details
      finalPrice = mappedVars[0].price;
      finalDiscountPrice = mappedVars[0].discountPrice;
      finalStock = mappedVars.reduce((sum, v) => sum + v.stock, 0);
    } else {
      // Remove variants if unchecked
      if (finalSpecifications.variants) {
        delete finalSpecifications.variants;
      }
      if (!formPrice) {
        alert("Please specify product MRP price.");
        return;
      }
    }

    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingProduct) {
      // Update
      const updated: Product = {
        ...editingProduct,
        name: formName,
        slug,
        category: formCategory,
        price: finalPrice,
        discountPrice: finalDiscountPrice,
        stock: finalStock,
        shortDescription: formShortDesc,
        images: [formImage],
        specifications: finalSpecifications
      };

      try {
        const res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          const data = await res.json();
          dispatch(updateProductLocally(data));
        } else {
          dispatch(updateProductLocally(updated));
        }
      } catch {
        dispatch(updateProductLocally(updated));
      }
    } else {
      // Create
      const created: Product = {
        id: `prod-${generateId()}`,
        name: formName,
        slug,
        category: formCategory,
        shortDescription: formShortDesc,
        fullDescription: `<p>UNS ${formName} is engineered with high concentration active surfactant molecules to clean thoroughly.</p>`,
        images: [formImage],
        price: finalPrice,
        discountPrice: finalDiscountPrice,
        stock: finalStock,
        rating: 5.0,
        specifications: finalSpecifications,
        benefits: ["Disinfects effectively", "Pleasant fragrance"],
        usageInstructions: ["Apply directly", "Scrub and rinse"],
        featured: false,
        seoTitle: `${formName} - UNS Products`,
        seoDescription: formShortDesc,
        createdAt: new Date().toISOString(),
        reviews: []
      };

      try {
        const res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(created)
        });
        if (res.ok) {
          const data = await res.json();
          dispatch(addProductLocally(data));
        } else {
          dispatch(addProductLocally(created));
        }
      } catch {
        dispatch(addProductLocally(created));
      }
    }
    setShowProductModal(false);
  };

  const handleProductDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          dispatch(deleteProductLocally(id));
        } else {
          dispatch(deleteProductLocally(id));
        }
      } catch {
        dispatch(deleteProductLocally(id));
      }
    }
  };

  // Order Actions
  const openOrderEdit = (order: any) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setOrderTrackingId(order.trackingId || '');
    setOrderTrackingLink(order.trackingLink || '');
    setOrderStatusDesc('');
    setShowOrderEditModal(true);
  };

  const handleOrderUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const payload = {
      status: orderStatus,
      trackingId: orderTrackingId,
      trackingLink: orderTrackingLink,
      description: orderStatusDesc
    };

    try {
      const response = await fetch(`${API_URL}/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        const updatedList = localOrders.map(o => o.id === selectedOrder.id ? updatedOrder : o);
        setLocalOrders(updatedList);
        localStorage.setItem('uns_local_orders', JSON.stringify(updatedList));
      } else {
        throw new Error();
      }
    } catch {
      // Local fallback
      const timeline = selectedOrder.trackingTimeline || [];
      if (orderStatus && orderStatus !== selectedOrder.status) {
        timeline.push({
          status: orderStatus,
          time: new Date().toISOString(),
          description: orderStatusDesc || `Order status updated to ${orderStatus}`
        });
      }
      const updatedOrder = {
        ...selectedOrder,
        status: orderStatus,
        trackingId: orderTrackingId,
        trackingLink: orderTrackingLink,
        trackingTimeline: timeline
      };
      const updatedList = localOrders.map(o => o.id === selectedOrder.id ? updatedOrder : o);
      setLocalOrders(updatedList);
      localStorage.setItem('uns_local_orders', JSON.stringify(updatedList));
    }

    setShowOrderEditModal(false);
    alert('Order details updated successfully!');
  };

  // Review Actions
  const handleApproveReview = async (rev: any) => {
    try {
      const res = await fetch(`${API_URL}/admin/reviews/${rev.id}/approve`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updatedList = localReviews.map(r => r.id === rev.id ? { ...r, approved: true } : r);
        setLocalReviews(updatedList);
        localStorage.setItem('uns_local_reviews', JSON.stringify(updatedList));
        dispatch(approveReviewLocally({ productId: rev.productId, reviewId: rev.id }));
      }
    } catch {
      // Fallback
      const updatedList = localReviews.map(r => r.id === rev.id ? { ...r, approved: true } : r);
      setLocalReviews(updatedList);
      localStorage.setItem('uns_local_reviews', JSON.stringify(updatedList));
      dispatch(approveReviewLocally({ productId: rev.productId, reviewId: rev.id }));
    }
  };

  const openReviewEdit = (rev: any) => {
    setSelectedReview(rev);
    setReviewComment(rev.comment);
    setReviewRating(rev.rating);
    setShowReviewEditModal(true);
  };

  const handleReviewEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    const payload = {
      comment: reviewComment,
      rating: reviewRating
    };

    try {
      const res = await fetch(`${API_URL}/admin/reviews/${selectedReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const updatedList = localReviews.map(r => r.id === selectedReview.id ? data : r);
        setLocalReviews(updatedList);
        localStorage.setItem('uns_local_reviews', JSON.stringify(updatedList));
        dispatch(updateReviewLocally({ 
          productId: selectedReview.productId, 
          reviewId: selectedReview.id, 
          comment: reviewComment, 
          rating: reviewRating 
        }));
      }
    } catch {
      // Fallback
      const updated = { ...selectedReview, comment: reviewComment, rating: reviewRating };
      const updatedList = localReviews.map(r => r.id === selectedReview.id ? updated : r);
      setLocalReviews(updatedList);
      localStorage.setItem('uns_local_reviews', JSON.stringify(updatedList));
      dispatch(updateReviewLocally({ 
        productId: selectedReview.productId, 
        reviewId: selectedReview.id, 
        comment: reviewComment, 
        rating: reviewRating 
      }));
    }

    setShowReviewEditModal(false);
    alert('Review edited successfully!');
  };

  const handleDeleteReview = async (rev: any) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        const res = await fetch(`${API_URL}/admin/reviews/${rev.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          const updatedList = localReviews.filter(r => r.id !== rev.id);
          setLocalReviews(updatedList);
          localStorage.setItem('uns_local_reviews', JSON.stringify(updatedList));
          dispatch(deleteReviewLocally({ productId: rev.productId, reviewId: rev.id }));
        }
      } catch {
        const updatedList = localReviews.filter(r => r.id !== rev.id);
        setLocalReviews(updatedList);
        localStorage.setItem('uns_local_reviews', JSON.stringify(updatedList));
        dispatch(deleteReviewLocally({ productId: rev.productId, reviewId: rev.id }));
      }
    }
  };

  // Enquiry Actions
  const handleMarkEnquiryRead = async (enqId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/enquiries/${enqId}/read`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updatedList = localEnquiries.map(e => e.id === enqId ? { ...e, status: 'Read' } : e);
        setLocalEnquiries(updatedList);
        localStorage.setItem('uns_local_enquiries', JSON.stringify(updatedList));
      }
    } catch {
      const updatedList = localEnquiries.map(e => e.id === enqId ? { ...e, status: 'Read' } : e);
      setLocalEnquiries(updatedList);
      localStorage.setItem('uns_local_enquiries', JSON.stringify(updatedList));
    }
  };

  // Render Admin Login Portal if not logged in
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        {/* Decorative background gradients */}
        <div className="absolute top-10 left-10 w-[20rem] h-[20rem] rounded-full bg-teal-800/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[20rem] h-[20rem] rounded-full bg-emerald-800/10 blur-3xl" />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative z-10" data-aos="zoom-in">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
              <ShieldAlert className="text-primary" size={24} />
            </div>
            <h2 className="text-2xl font-black font-heading text-white tracking-tight">UNS Administration</h2>
            <p className="text-xs text-slate-400 mt-2">Enter credentials to open the administrative panel dashboard.</p>
          </div>

          <form onSubmit={handleAdminSignIn} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@unshomecleaningproducts.com"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-xl text-xs transition-all tracking-wide shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-99"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/60 text-[10px] text-center text-slate-500">
            <span className="font-bold text-slate-400">UNS Cleaning Products PVT LTD</span><br />
            Security Audit Active. Authorized Personnel Only.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-heading text-slate-350 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <ShieldAlert className="text-secondary animate-pulse" size={24} />
          <div>
            <span className="font-heading text-white font-bold text-base block leading-none">UNS Control</span>
            <span className="text-[10px] text-teal-400 font-bold uppercase mt-1.5 block">Administrator</span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1.5 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left py-2.5 px-4 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'overview' ? 'bg-primary text-white font-bold shadow' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 size={16} /> Dashboard Overview
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left py-2.5 px-4 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'categories' ? 'bg-primary text-white font-bold shadow' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderHeart size={16} /> Manage Categories
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

        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <div className="text-[10px] text-slate-500 truncate">
            Logged in: <span className="text-slate-400 block font-semibold">UNS Admin</span>
          </div>
          <button
            onClick={handleAdminSignOut}
            className="w-full bg-red-600/20 hover:bg-red-600/35 border border-red-500/25 hover:border-red-500/40 text-red-400 hover:text-red-300 font-bold py-2 px-3 rounded-lg text-[10.5px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={12} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Main Administrative Container */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-full">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-heading font-heading">Dashboard Analytics</h2>
              <p className="text-xs text-muted">Performance metrics gathered from Supabase records.</p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-xl border border-border shadow-soft flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Total Sales</span>
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
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Catalog Size</span>
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
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-border shadow-soft">
                <h4 className="font-heading font-bold text-sm text-heading mb-6">Sales History (₹)</h4>
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

              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-border shadow-soft flex flex-col justify-between">
                <h4 className="font-heading font-bold text-sm text-heading mb-4">Volume Share</h4>
                <div className="flex-grow flex items-center justify-center p-4">
                  <svg className="w-32 h-32" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0F766E" strokeWidth="3.5" strokeDasharray="65 35" strokeDashoffset="25" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#14B8A6" strokeWidth="3.5" strokeDasharray="20 80" strokeDashoffset="90" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="3.5" strokeDasharray="15 85" strokeDashoffset="110" />
                  </svg>
                </div>
                <div className="space-y-1.5 text-[10px] font-semibold text-muted mt-4">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary rounded" /> Home Care (65%)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-secondary rounded" /> Kitchen Care (20%)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-accent rounded" /> Laundry Care (15%)</div>
                </div>
              </div>
            </div>

            {/* 3. Live Page Previews Grid */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-soft">
              <div className="mb-4">
                <h4 className="font-heading font-bold text-sm text-heading">Website Page Live Previews & Navigation</h4>
                <p className="text-[11px] text-muted">Preview customer-facing pages directly to verify client layout, reviews, variants, or order tracking views.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Home Page */}
                <div className="border border-border p-4 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between space-y-3 bg-slate-50/30">
                  <div>
                    <h5 className="font-bold text-xs text-heading">Home Page</h5>
                    <span className="text-[10px] font-mono text-primary bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">/</span>
                    <p className="text-[10px] text-muted mt-2">Active tickers, hero sliders, categories browse, and FAQ sections.</p>
                  </div>
                  <a href="/" target="_blank" rel="noreferrer" className="w-full py-1.5 px-3 bg-primary hover:bg-primary-light text-white text-[10.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                    Open Preview ↗
                  </a>
                </div>

                {/* Categories Browse */}
                <div className="border border-border p-4 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between space-y-3 bg-slate-50/30">
                  <div>
                    <h5 className="font-bold text-xs text-heading">Categories Directory</h5>
                    <span className="text-[10px] font-mono text-primary bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">/categories</span>
                    <p className="text-[10px] text-muted mt-2">Customer catalog directory segmenting products by utility groups.</p>
                  </div>
                  <a href="/categories" target="_blank" rel="noreferrer" className="w-full py-1.5 px-3 bg-primary hover:bg-primary-light text-white text-[10.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                    Open Preview ↗
                  </a>
                </div>

                {/* Catalog View */}
                <div className="border border-border p-4 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between space-y-3 bg-slate-50/30">
                  <div>
                    <h5 className="font-bold text-xs text-heading">Product Catalog</h5>
                    <span className="text-[10px] font-mono text-primary bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">/products</span>
                    <p className="text-[10px] text-muted mt-2">Browse lists with price sorting, search queries, and variant cards.</p>
                  </div>
                  <a href="/products" target="_blank" rel="noreferrer" className="w-full py-1.5 px-3 bg-primary hover:bg-primary-light text-white text-[10.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                    Open Preview ↗
                  </a>
                </div>

                {/* Shopping Cart */}
                <div className="border border-border p-4 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between space-y-3 bg-slate-50/30">
                  <div>
                    <h5 className="font-bold text-xs text-heading">Shopping Cart</h5>
                    <span className="text-[10px] font-mono text-primary bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">/cart</span>
                    <p className="text-[10px] text-muted mt-2">Direct WhatsApp checkout forms and delivery details builder.</p>
                  </div>
                  <a href="/cart" target="_blank" rel="noreferrer" className="w-full py-1.5 px-3 bg-primary hover:bg-primary-light text-white text-[10.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                    Open Preview ↗
                  </a>
                </div>

                {/* Track Order */}
                <div className="border border-border p-4 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between space-y-3 bg-slate-50/30">
                  <div>
                    <h5 className="font-bold text-xs text-heading">Track Live Order</h5>
                    <span className="text-[10px] font-mono text-primary bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">/track-order</span>
                    <p className="text-[10px] text-muted mt-2">Client tracking status log, courier link, and downloadable invoices.</p>
                  </div>
                  <a href="/track-order" target="_blank" rel="noreferrer" className="w-full py-1.5 px-3 bg-primary hover:bg-primary-light text-white text-[10.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                    Open Preview ↗
                  </a>
                </div>

                {/* About & Insights */}
                <div className="border border-border p-4 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between space-y-3 bg-slate-50/30">
                  <div>
                    <h5 className="font-bold text-xs text-heading">About & Guides</h5>
                    <span className="text-[10px] font-mono text-primary bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">/about</span>
                    <p className="text-[10px] text-muted mt-2">Factory blended history, certification reviews, and user guides.</p>
                  </div>
                  <a href="/about" target="_blank" rel="noreferrer" className="w-full py-1.5 px-3 bg-primary hover:bg-primary-light text-white text-[10.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                    Open Preview ↗
                  </a>
                </div>

                {/* Contact Enquiries */}
                <div className="border border-border p-4 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between space-y-3 bg-slate-50/30">
                  <div>
                    <h5 className="font-bold text-xs text-heading">Contact & Inquiries</h5>
                    <span className="text-[10px] font-mono text-primary bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">/contact</span>
                    <p className="text-[10px] text-muted mt-2">Google Map links, phone lines, and dealership request inbox.</p>
                  </div>
                  <a href="/contact" target="_blank" rel="noreferrer" className="w-full py-1.5 px-3 bg-primary hover:bg-primary-light text-white text-[10.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                    Open Preview ↗
                  </a>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-heading font-heading">Product Categories</h2>
                <p className="text-xs text-muted">Currently {categories.length} segments registered.</p>
              </div>
              <button
                onClick={openAddCategory}
                className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1"
              >
                <Plus size={14} /> Add Category
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-border shadow-soft">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-heading placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={14} />
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-heading text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4 w-40">Thumbnail</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-body">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted italic">No categories found matching the search.</td>
                      </tr>
                    ) : (
                      filteredCategories.map(cat => (
                        <tr key={cat.id} className="hover:bg-slate-50/50">
                          <td className="p-4">
                            <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 rounded object-cover border border-border bg-slate-50" />
                          </td>
                          <td className="p-4 font-bold text-heading">{cat.name}</td>
                          <td className="p-4 font-mono">{cat.slug}</td>
                          <td className="p-4 max-w-sm truncate text-slate-500">{cat.description}</td>
                          <td className="p-4 text-right space-x-1">
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="p-1.5 text-muted hover:text-primary rounded hover:bg-slate-100"
                              title="Edit Category"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleCategoryDelete(cat.id)}
                              className="p-1.5 text-muted hover:text-red-600 rounded hover:bg-red-50"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
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

        {/* TAB 3: MANAGE PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-heading font-heading">Product Catalogue</h2>
                <p className="text-xs text-muted">Currently {products.length} cleaning formulations registered.</p>
              </div>
              <button
                onClick={openAddProduct}
                className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-border shadow-soft">
              <div className="relative w-full md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-heading placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={14} />
                </span>
              </div>
              <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Category:</span>
                  <select
                    className="bg-slate-50 border border-border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary font-semibold text-heading"
                    value={prodCatFilter}
                    onChange={(e) => setProdCatFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Stock:</span>
                  <select
                    className="bg-slate-50 border border-border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary font-semibold text-heading"
                    value={prodStockFilter}
                    onChange={(e) => setProdStockFilter(e.target.value)}
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="ok">Available (&gt;= 20)</option>
                    <option value="low">Low Stock (&lt; 20)</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-heading text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">MRP Price</th>
                      <th className="p-4 text-right">Discount Price</th>
                      <th className="p-4 text-center">Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-body">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted italic">No products found matching the filters.</td>
                      </tr>
                    ) : filteredProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-heading flex items-center gap-2.5">
                          <img src={prod.images[0]} alt="" className="w-8 h-8 rounded object-cover border border-border bg-slate-50" />
                          {prod.name}
                        </td>
                        <td className="p-4">{prod.category}</td>
                        <td className="p-4 text-right font-semibold">₹{prod.price.toFixed(2)}</td>
                        <td className="p-4 text-right font-semibold text-primary">₹{prod.discountPrice.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prod.stock < 20 ? 'bg-red-50 text-red-655' : 'bg-slate-100 text-slate-650'}`}>
                            {prod.stock} Units
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-1.5 text-muted hover:text-primary rounded hover:bg-slate-100"
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleProductDelete(prod.id)}
                            className="p-1.5 text-muted hover:text-red-600 rounded hover:bg-red-50"
                            title="Delete Product"
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

        {/* TAB 4: MANAGE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-heading font-heading">Sales & Orders</h2>
              <p className="text-xs text-muted">Modify status, tracking parameters, or access printable invoices.</p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-border shadow-soft">
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Search orders (No, Customer, Phone, address, items)..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-heading placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={14} />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Status:</span>
                <select
                  className="bg-slate-50 border border-border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary font-semibold text-heading"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-heading text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Order Number</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4 text-right">Items Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Courier Details</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-body">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted italic">No orders found matching the filters.</td>
                      </tr>
                    ) : filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono font-bold text-heading">UNS-#{order.orderNumber}</td>
                        <td className="p-4">
                          <div className="font-semibold text-heading">{order.customerName}</div>
                          <div className="text-[10px] text-muted">{order.customerPhone}</div>
                        </td>
                        <td className="p-4 text-right font-bold text-heading">₹{order.totalAmount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.status === 'Delivered' 
                              ? 'bg-green-100 text-green-700' 
                              : order.status === 'Processing'
                              ? 'bg-blue-100 text-blue-700'
                              : order.status === 'Shipped'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 space-y-0.5">
                          {order.trackingId ? (
                            <>
                              <div className="font-semibold">{order.trackingId}</div>
                              {order.trackingLink && (
                                <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                  <Link2 size={8} /> Track Shipment
                                </a>
                              )}
                            </>
                          ) : (
                            <span className="text-muted text-[10px] font-semibold italic">Not Shipped Yet</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openOrderEdit(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-heading text-[10px] font-bold py-1.5 px-2.5 rounded-lg border border-border"
                          >
                            Update Details
                          </button>
                          <button
                            onClick={() => { setSelectedOrder(order); setShowInvoiceModal(true); }}
                            className="bg-primary hover:bg-primary-light text-white text-[10px] font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-0.5 inline-flex"
                          >
                            <Printer size={10} /> Invoice
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

        {/* TAB 5: REVIEW MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-heading font-heading">Reviews & Comments</h2>
              <p className="text-xs text-muted">Approve, edit review rating/content, or delete inappropriate reviews.</p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-border shadow-soft">
              <div className="relative w-full md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search reviews (Product, Customer, comment)..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-heading placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={14} />
                </span>
              </div>
              <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Status:</span>
                  <select
                    className="bg-slate-50 border border-border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary font-semibold text-heading"
                    value={reviewStatusFilter}
                    onChange={(e) => setReviewStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Rating:</span>
                  <select
                    className="bg-slate-50 border border-border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary font-semibold text-heading"
                    value={reviewRatingFilter}
                    onChange={(e) => setReviewRatingFilter(e.target.value)}
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-heading text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4 text-center">Stars</th>
                      <th className="p-4">Comment</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-body">
                    {filteredReviews.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted italic">No customer reviews found matching the filters.</td>
                      </tr>
                    ) : (
                      filteredReviews.map(rev => (
                        <tr key={rev.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-semibold text-heading">{rev.productName || 'Cleaning Product'}</td>
                          <td className="p-4 font-semibold">{rev.customerName}</td>
                          <td className="p-4 text-amber-500 font-bold text-center">★ {rev.rating}</td>
                          <td className="p-4 max-w-xs truncate text-slate-650">{rev.comment}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              rev.approved ? 'bg-green-105 text-green-700 bg-green-50' : 'bg-yellow-105 bg-yellow-50 text-yellow-750'
                            }`}>
                              {rev.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1 whitespace-nowrap">
                            {!rev.approved && (
                              <button
                                onClick={() => handleApproveReview(rev)}
                                className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded"
                                title="Approve Review"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => openReviewEdit(rev)}
                              className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                              title="Edit Review Content"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev)}
                              className="p-1 bg-red-50 text-red-500 hover:bg-red-100 rounded"
                              title="Delete Review"
                            >
                              <Trash2 size={14} />
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

        {/* TAB 6: CONTACT INBOX */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-heading font-heading">Contact Inbox</h2>
              <p className="text-xs text-muted">Receive and follow up on distributorship queries and enquiries.</p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-border shadow-soft">
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Search enquiries (Name, Email, Phone, Subject, Message)..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-heading placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                  value={enqSearch}
                  onChange={(e) => setEnqSearch(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={14} />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Status:</span>
                <select
                  className="bg-slate-50 border border-border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary font-semibold text-heading"
                  value={enqStatusFilter}
                  onChange={(e) => setEnqStatusFilter(e.target.value)}
                >
                  <option value="all">All Enquiries</option>
                  <option value="Read">Read</option>
                  <option value="Unread">Unread</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredEnquiries.length === 0 ? (
                <div className="p-8 text-center text-muted italic bg-white rounded-2xl border border-border shadow-soft">
                  No enquiries found matching the filters.
                </div>
              ) : filteredEnquiries.map(enq => (
                <div 
                  key={enq.id}
                  className={`p-6 rounded-2xl border transition-all shadow-soft flex flex-col justify-between ${
                    enq.status === 'Unread' ? 'border-primary/30 bg-teal-50/10' : 'border-border bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">
                        {new Date(enq.createdAt).toLocaleString()}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-heading mt-0.5">{enq.subject}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        enq.status === 'Unread' ? 'bg-primary text-white' : 'bg-slate-100 text-muted border border-border bg-slate-50'
                      }`}>
                        {enq.status}
                      </span>
                      {enq.status === 'Unread' && (
                        <button
                          onClick={() => handleMarkEnquiryRead(enq.id)}
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
                      href={`https://api.whatsapp.com/send?phone=91${enq.phone.replace(/[^0-9]/g, '')}&text=Hello%20${encodeURIComponent(enq.name)},%20this%20is%20UNS%20Home%20Cleaning%20Products...`}
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

      {/* MODAL 1: ADD CATEGORY */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-border shadow-2xl p-6 relative animate-zoomIn">
            <h3 className="font-heading font-bold text-lg text-heading mb-4">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Add Product Category"}
            </h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toilet Care, Floor Cleaners"
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain segment scope..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary resize-none"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Category Cover Image</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    required
                    placeholder="URL or Upload Image File..."
                    className="flex-grow bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                    value={catImg}
                    onChange={(e) => setCatImg(e.target.value)}
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg p-2.5 cursor-pointer flex-shrink-0 relative">
                    <Upload size={14} className="text-slate-650" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'category')} 
                    />
                  </label>
                </div>
                {uploadingCatImg && <span className="text-[10px] text-primary font-semibold mt-1 block">Uploading to Cloudinary...</span>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="text-xs text-muted hover:text-heading font-semibold py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-lg"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-border shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-zoomIn">
            <h3 className="font-heading font-bold text-lg text-heading mb-4">
              {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Cleaning Product"}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary font-semibold"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-heading">Enable Product Variants (Multiple Sizes/Prices)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary animate-all"></div>
                  </label>
                </div>

                {hasVariants ? (
                  <div className="space-y-3">
                    <div className="text-[10px] text-muted font-semibold">Define different quantities/weights (e.g. 250ml, 500ml, 150g) and their specific prices/stock.</div>
                    
                    {formVariants.map((v, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-border">
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Size (e.g. 250ml)"
                            required
                            className="w-full bg-slate-50 border border-border rounded-md py-1.5 px-2 text-xs focus:outline-none focus:border-primary font-semibold"
                            value={v.name}
                            onChange={(e) => {
                              const updated = [...formVariants];
                              updated[index].name = e.target.value;
                              setFormVariants(updated);
                            }}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            placeholder="MRP (₹)"
                            required
                            className="w-full bg-slate-50 border border-border rounded-md py-1.5 px-2 text-xs focus:outline-none focus:border-primary"
                            value={v.price}
                            onChange={(e) => {
                              const updated = [...formVariants];
                              updated[index].price = e.target.value;
                              setFormVariants(updated);
                            }}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            placeholder="Discount (₹)"
                            required
                            className="w-full bg-slate-50 border border-border rounded-md py-1.5 px-2 text-xs focus:outline-none focus:border-primary"
                            value={v.discountPrice}
                            onChange={(e) => {
                              const updated = [...formVariants];
                              updated[index].discountPrice = e.target.value;
                              setFormVariants(updated);
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            placeholder="Stock"
                            required
                            className="w-full bg-slate-50 border border-border rounded-md py-1.5 px-2 text-xs focus:outline-none focus:border-primary"
                            value={v.stock}
                            onChange={(e) => {
                              const updated = [...formVariants];
                              updated[index].stock = e.target.value;
                              setFormVariants(updated);
                            }}
                          />
                        </div>
                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setFormVariants(formVariants.filter((_, i) => i !== index));
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove Variant"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setFormVariants([...formVariants, { name: '', price: '', discountPrice: '', stock: '' }])}
                      className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-heading text-[10px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Plus size={12} /> Add Variant Option
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">MRP Price (₹)</label>
                      <input
                        type="number"
                        required={!hasVariants}
                        className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Discount Price (₹)</label>
                      <input
                        type="number"
                        required={!hasVariants}
                        className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                        value={formDiscountPrice}
                        onChange={(e) => setFormDiscountPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Stock Inventory</label>
                      <input
                        type="number"
                        required={!hasVariants}
                        className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Short Description</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Product Image</label>
                {formImage ? (
                  <div className="relative rounded-xl border border-border overflow-hidden bg-slate-50 aspect-video flex items-center justify-center group">
                    <img src={formImage} alt="Preview" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="bg-white hover:bg-slate-100 text-heading text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm">
                        Change Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'product')} 
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-primary rounded-2xl p-6 cursor-pointer flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-50 transition-all text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Upload size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-heading block">Click to upload product image</span>
                      <span className="text-[10px] text-muted block mt-0.5">Supports PNG, JPG, JPEG, WEBP</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'product')} 
                    />
                  </label>
                )}
                {uploadingProdImg && (
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-primary font-semibold">
                    <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Uploading to Cloudinary...
                  </div>
                )}
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
          </div>
        </div>
      )}

      {/* MODAL 3: UPDATE ORDER STATUS / TRACKING */}
      {showOrderEditModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-border shadow-2xl p-6 relative animate-zoomIn">
            <h3 className="font-heading font-bold text-lg text-heading mb-4">
              Update Order Details: UNS-#{selectedOrder.orderNumber}
            </h3>

            <form onSubmit={handleOrderUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Order Status</label>
                <select
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary font-semibold text-heading"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Tracking Number (AWB)</label>
                <input
                  type="text"
                  placeholder="e.g. AWB987654321"
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary font-mono"
                  value={orderTrackingId}
                  onChange={(e) => setOrderTrackingId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Tracking URL Link</label>
                <input
                  type="text"
                  placeholder="e.g. https://courier.clickpost.in/track?awb=..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                  value={orderTrackingLink}
                  onChange={(e) => setOrderTrackingLink(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Timeline Update Description</label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched from Hyderabad hub."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                  value={orderStatusDesc}
                  onChange={(e) => setOrderStatusDesc(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrderEditModal(false)}
                  className="text-xs text-muted hover:text-heading font-semibold py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT REVIEW */}
      {showReviewEditModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-border shadow-2xl p-6 relative animate-zoomIn">
            <h3 className="font-heading font-bold text-lg text-heading mb-4">
              Edit Review: {selectedReview.customerName}
            </h3>

            <form onSubmit={handleReviewEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Rating Score</label>
                <div className="flex gap-1.5 mt-1">
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
                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Review Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write updated comment content..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary resize-none"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewEditModal(false)}
                  className="text-xs text-muted hover:text-heading font-semibold py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-5 rounded-lg"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: PRINTABLE TAX INVOICE */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0 print:block">
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
            className="bg-white rounded-2xl max-w-2xl w-full border border-border shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto print:max-h-full print:border-none print:shadow-none print:p-0 animate-zoomIn"
          >
            <button 
              onClick={() => setShowInvoiceModal(false)}
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
                <p className="text-[10px] text-muted mt-1">Invoice No: <strong className="text-heading font-bold">INV-{selectedOrder.orderNumber}</strong></p>
                <p className="text-[10px] text-muted">Order ID: <strong className="font-mono text-heading font-bold">{selectedOrder.id}</strong></p>
                <p className="text-[10px] text-muted">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Billing / Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-xs leading-relaxed">
              <div>
                <h4 className="font-bold text-[10px] uppercase text-muted tracking-wider mb-1">Billing Address:</h4>
                <p className="font-bold text-heading">{selectedOrder.customerName}</p>
                <p>Phone: {selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && <p>Email: {selectedOrder.customerEmail}</p>}
              </div>
              <div>
                <h4 className="font-bold text-[10px] uppercase text-muted tracking-wider mb-1">Shipping Destination:</h4>
                <p className="text-slate-655">{selectedOrder.shippingAddress}</p>
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
                  {selectedOrder.items && selectedOrder.items.map((item: any, idx: number) => (
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
                  <span>₹{(selectedOrder.totalAmount - (selectedOrder.totalAmount > 500 ? 0 : 50)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Shipping Charges</span>
                  <span>{selectedOrder.totalAmount > 500 ? "FREE" : "₹50.00"}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-heading border-t border-slate-100 pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary font-black text-base">₹{selectedOrder.totalAmount.toFixed(2)}</span>
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
                onClick={() => setShowInvoiceModal(false)}
                className="text-xs text-muted hover:text-heading font-semibold py-2 px-4 border border-border rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminDashboard;
