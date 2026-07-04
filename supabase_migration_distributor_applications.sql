-- UNS Migration: Create distributor_applications table
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mzhrpafgsevjyifduncz/sql

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

-- Disable RLS so the backend anon key can read/write freely
ALTER TABLE public.distributor_applications DISABLE ROW LEVEL SECURITY;
