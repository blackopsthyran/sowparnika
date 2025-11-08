-- Migration: Add user and request status fields to properties table
-- Run this SQL in your Supabase SQL Editor

-- Add user email field (for tracking who submitted the listing)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Add request status field (pending, approved, rejected)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS request_status VARCHAR(20) DEFAULT 'approved' CHECK (request_status IN ('pending', 'approved', 'rejected'));

-- Add index for request_status
CREATE INDEX IF NOT EXISTS idx_properties_request_status ON public.properties(request_status);

-- Update existing records to have approved status
UPDATE public.properties SET request_status = 'approved' WHERE request_status IS NULL;

-- Add comments
COMMENT ON COLUMN public.properties.user_email IS 'Email of the user who submitted the listing request';
COMMENT ON COLUMN public.properties.request_status IS 'Status of the listing request: pending, approved, or rejected';

