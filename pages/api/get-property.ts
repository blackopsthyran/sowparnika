import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Set cache headers - reduced cache time to prevent stale data after updates/deletions
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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Database not configured' });
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
        return res.status(404).json({ error: 'Property not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Process property to ensure images array is properly formatted
    let images = data.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        images = [];
      }
    }
    // Ensure it's an array
    if (!Array.isArray(images)) {
      images = [];
    }

    return res.status(200).json({
      property: {
        ...data,
        images: images,
      },
    });
  } catch (error: any) {
    console.error('Get property error:', error);
    return res.status(500).json({ error: 'Failed to fetch property' });
  }
}

