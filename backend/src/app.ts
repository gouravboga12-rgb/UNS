import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { 
  mockProducts, 
  mockCategories, 
  mockBlogs, 
  mockOrders, 
  mockEnquiries,
  Product,
  Category,
  Blog,
  Order,
  Enquiry,
  Review
} from './mockData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/products', express.static(path.join(__dirname, '../public/products')));
app.use('/banners', express.static(path.join(__dirname, '../public/banners')));

// Local mutable state
let products: Product[] = [...mockProducts];
let categories: Category[] = [...mockCategories];
let blogs: Blog[] = [...mockBlogs];
let orders: Order[] = [...mockOrders];
let enquiries: Enquiry[] = [...mockEnquiries];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// -------------------------------------------------------------
// Category API
// -------------------------------------------------------------
app.get('/api/categories', (req: Request, res: Response) => {
  res.json(categories);
});

app.post('/api/categories', (req: Request, res: Response) => {
  const { name, description, imageUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newCategory: Category = {
    id: `cat-${generateId()}`,
    name,
    slug,
    description: description || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80'
  };
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// -------------------------------------------------------------
// Product API
// -------------------------------------------------------------
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, featured, sort } = req.query;
  
  let filtered = [...products];

  // Filter by category slug
  if (category) {
    const categorySlugStr = (category as string).replace(/_/g, '-');
    const catObj = categories.find(c => c.slug === categorySlugStr);
    if (catObj) {
      filtered = filtered.filter(p => p.category === catObj.name);
    }
  }

  // Filter by search term
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.shortDescription.toLowerCase().includes(q)
    );
  }

  // Filter featured
  if (featured === 'true') {
    filtered = filtered.filter(p => p.featured);
  }

  // Sort
  if (sort === 'price-low') {
    filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    // Latest/Default
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(filtered);
});

app.get('/api/products/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = products.find(p => p.slug === slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  // Only return approved reviews to the public
  const approvedReviews = product.reviews ? product.reviews.filter(r => r.approved) : [];
  res.json({ ...product, reviews: approvedReviews });
});

// Admin product CRUD
app.post('/api/products', (req: Request, res: Response) => {
  const { name, category, shortDescription, fullDescription, price, discountPrice, stock, images, specifications, benefits, usageInstructions, featured } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, Category, and Price are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newProduct: Product = {
    id: `prod-${generateId()}`,
    name,
    slug,
    category,
    shortDescription: shortDescription || '',
    fullDescription: fullDescription || '',
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : Number(price),
    stock: stock ? Number(stock) : 0,
    images: images && images.length ? images : ['https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80'],
    rating: 5.0,
    specifications: specifications || {},
    benefits: benefits || [],
    usageInstructions: usageInstructions || [],
    featured: !!featured,
    seoTitle: `${name} - UNS Home Cleaning Products`,
    seoDescription: shortDescription || `Purchase high-quality ${name} online from UNS.`,
    createdAt: new Date().toISOString(),
    reviews: []
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updated = {
    ...products[idx],
    ...req.body,
    price: req.body.price ? Number(req.body.price) : products[idx].price,
    discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : products[idx].discountPrice,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : products[idx].stock,
  };

  products[idx] = updated;
  res.json(updated);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products.splice(idx, 1);
  res.json({ message: 'Product deleted successfully' });
});

// -------------------------------------------------------------
// Review API
// -------------------------------------------------------------
app.post('/api/products/:id/reviews', (req: Request, res: Response) => {
  const { id } = req.params;
  const { customerName, rating, comment } = req.body;

  if (!customerName || !rating) {
    return res.status(400).json({ error: 'Name and rating are required' });
  }

  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const newReview: Review = {
    id: `rev-${generateId()}`,
    productId: id,
    customerName,
    rating: Number(rating),
    comment: comment || '',
    approved: false, // Default requires moderation
    createdAt: new Date().toISOString()
  };

  if (!product.reviews) {
    product.reviews = [];
  }
  product.reviews.push(newReview);

  res.status(201).json({ message: 'Review submitted. Awaiting moderation.', review: newReview });
});

// Get all reviews for admin review
app.get('/api/admin/reviews', (req: Request, res: Response) => {
  const allReviews: Review[] = [];
  products.forEach(p => {
    if (p.reviews) {
      allReviews.push(...p.reviews);
    }
  });
  res.json(allReviews);
});

app.put('/api/admin/reviews/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  let found = false;

  products.forEach(p => {
    if (p.reviews) {
      const r = p.reviews.find(review => review.id === id);
      if (r) {
        r.approved = true;
        found = true;
        
        // Recalculate average rating for product
        const approved = p.reviews.filter(rev => rev.approved);
        const sum = approved.reduce((acc, rev) => acc + rev.rating, 0);
        p.rating = approved.length ? Number((sum / approved.length).toFixed(1)) : 5.0;
      }
    }
  });

  if (!found) {
    return res.status(404).json({ error: 'Review not found' });
  }

  res.json({ message: 'Review approved successfully' });
});

app.delete('/api/admin/reviews/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let deleted = false;

  products.forEach(p => {
    if (p.reviews) {
      const idx = p.reviews.findIndex(review => review.id === id);
      if (idx !== -1) {
        p.reviews.splice(idx, 1);
        deleted = true;

        // Recalculate average rating
        const approved = p.reviews.filter(rev => rev.approved);
        const sum = approved.reduce((acc, rev) => acc + rev.rating, 0);
        p.rating = approved.length ? Number((sum / approved.length).toFixed(1)) : 5.0;
      }
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Review not found' });
  }

  res.json({ message: 'Review deleted successfully' });
});

// -------------------------------------------------------------
// Blog API
// -------------------------------------------------------------
app.get('/api/blogs', (req: Request, res: Response) => {
  res.json(blogs);
});

app.get('/api/blogs/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const blog = blogs.find(b => b.slug === slug);
  if (!blog) {
    return res.status(404).json({ error: 'Blog post not found' });
  }
  res.json(blog);
});

app.post('/api/blogs', (req: Request, res: Response) => {
  const { title, summary, content, imageUrl } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newBlog: Blog = {
    id: `blog-${generateId()}`,
    title,
    slug,
    summary: summary || '',
    content,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    author: 'UNS Admin',
    createdAt: new Date().toISOString(),
    seoTitle: `${title} - UNS Hygiene Blogs`,
    seoDescription: summary || `Read about ${title} on UNS Home Cleaning Products website.`
  };
  blogs.unshift(newBlog);
  res.status(201).json(newBlog);
});

app.delete('/api/blogs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = blogs.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  blogs.splice(idx, 1);
  res.json({ message: 'Blog deleted successfully' });
});

// -------------------------------------------------------------
// Contact Enquiry API
// -------------------------------------------------------------
app.post('/api/enquiries', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Name, Email, Phone, and Message are required' });
  }
  const newEnquiry: Enquiry = {
    id: `enq-${generateId()}`,
    name,
    email,
    phone,
    subject: subject || 'General Enquiry',
    message,
    status: 'Unread',
    createdAt: new Date().toISOString()
  };
  enquiries.unshift(newEnquiry);
  res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: newEnquiry });
});

app.get('/api/admin/enquiries', (req: Request, res: Response) => {
  res.json(enquiries);
});

app.put('/api/admin/enquiries/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const enquiry = enquiries.find(e => e.id === id);
  if (!enquiry) {
    return res.status(404).json({ error: 'Enquiry not found' });
  }
  enquiry.status = 'Read';
  res.json(enquiry);
});

// -------------------------------------------------------------
// Orders & Tracking API
// -------------------------------------------------------------
app.post('/api/orders', (req: Request, res: Response) => {
  const { customerName, customerPhone, customerEmail, shippingAddress, items, totalAmount } = req.body;

  if (!customerName || !customerPhone || !shippingAddress || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  const orderNumber = 1000 + orders.length + 1;
  const newOrder: Order = {
    id: `ord-${generateId()}`,
    orderNumber,
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    totalAmount: Number(totalAmount),
    status: 'Pending',
    trackingTimeline: [
      { status: 'Order Placed', time: new Date().toISOString(), description: 'Order successfully received.' }
    ],
    items,
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

app.get('/api/orders/track', (req: Request, res: Response) => {
  const { orderId, phone } = req.query;

  if (!orderId || !phone) {
    return res.status(400).json({ error: 'Order ID (Order Number) and Phone Number are required' });
  }

  const order = orders.find(o => 
    (o.id === orderId || o.orderNumber.toString() === orderId) && 
    o.customerPhone.replace(/[^0-9]/g, '').endsWith((phone as string).replace(/[^0-9]/g, '').slice(-10))
  );

  if (!order) {
    return res.status(404).json({ error: 'No order found matching the provided details.' });
  }

  res.json(order);
});

app.get('/api/admin/orders', (req: Request, res: Response) => {
  res.json(orders);
});

app.put('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, description } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  order.trackingTimeline.push({
    status,
    time: new Date().toISOString(),
    description: description || `Order status updated to ${status}`
  });

  res.json(order);
});

// -------------------------------------------------------------
// Admin Dashboard Analytics API
// -------------------------------------------------------------
app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);
  
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const totalProductsCount = products.length;
  const unreadEnquiriesCount = enquiries.filter(e => e.status === 'Unread').length;

  // Monthly Sales Mock Data
  const monthlySales = [
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 19000 },
    { month: 'Mar', sales: 15000 },
    { month: 'Apr', sales: 25000 },
    { month: 'May', sales: 31000 },
    { month: 'Jun', sales: totalSales || 45000 }
  ];

  // Product category breakdown
  const categorySales: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId || p.name === item.name);
      const catName = prod ? prod.category : 'Home Cleaning Products';
      categorySales[catName] = (categorySales[catName] || 0) + (item.price * item.quantity);
    });
  });

  const categoryShare = Object.keys(categorySales).map(name => ({
    name,
    value: Math.round(categorySales[name])
  }));

  res.json({
    stats: {
      totalSales: Math.round(totalSales),
      pendingOrders: pendingOrdersCount,
      totalProducts: totalProductsCount,
      unreadEnquiries: unreadEnquiriesCount
    },
    monthlySales,
    categoryShare: categoryShare.length ? categoryShare : [
      { name: 'Home Cleaning Products', value: 35000 },
      { name: 'Kitchen Cleaning Products', value: 12000 },
      { name: 'Laundry Care Products', value: 18000 }
    ]
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[UNS Backend] Server is running on port ${PORT}`);
});
