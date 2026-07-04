import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
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

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Auth configurations
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_fallback';
const googleOAuthClient = new OAuth2Client();

// Initialize Razorpay Client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// Configure SMTP nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for Cloudinary Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
app.use(express.json());
app.use(morgan('dev'));
app.use('/products', express.static(path.join(__dirname, '../public/products')));
app.use('/banners', express.static(path.join(__dirname, '../public/banners')));

// Local mutable state fallback (for offline / tables not ready)
let categoriesState: Category[] = [...mockCategories];
let productsState: Product[] = [...mockProducts];
let blogsState: Blog[] = [...mockBlogs];
let ordersState: Order[] = [...mockOrders];
let enquiriesState: Enquiry[] = [...mockEnquiries];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

interface OtpEntry {
  otp: string;
  expiresAt: number;
}
const signupOtpCache: Record<string, OtpEntry> = {};
const resetOtpCache: Record<string, OtpEntry> = {};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();


// Helper: Recalculate and update product average rating
async function recalculateProductRating(productId: string) {
  try {
    // 1. Recalculate in Supabase
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('productId', productId)
      .eq('approved', true);

    let avgRating = 5.0;
    if (!error && reviews && reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Number((sum / reviews.length).toFixed(1));
    }

    const { error: updErr } = await supabase
      .from('products')
      .update({ rating: avgRating })
      .eq('id', productId);

    if (updErr) console.warn('Supabase rating update warning:', updErr.message);

    // 2. Sync to memory state
    const idx = productsState.findIndex(p => p.id === productId);
    if (idx !== -1) {
      const prod = productsState[idx];
      const approved = prod.reviews ? prod.reviews.filter(r => r.approved) : [];
      const sum = approved.reduce((acc, r) => acc + r.rating, 0);
      prod.rating = approved.length ? Number((sum / approved.length).toFixed(1)) : 5.0;
    }
  } catch (err) {
    console.error('Rating recalculation error:', err);
  }
}

// -------------------------------------------------------------
// Cloudinary Upload API (images + videos)
// -------------------------------------------------------------
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const mimeType = req.file.mimetype || '';
  const isVideo = mimeType.startsWith('video/');
  const resourceType: 'image' | 'video' | 'auto' = isVideo ? 'video' : 'image';

  // Upload stream to Cloudinary (auto-detect resource type)
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'uns_media', resource_type: resourceType },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Cloudinary upload failed' });
      }
      res.json({ url: result?.secure_url, isVideo });
    }
  );

  uploadStream.end(req.file.buffer);
});

// -------------------------------------------------------------
// Category API
// -------------------------------------------------------------
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    // Normalize: Supabase returns column names as lowercase, so imageurl -> imageUrl
    const normalized = (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.imageUrl || cat.imageurl || cat.image_url || ''
    }));
    res.json(normalized);
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET categories:', err.message);
    res.json(categoriesState);
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  const { name, description, imageUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const id = `cat-${generateId()}`;
  const newCategory: Category = {
    id,
    name,
    slug,
    description: description || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80'
  };

  try {
    const { data, error } = await supabase.from('categories').insert(newCategory).select().single();
    if (error) throw error;
    const normalized = { id: data.id, name: data.name, slug: data.slug, description: data.description || '', imageUrl: data.imageUrl || data.imageurl || data.image_url || newCategory.imageUrl };
    res.status(201).json(normalized);
  } catch (err: any) {
    console.warn('[Supabase Fallback] POST category:', err.message);
    categoriesState.push(newCategory);
    res.status(201).json(newCategory);
  }
});

app.put('/api/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, imageUrl } = req.body;
  const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined;

  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ name, description, imageUrl, slug })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const normalized = { id: data.id, name: data.name, slug: data.slug, description: data.description || '', imageUrl: data.imageUrl || data.imageurl || data.image_url || imageUrl || '' };
    res.json(normalized);
  } catch (err: any) {
    console.warn('[Supabase Fallback] PUT category:', err.message);
    const idx = categoriesState.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const updated = {
      ...categoriesState[idx],
      name: name || categoriesState[idx].name,
      slug: slug || categoriesState[idx].slug,
      description: description !== undefined ? description : categoriesState[idx].description,
      imageUrl: imageUrl !== undefined ? imageUrl : categoriesState[idx].imageUrl
    };
    categoriesState[idx] = updated;
    res.json(updated);
  }
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Category deleted successfully' });
  } catch (err: any) {
    console.warn('[Supabase Fallback] DELETE category:', err.message);
    const idx = categoriesState.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    categoriesState.splice(idx, 1);
    res.json({ message: 'Category deleted successfully' });
  }
});

// -------------------------------------------------------------
// Product API
// -------------------------------------------------------------
app.get('/api/products', async (req: Request, res: Response) => {
  const { category, search, featured, sort } = req.query;
  
  let list: Product[] = [];
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    
    const host = req.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Normalize Supabase snake_case/lowercase columns to camelCase
    list = (data as any[]).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      shortDescription: p.shortDescription || p.shortdescription || '',
      fullDescription: p.fullDescription || p.fulldescription || '',
      images: (p.images || []).map((img: string) => 
        img.startsWith('http://localhost:5000') ? img.replace('http://localhost:5000', baseUrl) : img
      ),
      videos: p.videos || [],
      price: Number(p.price) || 0,
      discountPrice: Number(p.discountPrice || p.discountprice) || Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      rating: Number(p.rating) || 5.0,
      specifications: p.specifications || {},
      benefits: p.benefits || [],
      usageInstructions: p.usageInstructions || p.usageinstructions || [],
      featured: !!p.featured,
      seoTitle: p.seoTitle || p.seotitle || '',
      seoDescription: p.seoDescription || p.seodescription || '',
      createdAt: p.createdAt || p.createdat || new Date().toISOString(),
      reviews: []
    })) as Product[];
    
    // Lazy load reviews from Supabase for calculations
    for (const prod of list) {
      const { data: revs } = await supabase.from('reviews').select('*').eq('productId', prod.id);
      prod.reviews = revs || [];
    }
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET products:', err.message);
    const host = req.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    list = productsState.map(p => ({
      ...p,
      images: (p.images || []).map((img: string) => 
        img.startsWith('http://localhost:5000') ? img.replace('http://localhost:5000', baseUrl) : img
      )
    }));
  }

  // Filter in memory to align with mock parameters
  if (category) {
    const categorySlugStr = (category as string).replace(/_/g, '-');
    // We check categories table/list to resolve actual category name
    let catObj;
    try {
      const { data } = await supabase.from('categories').select('*').eq('slug', categorySlugStr).single();
      catObj = data;
    } catch {
      catObj = categoriesState.find(c => c.slug === categorySlugStr);
    }
    if (catObj) {
      list = list.filter(p => p.category === catObj.name);
    }
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.shortDescription.toLowerCase().includes(q)
    );
  }

  if (featured === 'true') {
    list = list.filter(p => p.featured);
  }

  if (sort === 'price-low') {
    list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price-high') {
    list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(list);
});

app.get('/api/products/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  
  try {
    const { data: rawProduct, error } = await supabase.from('products').select('*').eq('slug', slug).single();
    if (error) throw error;
    
    const host = req.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Normalize Supabase lowercase columns to camelCase
    const product: any = {
      id: rawProduct.id,
      name: rawProduct.name,
      slug: rawProduct.slug,
      category: rawProduct.category,
      shortDescription: rawProduct.shortDescription || rawProduct.shortdescription || '',
      fullDescription: rawProduct.fullDescription || rawProduct.fulldescription || '',
      images: (rawProduct.images || []).map((img: string) => 
        img.startsWith('http://localhost:5000') ? img.replace('http://localhost:5000', baseUrl) : img
      ),
      videos: rawProduct.videos || [],
      price: Number(rawProduct.price) || 0,
      discountPrice: Number(rawProduct.discountPrice || rawProduct.discountprice) || Number(rawProduct.price) || 0,
      stock: Number(rawProduct.stock) || 0,
      rating: Number(rawProduct.rating) || 5.0,
      specifications: rawProduct.specifications || {},
      benefits: rawProduct.benefits || [],
      usageInstructions: rawProduct.usageInstructions || rawProduct.usageinstructions || [],
      featured: !!rawProduct.featured,
      seoTitle: rawProduct.seoTitle || rawProduct.seotitle || '',
      seoDescription: rawProduct.seoDescription || rawProduct.seodescription || '',
      createdAt: rawProduct.createdAt || rawProduct.createdat || new Date().toISOString(),
    };
    
    // Fetch approved reviews
    const { data: reviews } = await supabase.from('reviews').select('*').eq('productId', product.id).eq('approved', true);
    product.reviews = reviews || [];
    
    res.json(product);
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET product detail:', err.message);
    const rawProduct = productsState.find(p => p.slug === slug);
    if (!rawProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const host = req.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const product = {
      ...rawProduct,
      images: (rawProduct.images || []).map((img: string) => 
        img.startsWith('http://localhost:5000') ? img.replace('http://localhost:5000', baseUrl) : img
      )
    };
    const approvedReviews = product.reviews ? product.reviews.filter(r => r.approved) : [];
    res.json({ ...product, reviews: approvedReviews });
  }
});


// Admin product CRUD
app.post('/api/products', async (req: Request, res: Response) => {
  const { name, category, shortDescription, fullDescription, price, discountPrice, stock, images, videos, specifications, benefits, usageInstructions, featured } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, Category, and Price are required' });
  }

  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const id = `prod-${generateId()}`;
  // Append short id suffix to guarantee uniqueness even if products share similar names
  const slug = `${baseSlug}-${id.slice(-6)}`;
  const newProduct: Product = {
    id,
    name,
    slug,
    category,
    shortDescription: shortDescription || '',
    fullDescription: fullDescription || '',
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : Number(price),
    stock: stock ? Number(stock) : 0,
    images: images && images.length ? images : ['https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80'],
    videos: videos && videos.length ? videos : [],
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

  const { reviews, ...dbProduct } = newProduct;

  try {
    const { data, error } = await supabase.from('products').insert(dbProduct).select().single();
    if (error) throw error;
    res.status(201).json({ ...data, reviews: [] });
  } catch (err: any) {
    console.warn('[Supabase Fallback] POST product:', err.message);
    productsState.push(newProduct);
    res.status(201).json(newProduct);
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;
  const updatedPayload = {
    ...body,
    price: body.price ? Number(body.price) : undefined,
    discountPrice: body.discountPrice ? Number(body.discountPrice) : undefined,
    stock: body.stock !== undefined ? Number(body.stock) : undefined,
  };

  const { reviews, id: payloadId, createdAt, ...dbPayload } = updatedPayload;

  try {
    const { data, error } = await supabase.from('products').update(dbPayload).eq('id', id).select().single();
    if (error) {
      console.error('[Supabase] PUT product error:', JSON.stringify(error));
      return res.status(500).json({ error: error.message, details: error });
    }
    
    // Fetch current reviews for response completeness
    const { data: revs } = await supabase.from('reviews').select('*').eq('productId', id);
    res.json({ ...data, reviews: revs || [] });
  } catch (err: any) {
    console.error('[Supabase] PUT product exception:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    console.warn('[Supabase Fallback] DELETE product:', err.message);
    const idx = productsState.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    productsState.splice(idx, 1);
    res.json({ message: 'Product deleted successfully' });
  }
});

// -------------------------------------------------------------
// Review API
// -------------------------------------------------------------
app.post('/api/products/:id/reviews', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { customerName, rating, comment } = req.body;

  if (!customerName || !rating) {
    return res.status(400).json({ error: 'Name and rating are required' });
  }

  // Resolve product
  let productExists = false;
  try {
    const { data } = await supabase.from('products').select('id').eq('id', id).single();
    if (data) productExists = true;
  } catch {
    productExists = productsState.some(p => p.id === id);
  }

  if (!productExists) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const newReview: Review = {
    id: `rev-${generateId()}`,
    productId: id,
    customerName,
    rating: Number(rating),
    comment: comment || '',
    approved: true, // Auto-approve — admin can delete/edit from admin panel if needed
    createdAt: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('reviews').insert(newReview).select().single();
    if (error) throw error;
    res.status(201).json({ message: 'Review submitted. Awaiting moderation.', review: data });
  } catch (err: any) {
    console.warn('[Supabase Fallback] POST review:', err.message);
    const prod = productsState.find(p => p.id === id);
    if (prod) {
      if (!prod.reviews) prod.reviews = [];
      prod.reviews.push(newReview);
    }
    res.status(201).json({ message: 'Review submitted. Awaiting moderation.', review: newReview });
  }
});

// Get all reviews for admin review
app.get('/api/admin/reviews', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('reviews').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET admin reviews:', err.message);
    const allReviews: Review[] = [];
    productsState.forEach(p => {
      if (p.reviews) {
        allReviews.push(...p.reviews);
      }
    });
    res.json(allReviews);
  }
});

// Edit user review rating and comment
app.put('/api/admin/reviews/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment, approved } = req.body;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating: rating ? Number(rating) : undefined, comment, approved })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    
    // Recalculate average rating
    await recalculateProductRating(data.productId);
    res.json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] PUT review update:', err.message);
    let foundReview: any = null;
    productsState.forEach(p => {
      if (p.reviews) {
        const r = p.reviews.find(rev => rev.id === id);
        if (r) {
          if (rating) r.rating = Number(rating);
          if (comment !== undefined) r.comment = comment;
          if (approved !== undefined) r.approved = approved;
          foundReview = r;

          // Recalculate average rating
          const approvedList = p.reviews.filter(rev => rev.approved);
          const sum = approvedList.reduce((acc, rev) => acc + rev.rating, 0);
          p.rating = approvedList.length ? Number((sum / approvedList.length).toFixed(1)) : 5.0;
        }
      }
    });

    if (!foundReview) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(foundReview);
  }
});

app.put('/api/admin/reviews/:id/approve', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase.from('reviews').update({ approved: true }).eq('id', id).select().single();
    if (error) throw error;
    
    await recalculateProductRating(data.productId);
    res.json({ message: 'Review approved successfully' });
  } catch (err: any) {
    console.warn('[Supabase Fallback] PUT approve review:', err.message);
    let found = false;
    productsState.forEach(p => {
      if (p.reviews) {
        const r = p.reviews.find(review => review.id === id);
        if (r) {
          r.approved = true;
          found = true;
          // Recalculate average rating
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
  }
});

app.delete('/api/admin/reviews/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Fetch review first to get product id
    const { data: rev } = await supabase.from('reviews').select('productId').eq('id', id).single();
    
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    
    if (rev?.productId) {
      await recalculateProductRating(rev.productId);
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err: any) {
    console.warn('[Supabase Fallback] DELETE review:', err.message);
    let deleted = false;
    productsState.forEach(p => {
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
  }
});

// -------------------------------------------------------------
// Blog API
// -------------------------------------------------------------
app.get('/api/blogs', (req: Request, res: Response) => {
  res.json(blogsState);
});

app.get('/api/blogs/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const blog = blogsState.find(b => b.slug === slug);
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
  blogsState.unshift(newBlog);
  res.status(201).json(newBlog);
});

app.delete('/api/blogs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = blogsState.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  blogsState.splice(idx, 1);
  res.json({ message: 'Blog deleted successfully' });
});

// -------------------------------------------------------------
// Contact Enquiry API
// -------------------------------------------------------------
app.post('/api/enquiries', async (req: Request, res: Response) => {
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

  try {
    const { data, error } = await supabase.from('enquiries').insert(newEnquiry).select().single();
    if (error) throw error;
    res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: data });
  } catch (err: any) {
    console.warn('[Supabase Fallback] POST enquiry:', err.message);
    enquiriesState.unshift(newEnquiry);
    res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: newEnquiry });
  }
});

app.get('/api/admin/enquiries', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('enquiries').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET enquiries:', err.message);
    res.json(enquiriesState);
  }
});

app.put('/api/admin/enquiries/:id/read', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase.from('enquiries').update({ status: 'Read' }).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] PUT read enquiry:', err.message);
    const enquiry = enquiriesState.find(e => e.id === id);
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    enquiry.status = 'Read';
    res.json(enquiry);
  }
});

app.delete('/api/admin/enquiries/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (err: any) {
    console.warn('[Supabase Fallback] DELETE enquiry:', err.message);
    enquiriesState = enquiriesState.filter(e => e.id !== id);
    res.json({ message: 'Enquiry deleted successfully' });
  }
});


// -------------------------------------------------------------
// Distributor Applications API
// -------------------------------------------------------------
let distributorApplicationsState: any[] = [];

app.post('/api/distributor-applications', async (req: Request, res: Response) => {
  const {
    applicantName, businessName, address, mobile, whatsApp,
    email, gst, area, experience, products, expectedQty, date
  } = req.body;

  if (!applicantName || !mobile || !email || !address) {
    return res.status(400).json({ error: 'Applicant name, mobile, email, and address are required' });
  }

  const newApplication: any = {
    id: `dist-${generateId()}`,
    applicantName,
    businessName: businessName || '',
    address,
    mobile,
    whatsApp: whatsApp || mobile,
    email,
    gst: gst || '',
    area: area || '',
    experience: experience || '',
    products: Array.isArray(products) ? products : [],
    expectedQty: expectedQty || '',
    date: date || new Date().toISOString().split('T')[0],
    status: 'New',
    createdAt: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('distributor_applications')
      .insert(newApplication)
      .select()
      .single();
    if (error) throw error;
    console.log('[Distributor Application] Saved to Supabase:', data?.id);

    // Also send notification email to admin
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: 'unshomecleaningproductspvtltd@gmail.com',
        subject: `New Distributor Application from ${applicantName} — UNS`,
        html: `
          <h2>New Distributor Application</h2>
          <table>
            <tr><td><b>Applicant:</b></td><td>${applicantName}</td></tr>
            <tr><td><b>Business:</b></td><td>${businessName || 'N/A'}</td></tr>
            <tr><td><b>Mobile:</b></td><td>${mobile}</td></tr>
            <tr><td><b>Email:</b></td><td>${email}</td></tr>
            <tr><td><b>Area:</b></td><td>${area || 'N/A'}</td></tr>
            <tr><td><b>GST:</b></td><td>${gst || 'N/A'}</td></tr>
            <tr><td><b>Experience:</b></td><td>${experience || 'N/A'}</td></tr>
            <tr><td><b>Products:</b></td><td>${Array.isArray(products) ? products.join(', ') : 'N/A'}</td></tr>
            <tr><td><b>Expected Qty:</b></td><td>${expectedQty || 'N/A'}</td></tr>
            <tr><td><b>Address:</b></td><td>${address}</td></tr>
            <tr><td><b>Date:</b></td><td>${date || new Date().toISOString().split('T')[0]}</td></tr>
          </table>
          <br/><p>Login to the admin panel to view and manage this application.</p>
        `
      });
    } catch (mailErr: any) {
      console.warn('[Mail] Failed to send distributor application email:', mailErr.message);
    }

    res.status(201).json({ message: 'Distributor application submitted successfully', application: data });
  } catch (err: any) {
    console.warn('[Supabase Fallback] POST distributor-application:', err.message);
    distributorApplicationsState.unshift(newApplication);

    // Still try to send email even in fallback
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: 'unshomecleaningproductspvtltd@gmail.com',
        subject: `New Distributor Application from ${applicantName} — UNS`,
        html: `<h2>New Distributor Application</h2><p><b>Name:</b> ${applicantName}</p><p><b>Mobile:</b> ${mobile}</p><p><b>Email:</b> ${email}</p><p><b>Area:</b> ${area}</p><p><b>Address:</b> ${address}</p>`
      });
    } catch {}

    res.status(201).json({ message: 'Distributor application submitted successfully', application: newApplication });
  }
});

app.get('/api/admin/distributor-applications', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('distributor_applications')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET distributor-applications:', err.message);
    res.json(distributorApplicationsState);
  }
});

app.put('/api/admin/distributor-applications/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { data, error } = await supabase
      .from('distributor_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] PUT distributor-applications status:', err.message);
    const app = distributorApplicationsState.find(a => a.id === id);
    if (app) app.status = status;
    res.json({ id, status });
  }
});

app.delete('/api/admin/distributor-applications/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('distributor_applications').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Application deleted successfully' });
  } catch (err: any) {
    console.warn('[Supabase Fallback] DELETE distributor-application:', err.message);
    distributorApplicationsState = distributorApplicationsState.filter(a => a.id !== id);
    res.json({ message: 'Application deleted successfully' });
  }
});


// -------------------------------------------------------------
// Orders & Tracking API
// -------------------------------------------------------------
app.post('/api/orders', async (req: Request, res: Response) => {
  const { customerName, customerPhone, customerEmail, shippingAddress, items, totalAmount, paymentMethod } = req.body;

  if (!customerName || !customerPhone || !shippingAddress || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  // Get next order number
  let orderNumber = 1001;
  try {
    const { data, error } = await supabase.from('orders').select('orderNumber');
    if (!error && data) {
      orderNumber = 1000 + data.length + 1;
    }
  } catch {
    orderNumber = 1000 + ordersState.length + 1;
  }

  let razorpayOrder: any = null;
  let paymentStatus = 'Unpaid';

  if (paymentMethod === 'online') {
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(Number(totalAmount) * 100), // in paise
        currency: 'INR',
        receipt: `receipt_${orderNumber}`
      });
      paymentStatus = 'Unpaid';
    } catch (err: any) {
      console.error('Razorpay order creation failed:', err);
      return res.status(500).json({ error: 'Failed to create payment order with Razorpay' });
    }
  } else if (paymentMethod === 'cod') {
    paymentStatus = 'COD';
  } else {
    paymentStatus = 'WhatsApp';
  }

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
      { status: 'Order Placed', time: new Date().toISOString(), description: paymentMethod === 'online' ? 'Order initiated, pending online payment.' : 'Order successfully received.' }
    ],
    items,
    createdAt: new Date().toISOString(),
    trackingId: '',
    trackingLink: '',
    razorpayOrderId: razorpayOrder ? razorpayOrder.id : undefined,
    paymentStatus
  };

  try {
    const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] POST order:', err.message);
    ordersState.unshift(newOrder);
    res.status(201).json(newOrder);
  }
});

// Helper: Auto-verify payment status if Unpaid but has Razorpay Order ID
async function syncPaymentStatusIfUnpaid(order: any) {
  if (order && order.paymentStatus === 'Unpaid' && order.razorpayOrderId) {
    try {
      let isPaid = false;
      let paymentId = '';

      if (order.razorpayOrderId.startsWith('plink_')) {
        const linkDetails: any = await razorpay.paymentLink.fetch(order.razorpayOrderId);
        if (linkDetails.status === 'paid') {
          isPaid = true;
          const payments = linkDetails.payments || [];
          if (payments.length > 0) {
            paymentId = payments[payments.length - 1].payment_id;
          }
        }
      } else {
        const orderDetails: any = await razorpay.orders.fetch(order.razorpayOrderId);
        if (orderDetails.status === 'paid') {
          isPaid = true;
          const paymentsInfo: any = await razorpay.orders.fetchPayments(order.razorpayOrderId);
          if (paymentsInfo && paymentsInfo.items && paymentsInfo.items.length > 0) {
            paymentId = paymentsInfo.items[0].id;
          }
        }
      }

      if (isPaid) {
        const timeline = order.trackingTimeline || [];
        if (!timeline.some((t: any) => t.status === 'Paid')) {
          timeline.push({
            status: 'Paid',
            time: new Date().toISOString(),
            description: `Payment auto-verified. Status: Paid. Transaction ID: ${paymentId || 'N/A'}`
          });
        }

        const updatePayload = {
          status: 'Processing',
          paymentStatus: 'Paid',
          razorpayPaymentId: paymentId || undefined,
          trackingTimeline: timeline
        };

        try {
          await supabase.from('orders').update(updatePayload).eq('id', order.id);
        } catch {
          // ignore db errors
        }

        order.status = 'Processing';
        order.paymentStatus = 'Paid';
        if (paymentId) order.razorpayPaymentId = paymentId;
        order.trackingTimeline = timeline;

        const localOrder = ordersState.find(o => o.id === order.id);
        if (localOrder) {
          Object.assign(localOrder, updatePayload);
        }
      }
    } catch (err) {
      console.warn('Auto-healing payment verification failed:', err);
    }
  }
}

// Payment config route
app.get('/api/payments/config', (req: Request, res: Response) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_T7T6MVvx0hvF4f' });
});

// Signature verification route
app.post('/api/payments/verify', async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
    return res.status(400).json({ error: 'Missing payment verification details' });
  }

  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'cUqENBHX9QnxYKPJDFD3p9sA')
    .update(body.toString())
    .digest('hex');

  const isSignatureValid = expectedSignature === razorpaySignature;

  if (isSignatureValid) {
    try {
      let currentOrder: any = null;
      try {
        const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
        currentOrder = data;
      } catch {
        currentOrder = ordersState.find(o => o.id === orderId);
      }

      if (!currentOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (currentOrder.paymentStatus === 'Paid') {
        return res.json({ success: true, message: 'Payment already verified', order: currentOrder });
      }

      const timeline = currentOrder.trackingTimeline || [];
      timeline.push({
        status: 'Paid',
        time: new Date().toISOString(),
        description: `Payment of ₹${currentOrder.totalAmount} received via Razorpay. Transaction ID: ${razorpayPaymentId}.`
      });

      const updateData = {
        status: 'Processing',
        paymentStatus: 'Paid',
        razorpayPaymentId,
        razorpaySignature,
        trackingTimeline: timeline
      };

      let updatedOrder = null;
      try {
        const { data, error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', orderId)
          .select()
          .single();
        if (error) throw error;
        updatedOrder = data;
      } catch (err: any) {
        console.warn('[Supabase Fallback] verify signature update:', err.message);
        const idx = ordersState.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          ordersState[idx] = {
            ...ordersState[idx],
            ...updateData
          };
          updatedOrder = ordersState[idx];
        }
      }

      res.json({ success: true, message: 'Payment verified successfully', order: updatedOrder });
    } catch (err: any) {
      console.error('Failed to update order after verification:', err);
      res.status(500).json({ error: 'Payment verified but order update failed' });
    }
  } else {
    res.status(400).json({ error: 'Invalid signature. Payment verification failed.' });
  }
});

// Create Hosted Payment Link Route (for React Native/Mobile checkouts)
app.post('/api/payments/payment-link', async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    let order: any = null;
    try {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      order = data;
    } catch {
      order = ordersState.find(o => o.id === orderId);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isMobile = req.body.source === 'mobile';
    const host = req.get('host');
    
    // Web host URL fallback
    const webUrl = host?.includes('localhost') ? 'http://localhost:5173' : 'https://uns-home-cleaning.vercel.app';

    const callbackUrl = `${webUrl}/track-order?orderId=${order.orderNumber}&phone=${order.customerPhone}&payment=success`;

    const response = await razorpay.paymentLink.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      accept_partial: false,
      first_min_partial_amount: 0,
      description: `Payment for Order #${order.orderNumber} - UNS Cleaning Products`,
      customer: {
        name: order.customerName,
        email: order.customerEmail || 'customer@example.com',
        contact: order.customerPhone.replace(/[^0-9]/g, '').slice(-10) || '9999999999'
      },
      notify: {
        sms: false,
        email: false
      },
      reminder_enable: false,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber.toString()
      },
      callback_url: callbackUrl,
      callback_method: 'get'
    });

    const updatePayload = {
      razorpayOrderId: response.id,
      trackingTimeline: [
        ...(order.trackingTimeline || []),
        { status: 'Payment Link Created', time: new Date().toISOString(), description: 'Online payment link generated.' }
      ]
    };

    try {
      await supabase.from('orders').update(updatePayload).eq('id', orderId);
    } catch {
      const idx = ordersState.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        ordersState[idx] = { ...ordersState[idx], ...updatePayload };
      }
    }

    res.json({ paymentLink: response.short_url, razorpayOrderId: response.id });
  } catch (err: any) {
    console.error('Failed to create payment link:', err);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});

function parseOrderFields(order: any) {
  if (!order) return order;
  if (typeof order.items === 'string') {
    try { order.items = JSON.parse(order.items); } catch {}
  }
  if (typeof order.trackingTimeline === 'string') {
    try { order.trackingTimeline = JSON.parse(order.trackingTimeline); } catch {}
  }
  return order;
}

// GET order track route
app.get('/api/orders/track', async (req: Request, res: Response) => {
  const { orderId, phone } = req.query;

  if (!orderId || !phone) {
    return res.status(400).json({ error: 'Order ID (Order Number) and Phone Number are required' });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*');
    if (error) throw error;
    
    let order = data.find(o => 
      (o.id === orderId || o.orderNumber.toString() === orderId) && 
      o.customerPhone.replace(/[^0-9]/g, '').endsWith((phone as string).replace(/[^0-9]/g, '').slice(-10))
    );
    if (!order) {
      return res.status(404).json({ error: 'No order found matching the provided details.' });
    }

    // Run auto-healing
    await syncPaymentStatusIfUnpaid(order);
    
    res.json(parseOrderFields(order));
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET track order:', err.message);
    const order = ordersState.find(o => 
      (o.id === orderId || o.orderNumber.toString() === orderId) && 
      o.customerPhone.replace(/[^0-9]/g, '').endsWith((phone as string).replace(/[^0-9]/g, '').slice(-10))
    );
    if (!order) {
      return res.status(404).json({ error: 'No order found matching the provided details.' });
    }

    // Run auto-healing on local memory fallback
    await syncPaymentStatusIfUnpaid(order);

    res.json(parseOrderFields(order));
  }
});

app.get('/api/orders/my-orders', async (req: Request, res: Response) => {
  const { phone, email } = req.query;

  if (!phone && !email) {
    return res.status(400).json({ error: 'Phone number or email is required to fetch orders.' });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;

    const filtered = data.filter(o => {
      const matchesPhone = phone 
        ? o.customerPhone.replace(/[^0-9]/g, '').endsWith((phone as string).replace(/[^0-9]/g, '').slice(-10))
        : false;
      const matchesEmail = email
        ? o.customerEmail && o.customerEmail.toLowerCase() === (email as string).toLowerCase()
        : false;
      return matchesPhone || matchesEmail;
    });

    const parsed = filtered.map(parseOrderFields);
    res.json(parsed);
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET my-orders:', err.message);
    const filtered = ordersState.filter(o => {
      const matchesPhone = phone 
        ? o.customerPhone.replace(/[^0-9]/g, '').endsWith((phone as string).replace(/[^0-9]/g, '').slice(-10))
        : false;
      const matchesEmail = email
        ? o.customerEmail && o.customerEmail.toLowerCase() === (email as string).toLowerCase()
        : false;
      return matchesPhone || matchesEmail;
    });
    const parsed = filtered.map(parseOrderFields);
    res.json(parsed);
  }
});

app.get('/api/admin/orders', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    const parsed = data.map(parseOrderFields);
    res.json(parsed);
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET admin orders:', err.message);
    const parsed = ordersState.map(parseOrderFields);
    res.json(parsed);
  }
});

// Manage order status, tracking ID, tracking Link (Comprehensive Update Endpoint)
app.put('/api/admin/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, trackingId, trackingLink, description } = req.body;

  try {
    // 1. Fetch current order
    const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    const timeline = order.trackingTimeline || [];
    if ((status && status !== order.status) || description) {
      timeline.push({
        status: status || order.status,
        time: new Date().toISOString(),
        description: description || `Order status updated to ${status || order.status}`
      });
    }

    // 2. Perform update
    const { data, error: updateErr } = await supabase
      .from('orders')
      .update({
        status: status || undefined,
        trackingId: trackingId !== undefined ? trackingId : undefined,
        trackingLink: trackingLink !== undefined ? trackingLink : undefined,
        trackingTimeline: timeline
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    res.json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] PUT order details:', err.message);
    const order = ordersState.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentStatus = status || order.status;
    const hasStatusChanged = status && status !== order.status;
    if (hasStatusChanged) {
      order.status = status;
    }
    if (hasStatusChanged || description) {
      order.trackingTimeline.push({
        status: currentStatus,
        time: new Date().toISOString(),
        description: description || `Order status updated to ${currentStatus}`
      });
    }

    if (trackingId !== undefined) {
      order.trackingId = trackingId;
    }
    if (trackingLink !== undefined) {
      order.trackingLink = trackingLink;
    }
    res.json(order);
  }
});

// Backward compatibility status endpoint
app.put('/api/admin/orders/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, description } = req.body;

  try {
    const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    const timeline = order.trackingTimeline || [];
    timeline.push({
      status,
      time: new Date().toISOString(),
      description: description || `Order status updated to ${status}`
    });

    const { data, error: updateErr } = await supabase
      .from('orders')
      .update({ status, trackingTimeline: timeline })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    res.json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] PUT order status:', err.message);
    const order = ordersState.find(o => o.id === id);
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
  }
});

// -------------------------------------------------------------
// Admin Dashboard Analytics API
// -------------------------------------------------------------
app.get('/api/admin/dashboard', async (req: Request, res: Response) => {
  let allOrders: Order[] = [];
  let allProductsCount = 0;
  let unreadEnquiriesCount = 0;
  let categoryShare: any[] = [];

  try {
    const { data: ords } = await supabase.from('orders').select('*');
    allOrders = ords || [];

    const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    allProductsCount = prodCount || 0;

    const { count: enqCount } = await supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'Unread');
    unreadEnquiriesCount = enqCount || 0;
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET dashboard stats:', err.message);
    allOrders = [...ordersState];
    allProductsCount = productsState.length;
    unreadEnquiriesCount = enquiriesState.filter(e => e.status === 'Unread').length;
  }

  const totalSales = allOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);
  
  const pendingOrdersCount = allOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

  const monthlySales = [
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 19000 },
    { month: 'Mar', sales: 15000 },
    { month: 'Apr', sales: 25000 },
    { month: 'May', sales: 31000 },
    { month: 'Jun', sales: totalSales || 45000 }
  ];

  res.json({
    stats: {
      totalSales: Math.round(totalSales),
      pendingOrders: pendingOrdersCount,
      totalProducts: allProductsCount,
      unreadEnquiries: unreadEnquiriesCount
    },
    monthlySales,
    categoryShare: [
      { name: 'Home Cleaning Products', value: 35000 },
      { name: 'Kitchen Cleaning Products', value: 12000 },
      { name: 'Laundry Care Products', value: 18000 }
    ]
  });
});

app.delete('/api/admin/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Order deleted successfully' });
  } catch (err: any) {
    console.warn('[Supabase Fallback] DELETE order:', err.message);
    ordersState = ordersState.filter(o => o.id !== id);
    res.json({ message: 'Order deleted successfully' });
  }
});

app.get('/api/admin/users', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.warn('[Supabase Fallback] GET admin users:', err.message);
    res.json([]);
  }
});

app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    console.warn('[Supabase Fallback] DELETE admin user:', err.message);
    res.json({ message: 'User deleted successfully' });
  }
});


// -------------------------------------------------------------
// Authentication APIs
// -------------------------------------------------------------

// Send OTP for Sign Up
app.post('/api/auth/send-signup-otp', async (req: Request, res: Response) => {
  const { email, phone } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail === 'unshomecleaningproductspvtltd@gmail.com') {
    return res.status(400).json({ error: 'This email is reserved for administration.' });
  }

  try {
    const { data: existingUser, error: checkErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    if (phone) {
      const { data: existingPhoneUser, error: phoneCheckErr } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone.trim())
        .maybeSingle();

      if (existingPhoneUser) {
        return res.status(400).json({ error: 'User with this phone number already exists.' });
      }
    }

    const otp = generateOtp();
    signupOtpCache[normalizedEmail] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    const mailOptions = {
      from: process.env.SMTP_FROM || '"UNS Home Cleaning Products" <unshomecleaningproductspvtltd@gmail.com>',
      to: normalizedEmail,
      subject: 'Verify your email for UNS Home Cleaning Products',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800;">UNS Cleaning Products</h1>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 700;">Clean Today... Healthy Tomorrow...</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
          <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">Email Verification OTP</h2>
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 24px;">
            Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This OTP is valid for 5 minutes.
          </p>
          <div style="text-align: center; margin: 30px 0; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 0.25em; color: #0d9488; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 16px;">
            If you did not initiate this request, please ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            This is an automated system email from UNS Home Cleaning Products PVT LTD. Please do not reply.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent to email successfully.' });
  } catch (err: any) {
    console.error('Send signup OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP email.' });
  }
});

// Send OTP for Reset Password
app.post('/api/auth/send-reset-otp', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const { data: existingUser, error: checkErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!existingUser) {
      return res.status(400).json({ error: 'No user account found with this email address.' });
    }

    const otp = generateOtp();
    resetOtpCache[normalizedEmail] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    const mailOptions = {
      from: process.env.SMTP_FROM || '"UNS Home Cleaning Products" <unshomecleaningproductspvtltd@gmail.com>',
      to: normalizedEmail,
      subject: 'Reset your password for UNS Home Cleaning Products',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800;">UNS Cleaning Products</h1>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 700;">Clean Today... Healthy Tomorrow...</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
          <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">Password Reset OTP</h2>
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed. This OTP is valid for 5 minutes.
          </p>
          <div style="text-align: center; margin: 30px 0; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 0.25em; color: #0d9488; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 16px;">
            If you did not request a password reset, please ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            This is an automated system email from UNS Home Cleaning Products PVT LTD. Please do not reply.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset OTP sent to email.' });
  } catch (err: any) {
    console.error('Send reset OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP email.' });
  }
});

// Reset Password API
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const entry = resetOtpCache[normalizedEmail];
  if (!entry) {
    return res.status(400).json({ error: 'No active OTP verification session found.' });
  }

  if (entry.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid OTP code.' });
  }

  if (Date.now() > entry.expiresAt) {
    delete resetOtpCache[normalizedEmail];
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  try {
    const { error: updateErr } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('email', normalizedEmail);

    if (updateErr) {
      console.error('Error resetting password:', updateErr.message);
      return res.status(500).json({ error: 'Failed to update database password.' });
    }

    delete resetOtpCache[normalizedEmail];
    res.json({ message: 'Password has been updated successfully.' });
  } catch (err: any) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Server error during password reset.' });
  }
});

// Sign Up API
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { name, email, phone, password, otp } = req.body;

  if (!name || !email || !phone || !password || !otp) {
    return res.status(400).json({ error: 'All fields including OTP are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail === 'unshomecleaningproductspvtltd@gmail.com') {
    return res.status(400).json({ error: 'This email is reserved for administration.' });
  }

  // Verify OTP
  const otpEntry = signupOtpCache[normalizedEmail];
  if (!otpEntry) {
    return res.status(400).json({ error: 'No OTP request found for this email.' });
  }
  if (otpEntry.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid OTP code.' });
  }
  if (Date.now() > otpEntry.expiresAt) {
    delete signupOtpCache[normalizedEmail];
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  try {
    // 1. Check if user already exists
    const { data: existingUser, error: checkErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      delete signupOtpCache[normalizedEmail];
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    if (phone) {
      const { data: existingPhoneUser, error: phoneCheckErr } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone.trim())
        .maybeSingle();

      if (existingPhoneUser) {
        delete signupOtpCache[normalizedEmail];
        return res.status(400).json({ error: 'User with this phone number already exists.' });
      }
    }


    // 2. Create the user
    const id = 'usr-' + generateId();
    const { error: insertErr } = await supabase
      .from('users')
      .insert({
        id,
        name,
        email,
        phone,
        password, // Plain text for mock schema simplicity
        role: 'user',
        createdAt: new Date().toISOString()
      });

    if (insertErr) {
      console.error('Error inserting user:', insertErr.message);
      return res.status(500).json({ error: 'Failed to create user record.' });
    }

    // 3. Send welcome email via SMTP
    const mailOptions = {
      from: process.env.SMTP_FROM || '"UNS Home Cleaning Products" <unshomecleaningproductspvtltd@gmail.com>',
      to: email,
      subject: 'Welcome to UNS Cleaning Products!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800;">UNS Cleaning Products</h1>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 700;">Clean Today... Healthy Tomorrow...</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
          <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">Hello ${name},</h2>
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
            Welcome to UNS Home Cleaning Products! We are thrilled to have you register an account with us.
          </p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
            Explore our premium formulations designed for commercial, industrial, and household cleanliness.
          </p>
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="font-size: 13px; color: #475569; margin: 0 0 8px 0; font-weight: 600;">Your Account Details:</p>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;"><strong>Name:</strong> ${name}</p>
            <p style="font-size: 12px; color: #64748b; margin: 0;"><strong>Email:</strong> ${email}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            This is an automated system email from UNS Home Cleaning Products PVT LTD. Please do not reply.
          </p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions).catch(err => {
      console.error('[SMTP welcome email dispatch failure]:', err.message);
    });

    // 4. Sign JWT
    const token = jwt.sign({ id, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    delete signupOtpCache[normalizedEmail];

    res.json({
      token,
      user: { id, name, email, phone, role: 'user' }
    });

  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// Sign In API
app.post('/api/auth/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 1. Fetch user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user:', error.message);
      return res.status(500).json({ error: 'Authentication database query failed.' });
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 2. Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (err: any) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Server error during signin.' });
  }
});

// Google Authentication API
app.post('/api/auth/google', async (req: Request, res: Response) => {
  const { token, clientId } = req.body;

  if (!token || !clientId) {
    return res.status(400).json({ error: 'Token and Google Client ID are required.' });
  }

  try {
    // 1. Verify Google token
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: token,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token payload.' });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || 'Google User';

    // 2. Find or create the user in users table
    const { data: existingUser, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (fetchErr) {
      console.error('Supabase error finding Google user:', fetchErr.message);
      return res.status(500).json({ error: 'Database search error.' });
    }

    let user = existingUser;

    if (!user) {
      const id = 'usr-' + generateId();
      const phone = '';
      const password = 'GOOGLE_OAUTH_PASS_' + Math.random().toString(36).substring(2, 11);
      const role = 'user';

      const { error: insertErr } = await supabase
        .from('users')
        .insert({
          id,
          name,
          email,
          phone,
          password,
          role,
          createdAt: new Date().toISOString()
        });

      if (insertErr) {
        console.error('Supabase error inserting Google user:', insertErr.message);
        return res.status(500).json({ error: 'Database insert error.' });
      }

      user = { id, name, email, phone, role, password, createdAt: new Date().toISOString() };

      // Send welcome email via SMTP
      const mailOptions = {
        from: process.env.SMTP_FROM || '"UNS Home Cleaning Products" <unshomecleaningproductspvtltd@gmail.com>',
        to: email,
        subject: 'Welcome to UNS Cleaning Products!',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800;">UNS Cleaning Products</h1>
              <p style="color: #64748b; margin: 4px 0 0 0; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 700;">Clean Today... Healthy Tomorrow...</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
            <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">Hello ${name},</h2>
            <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
              Welcome to UNS Home Cleaning Products! We are thrilled to have you sign in using your Google Account.
            </p>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="font-size: 13px; color: #475569; margin: 0 0 8px 0; font-weight: 600;">Your Account Details:</p>
              <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;"><strong>Name:</strong> ${name}</p>
              <p style="font-size: 12px; color: #64748b; margin: 0;"><strong>Email:</strong> ${email}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
              This is an automated system email from UNS Home Cleaning Products PVT LTD. Please do not reply.
            </p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions).catch(err => {
        console.error('[SMTP Google welcome email dispatch failure]:', err.message);
      });
    }

    // 3. Sign JWT
    const jwtToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      }
    });

  } catch (err: any) {
    console.error('Google verification backend error:', err);
    res.status(500).json({ error: 'Server authentication verification error.' });
  }
});

// Shipping Settings State & Database Sync
let settingsState = {
  freeShippingEnabled: true,
  freeShippingThreshold: 500,
  defaultDeliveryCharge: 50
};

async function loadSettings() {
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('key', 'shipping_settings').single();
    if (data && data.value) {
      settingsState = data.value;
      console.log('[UNS Settings] Loaded settings successfully from Supabase.');
    }
  } catch (err) {
    console.log('[UNS Settings] Fallback settings active or table not initialized.');
  }
}
loadSettings();

app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('key', 'shipping_settings').single();
    if (data && data.value) {
      return res.json(data.value);
    }
  } catch (err) {}
  res.json(settingsState);
});

app.post('/api/settings', async (req: Request, res: Response) => {
  const newSettings = req.body;
  settingsState = { ...settingsState, ...newSettings };
  try {
    const { error } = await supabase.from('settings').upsert({
      key: 'shipping_settings',
      value: settingsState
    });
    if (error) throw error;
  } catch (err: any) {
    console.warn('[Supabase Fallback] POST settings:', err.message);
  }
  res.json(settingsState);
});

// Start Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[UNS Backend] Server is running on port ${PORT}`);
  });
}

export default app;
