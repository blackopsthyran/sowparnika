-- =====================================================
-- SUPABASE MIGRATION: Create Property Requests Table
-- =====================================================
-- Copy and paste this entire script into your Supabase SQL Editor
-- This creates a separate table for user property listing requests
-- =====================================================

-- Step 1: Create property_requests table
CREATE TABLE IF NOT EXISTS public.property_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  property_type VARCHAR(50),
  bhk INTEGER,
  baths INTEGER,
  selling_type VARCHAR(20) CHECK (selling_type IN ('Sale', 'Rent')),
  price DECIMAL(12, 2),
  area_size DECIMAL(10, 2),
  area_unit VARCHAR(20),
  city VARCHAR(100),
  address TEXT,
  state VARCHAR(100),
  owner_name VARCHAR(255),
  owner_number VARCHAR(20),
  user_email VARCHAR(255) NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  request_status VARCHAR(20) DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_property_requests_status ON public.property_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_property_requests_user_email ON public.property_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_property_requests_created_at ON public.property_requests(created_at DESC);

-- Step 3: Add comments
COMMENT ON TABLE public.property_requests IS 'Table for storing user-submitted property listing requests before admin approval';
COMMENT ON COLUMN public.property_requests.user_email IS 'Email of the user who submitted the listing request';
COMMENT ON COLUMN public.property_requests.request_status IS 'Status of the listing request: pending (awaiting review), approved (moved to properties table), or rejected (deleted)';

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE public.property_requests ENABLE ROW LEVEL SECURITY;

-- Step 5: Create a policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on property_requests" ON public.property_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- OPTIONAL: Migrate existing pending requests from properties table
-- =====================================================
-- If you have existing pending requests in the properties table, you can migrate them:
-- INSERT INTO public.property_requests (
--   title, content, property_type, bhk, baths, selling_type, price,
--   area_size, area_unit, city, address, state, owner_name, owner_number,
--   user_email, amenities, images, request_status, created_at, updated_at
-- )
-- SELECT 
--   title, content, property_type, bhk, baths, selling_type, price,
--   area_size, area_unit, city, address, state, owner_name, owner_number,
--   user_email, amenities, images, request_status, created_at, updated_at
-- FROM public.properties
-- WHERE request_status = 'pending' AND user_email IS NOT NULL;

-- Then delete the pending requests from properties table:
-- DELETE FROM public.properties
-- WHERE request_status = 'pending' AND user_email IS NOT NULL;

-- =====================================================
-- VERIFICATION: Run this after migration
-- =====================================================
-- Check if table was created successfully
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'property_requests'
-- ORDER BY ordinal_position;

