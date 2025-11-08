-- Supabase/PostgreSQL Schema for Properties Table
-- Copy and paste this entire SQL into your Supabase SQL Editor and run it

-- Create the properties table
CREATE TABLE IF NOT EXISTS public.properties (
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
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented')),
  user_email VARCHAR(255),
  request_status VARCHAR(20) DEFAULT 'approved' CHECK (request_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_selling_type ON public.properties(selling_type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_request_status ON public.properties(request_status);
CREATE INDEX IF NOT EXISTS idx_properties_user_email ON public.properties(user_email);

-- Enable Row Level Security (RLS) - Optional: Adjust based on your needs
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust as needed for your security requirements)
-- For now, we'll allow all operations. In production, you should restrict this.
CREATE POLICY "Allow all operations on properties" ON public.properties
  FOR ALL
  USING (true)
  WITH CHECK (true);
