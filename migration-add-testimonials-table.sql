-- Migration: Add testimonials table
-- Run this SQL in your Supabase SQL Editor

-- Create the testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  image TEXT DEFAULT '',
  testimonial TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on testimonials" ON public.testimonials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_updated_at();

