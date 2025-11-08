-- Migration: Add 'baths' column to properties table
-- Run this SQL in your Supabase SQL Editor

-- Add the baths column
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS baths INTEGER;

-- Add a comment to the column
COMMENT ON COLUMN public.properties.baths IS 'Number of bathrooms in the property';

