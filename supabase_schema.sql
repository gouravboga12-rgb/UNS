-- UNS Home Cleaning Products Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/mzhrpafgsevjyifduncz/sql)

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    "imageUrl" TEXT
);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    price NUMERIC NOT NULL,
    "discountPrice" NUMERIC NOT NULL,
    stock INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    specifications JSONB DEFAULT '{}'::jsonb,
    benefits TEXT[] DEFAULT '{}',
    "usageInstructions" TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    "productId" TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    "customerName" TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    approved BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    "orderNumber" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "shippingAddress" TEXT NOT NULL,
    "totalAmount" NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    "trackingTimeline" JSONB DEFAULT '[]'::jsonb,
    items JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "trackingId" TEXT,
    "trackingLink" TEXT,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "paymentStatus" TEXT DEFAULT 'Unpaid'
);

-- 5. Create enquiries table
CREATE TABLE IF NOT EXISTS public.enquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unread',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create distributor_applications table
CREATE TABLE IF NOT EXISTS public.distributor_applications (
    id TEXT PRIMARY KEY,
    "applicantName" TEXT NOT NULL,
    "businessName" TEXT DEFAULT '',
    address TEXT NOT NULL,
    mobile TEXT NOT NULL,
    "whatsApp" TEXT DEFAULT '',
    email TEXT NOT NULL,
    gst TEXT DEFAULT '',
    area TEXT DEFAULT '',
    experience TEXT DEFAULT '',
    products TEXT[] DEFAULT '{}',
    "expectedQty" TEXT DEFAULT '',
    date TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) to allow public access via the anon key
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_applications DISABLE ROW LEVEL SECURITY;

