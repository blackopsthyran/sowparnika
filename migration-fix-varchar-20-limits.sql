-- Migration: Fix VARCHAR(20) field size limits
-- This fixes the "value too long for type character varying(20)" error
-- Run this SQL in your Supabase SQL Editor

-- Increase property_id size (from VARCHAR(20) to VARCHAR(50))
-- This allows for property IDs like SP10000000000000000000 and beyond
ALTER TABLE public.properties 
ALTER COLUMN property_id TYPE VARCHAR(50);

-- Increase owner_number size (from VARCHAR(20) to VARCHAR(50))
-- Phone numbers with country codes, extensions, or formatting can exceed 20 characters
ALTER TABLE public.properties 
ALTER COLUMN owner_number TYPE VARCHAR(50);

-- Increase area_unit size (from VARCHAR(20) to VARCHAR(50))
-- Some unit names might be longer than 20 characters
ALTER TABLE public.properties 
ALTER COLUMN area_unit TYPE VARCHAR(50);

-- Increase land_area_unit size (from VARCHAR(20) to VARCHAR(50))
-- Some unit names might be longer than 20 characters
ALTER TABLE public.properties 
ALTER COLUMN land_area_unit TYPE VARCHAR(50);

-- Also update property_requests table if it exists
DO $$
BEGIN
  -- Check if property_requests table exists and update it
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_requests') THEN
    -- Increase owner_number size
    ALTER TABLE public.property_requests 
    ALTER COLUMN owner_number TYPE VARCHAR(50);
    
    -- Increase area_unit size
    ALTER TABLE public.property_requests 
    ALTER COLUMN area_unit TYPE VARCHAR(50);
  END IF;
END $$;



