import { supabase } from '@/lib/supabase';

export const getProperty = async (id: string | string[]) => {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Database not configured');
    }

    // Fetch property from Supabase by ID
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST116') {
        throw new Error('Property not found');
      }
      throw error;
    }

    if (!data) {
      throw new Error('Property not found');
    }

    return data;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};
