-- Migration: Add property_id column to properties table
-- Run this SQL in your Supabase SQL Editor

-- Add property_id column
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_id VARCHAR(20) UNIQUE;

-- Create index for property_id for faster searches
CREATE INDEX IF NOT EXISTS idx_properties_property_id ON public.properties(property_id);

-- Function to generate property ID (SP1, SP2, SP3, etc.)
CREATE OR REPLACE FUNCTION generate_property_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  -- Get the highest number from existing property_ids
  SELECT COALESCE(MAX(CAST(SUBSTRING(property_id FROM 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.properties
  WHERE property_id IS NOT NULL AND property_id ~ '^SP[0-9]+$';
  
  -- Return formatted property ID
  RETURN 'SP' || next_num::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Update all existing properties that don't have a property_id
-- This will assign SP1, SP2, SP3, etc. based on created_at order
DO $$
DECLARE
  prop RECORD;
  counter INTEGER := 1;
BEGIN
  -- Loop through properties ordered by created_at
  FOR prop IN 
    SELECT id 
    FROM public.properties 
    WHERE property_id IS NULL OR property_id = ''
    ORDER BY created_at ASC
  LOOP
    UPDATE public.properties
    SET property_id = 'SP' || counter::TEXT
    WHERE id = prop.id;
    
    counter := counter + 1;
  END LOOP;
END $$;

-- Create a trigger to auto-generate property_id for new properties
CREATE OR REPLACE FUNCTION auto_generate_property_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if property_id is not provided
  IF NEW.property_id IS NULL OR NEW.property_id = '' THEN
    NEW.property_id := generate_property_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_property_id ON public.properties;
CREATE TRIGGER trigger_auto_generate_property_id
  BEFORE INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_property_id();

