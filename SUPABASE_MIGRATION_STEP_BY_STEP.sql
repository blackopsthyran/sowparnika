-- =====================================================
-- SUPABASE MIGRATION: Add User and Request Status Fields
-- =====================================================
-- IMPORTANT: Run these steps ONE AT A TIME in order
-- If you get an error, check which step failed
-- =====================================================

-- =====================================================
-- STEP 1: Add user_email column
-- =====================================================
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- =====================================================
-- STEP 2: Add request_status column
-- =====================================================
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS request_status VARCHAR(20);

-- =====================================================
-- STEP 3: Add CHECK constraint for request_status
-- =====================================================
-- First, set default value for existing records
UPDATE public.properties 
SET request_status = 'approved' 
WHERE request_status IS NULL;

-- Now add the constraint
ALTER TABLE public.properties 
ALTER COLUMN request_status SET DEFAULT 'approved';

-- Add the CHECK constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'properties_request_status_check'
    ) THEN
        ALTER TABLE public.properties 
        ADD CONSTRAINT properties_request_status_check 
        CHECK (request_status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

-- =====================================================
-- STEP 4: Create indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_properties_request_status ON public.properties(request_status);
CREATE INDEX IF NOT EXISTS idx_properties_user_email ON public.properties(user_email);

-- =====================================================
-- STEP 5: Add comments
-- =====================================================
COMMENT ON COLUMN public.properties.user_email IS 'Email of the user who submitted the listing request. NULL for admin-created listings.';
COMMENT ON COLUMN public.properties.request_status IS 'Status of the listing request: pending (awaiting review), approved (visible on site), or rejected (not visible). Default is approved for admin-created listings.';

-- =====================================================
-- VERIFICATION: Run this AFTER all steps above complete successfully
-- =====================================================
-- Check if columns exist
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'properties' 
AND column_name IN ('user_email', 'request_status');

-- Count properties by request_status (run this after migration)
SELECT 
  COALESCE(request_status, 'NULL') as request_status, 
  COUNT(*) as count
FROM public.properties
GROUP BY request_status
ORDER BY request_status;

