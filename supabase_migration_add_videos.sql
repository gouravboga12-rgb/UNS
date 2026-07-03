-- Migration: Add videos column to products table
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mzhrpafgsevjyifduncz/sql

-- Add videos array column (safe to run multiple times)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- Backfill existing rows with empty array
UPDATE public.products SET videos = '{}' WHERE videos IS NULL;
