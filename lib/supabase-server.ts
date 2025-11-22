import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for use in getServerSideProps, getStaticProps, and API routes
 * This client uses the service role key for server-side operations
 * 
 * Note: For Pages Router, we use the anon key since service role should only be used in API routes
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Optimized property query builder
 * Only selects required columns to reduce payload size
 */
export const PROPERTY_SELECT_COLUMNS = `
  id,
  property_id,
  title,
  content,
  property_type,
  bhk,
  baths,
  floors,
  selling_type,
  price,
  area_size,
  area_unit,
  land_area,
  land_area_unit,
  city,
  address,
  state,
  owner_name,
  owner_number,
  amenities,
  images,
  status,
  featured,
  created_at,
  updated_at
`;

