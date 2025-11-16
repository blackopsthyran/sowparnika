import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Set cache headers for performance
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=30, max-age=10'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(200).json({
        testimonials: [],
        message: 'Database not configured',
      });
    }

    // Use server-side Supabase client
    const supabase = createServerSupabaseClient();

    const { status } = req.query;

    let query = supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: error.message,
        testimonials: [],
      });
    }

    return res.status(200).json({
      testimonials: data || [],
    });
  } catch (error: any) {
    console.error('Get testimonials error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Failed to fetch testimonials',
      testimonials: [],
    });
  }
}

