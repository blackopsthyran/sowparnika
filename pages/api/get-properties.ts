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
        properties: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        message: 'Database not configured',
      });
    }

    const {
      search,
      propertyType,
      sellingType,
      minPrice,
      maxPrice,
      city,
      bhk,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = '1',
      limit = '20',
    } = req.query;

    let query = supabase.from('properties').select('*', { count: 'exact' });

    // Search filter - search in title, content, address, city, state
    if (search && typeof search === 'string') {
      const searchTerm = `%${search}%`;
      // Supabase OR query syntax: column.ilike.value,column2.ilike.value2
      // Note: Supabase requires the % wildcards to be part of the value
      query = query.or(
        `title.ilike.${searchTerm},content.ilike.${searchTerm},address.ilike.${searchTerm},city.ilike.${searchTerm},state.ilike.${searchTerm}`
      );
    }

    // Property type filter
    if (propertyType && typeof propertyType === 'string') {
      query = query.eq('property_type', propertyType);
    }

    // Selling type filter
    if (sellingType && typeof sellingType === 'string') {
      query = query.eq('selling_type', sellingType);
    }

    // Price range filter
    if (minPrice && typeof minPrice === 'string') {
      query = query.gte('price', parseFloat(minPrice));
    }
    if (maxPrice && typeof maxPrice === 'string') {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // City filter
    if (city && typeof city === 'string') {
      query = query.ilike('city', `%${city}%`);
    }

    // BHK filter
    if (bhk && typeof bhk === 'string') {
      query = query.eq('bhk', parseInt(bhk));
    }

    // Status filter
    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    } else {
      // Default to active properties only
      query = query.eq('status', 'active');
    }

    // Sorting
    const validSortFields = ['created_at', 'price', 'area_size', 'title'];
    const sortField = validSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : 'created_at';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    query = query.order(sortField, { ascending: order === 'asc' });

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Process properties to ensure images array is properly formatted
    const processedProperties = (data || []).map((property: any) => {
      // Supabase might return JSON arrays as strings, so parse if needed
      let images = property.images;
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
      
      return {
        ...property,
        images: images,
      };
    });

    return res.status(200).json({
      properties: processedProperties,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (error: any) {
    console.error('Get properties error:', error);
    return res.status(500).json({ error: 'Failed to fetch properties' });
  }
}

