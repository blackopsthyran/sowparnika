-- =====================================================
-- SUPABASE MIGRATION: Add User and Request Status Fields
-- SIMPLE VERSION - Run this entire script at once
-- =====================================================

-- Step 1: Add user_email column
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Step 2: Add request_status column (without constraint first)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS request_status VARCHAR(20);

-- Step 3: Set default value for existing records
UPDATE public.properties 
SET request_status = 'approved' 
WHERE request_status IS NULL;

-- Step 4: Set default value for new records
ALTER TABLE public.properties 
ALTER COLUMN request_status SET DEFAULT 'approved';

-- Step 5: Add CHECK constraint using a different approach
-- Remove existing constraint if it exists (ignore error if it doesn't exist)
DO $$ 
BEGIN
    ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_request_status_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add the CHECK constraint
ALTER TABLE public.properties 
ADD CONSTRAINT properties_request_status_check 
CHECK (request_status IN ('pending', 'approved', 'rejected') OR request_status IS NULL);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_request_status ON public.properties(request_status);
CREATE INDEX IF NOT EXISTS idx_properties_user_email ON public.properties(user_email);

-- Step 7: Add comments
DO $$ 
BEGIN
    COMMENT ON COLUMN public.properties.user_email IS 'Email of the user who submitted the listing request. NULL for admin-created listings.';
    COMMENT ON COLUMN public.properties.request_status IS 'Status of the listing request: pending (awaiting review), approved (visible on site), or rejected (not visible). Default is approved for admin-created listings.';
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

