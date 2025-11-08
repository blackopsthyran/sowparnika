import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import Cookies from 'cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication (admin only)
    let session: string | undefined;
    try {
      const cookies = new Cookies(req, res);
      session = cookies.get('admin_session');
    } catch (cookieError) {
      session = req.headers.cookie
        ?.split(';')
        .find((c) => c.trim().startsWith('admin_session='))
        ?.split('=')[1];
    }

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized - Admin access required' });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(200).json({
        requests: [],
        total: 0,
        message: 'Database not configured',
      });
    }

    const {
      status,
      limit = '100',
    } = req.query;

    let query = supabase.from('property_requests').select('*', { count: 'exact' });

    // Filter by status if provided
    if (status && typeof status === 'string') {
      query = query.eq('request_status', status);
    } else {
      // Default: show all requests
      query = query.in('request_status', ['pending', 'approved', 'rejected']);
    }

    // Sort by created_at descending (newest first)
    query = query.order('created_at', { ascending: false });

    // Limit results
    const limitNum = parseInt(limit as string) || 100;
    query = query.limit(limitNum);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      // If table doesn't exist, return empty array
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return res.status(200).json({
          requests: [],
          total: 0,
          message: 'Property requests table not found. Please run the migration SQL.',
        });
      }
      return res.status(500).json({ error: error.message });
    }

    // Process requests to ensure arrays are properly formatted
    const processedRequests = (data || []).map((request: any) => {
      // Parse images if it's a string
      let images = request.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [];
        }
      }
      if (!Array.isArray(images)) {
        images = [];
      }

      // Parse amenities if it's a string
      let amenities = request.amenities;
      if (typeof amenities === 'string') {
        try {
          amenities = JSON.parse(amenities);
        } catch (e) {
          amenities = [];
        }
      }
      if (!Array.isArray(amenities)) {
        amenities = [];
      }

      return {
        ...request,
        images: images,
        amenities: amenities,
      };
    });

    return res.status(200).json({
      requests: processedRequests,
      total: count || 0,
    });
  } catch (error: any) {
    console.error('Get property requests error:', error);
    return res.status(500).json({ error: 'Failed to fetch property requests' });
  }
}

