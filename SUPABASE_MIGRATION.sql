-- =====================================================
-- SUPABASE MIGRATION: Add User and Request Status Fields
-- =====================================================
-- Copy and paste this entire script into your Supabase SQL Editor
-- Run it to add support for property listing requests
-- =====================================================

-- Step 1: Add user_email column to track who submitted the listing
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Step 2: Add request_status column (pending, approved, rejected)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS request_status VARCHAR(20) DEFAULT 'approved' CHECK (request_status IN ('pending', 'approved', 'rejected'));

-- Step 3: Update existing records to have 'approved' status (for admin-created listings)
-- This ensures existing listings are visible on the site
UPDATE public.properties 
SET request_status = 'approved' 
WHERE request_status IS NULL;

-- Step 4: Create index for request_status for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_request_status ON public.properties(request_status);

-- Step 5: Create index for user_email for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_user_email ON public.properties(user_email);

-- Step 6: Add comments to document the new columns
COMMENT ON COLUMN public.properties.user_email IS 'Email of the user who submitted the listing request. NULL for admin-created listings.';
COMMENT ON COLUMN public.properties.request_status IS 'Status of the listing request: pending (awaiting review), approved (visible on site), or rejected (not visible). Default is approved for admin-created listings.';

-- =====================================================
-- VERIFICATION QUERIES (Optional - run these to verify)
-- =====================================================

-- Check if columns were added successfully
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'properties' 
-- AND column_name IN ('user_email', 'request_status');

-- Check existing properties and their request_status
-- SELECT id, title, request_status, user_email, status, created_at
-- FROM public.properties
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Count properties by request_status
-- SELECT request_status, COUNT(*) as count
-- FROM public.properties
-- GROUP BY request_status;

-- =====================================================
-- ROLLBACK (If needed - uncomment to remove columns)
-- =====================================================

-- DROP INDEX IF EXISTS idx_properties_user_email;
-- DROP INDEX IF EXISTS idx_properties_request_status;
-- ALTER TABLE public.properties DROP COLUMN IF EXISTS request_status;
-- ALTER TABLE public.properties DROP COLUMN IF EXISTS user_email;

