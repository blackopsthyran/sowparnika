import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient, PROPERTY_SELECT_COLUMNS } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Set cache headers for performance (ISR-like caching)
  // Cache for 60 seconds, allow stale-while-revalidate for 5 minutes
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300, max-age=60'
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
        properties: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        message: 'Database not configured',
      });
    }

    // Use server-side Supabase client
    const supabase = createServerSupabaseClient();

    const {
      search,
      propertyType,
      sellingType,
      minPrice,
      maxPrice,
      city,
      bhk,
      status,
      featured,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = '1',
      limit = '20',
    } = req.query;


    // Use optimized column selection instead of select('*')
    let query = supabase.from('properties').select(PROPERTY_SELECT_COLUMNS, { count: 'exact' });
    
    // Note: properties table no longer has request_status column
    // All approved requests are moved to properties table and all pending/rejected are in property_requests table
    // So we don't need to filter by request_status here

    // Helper function to check if search term is about plot/land
    const isPlotOrLandSearch = (searchTerm: string): boolean => {
      const normalized = searchTerm.toLowerCase().trim();
      // Check if it contains "plot" or "land" but not "commercial land"
      const hasPlot = normalized.includes('plot');
      const hasLand = normalized.includes('land');
      const hasCommercialLand = normalized.includes('commercial land');
      
      return (hasPlot || hasLand) && !hasCommercialLand;
    };

    // Helper function to check if search is exactly "plot" or "land"
    const isExactPlotOrLand = (searchTerm: string): boolean => {
      const normalized = searchTerm.toLowerCase().trim();
      return normalized === 'plot' || normalized === 'land';
    };

    // Search filter - search in title, content, address, city, state
    // Also handle special case: if searching for "plot" or "land", filter by property types
    if (search && typeof search === 'string') {
      const normalizedSearch = search.toLowerCase().trim();
      
      // Special handling: if search contains "commercial land", filter only Commercial Land
      if (normalizedSearch.includes('commercial land')) {
        query = query.eq('property_type', 'Commercial Land');
        // If not exact match, also search in title, content, etc.
        if (normalizedSearch !== 'commercial land') {
          const searchTerm = `%${search}%`;
          query = query.or(
            `title.ilike.${searchTerm},content.ilike.${searchTerm},address.ilike.${searchTerm},city.ilike.${searchTerm},state.ilike.${searchTerm}`
          );
        }
        // If exact "commercial land", show all Commercial Land properties (no text search filter)
      }
      // Special handling: if search contains "plot" or "land" (but not "commercial land")
      else if (isPlotOrLandSearch(search)) {
        query = query.in('property_type', ['Plot', 'Land', 'Commercial Land']);
        // If not exact "plot" or "land", also search in title, content, etc.
        if (!isExactPlotOrLand(search)) {
          const searchTerm = `%${search}%`;
          query = query.or(
            `title.ilike.${searchTerm},content.ilike.${searchTerm},address.ilike.${searchTerm},city.ilike.${searchTerm},state.ilike.${searchTerm}`
          );
        }
        // If exact "plot" or "land", show all Plot, Land, and Commercial Land properties (no text search filter)
      }
      // Normal search for other terms
      else {
        const searchTerm = `%${search}%`;
        // Supabase OR query syntax: column.ilike.value,column2.ilike.value2
        // Note: Supabase requires the % wildcards to be part of the value
        query = query.or(
          `title.ilike.${searchTerm},content.ilike.${searchTerm},address.ilike.${searchTerm},city.ilike.${searchTerm},state.ilike.${searchTerm}`
        );
      }
    }

    // Property type filter - case-insensitive matching with mapping
    // Special handling for plot/land to show Plot, Land, and Commercial Land
    if (propertyType && typeof propertyType === 'string') {
      // Normalize the input: lowercase and trim
      const normalizedType = propertyType.toLowerCase().trim();
      
      // Special case: "plot" should show only Plot and Land (not Commercial Land)
      if (normalizedType === 'plot') {
        query = query.in('property_type', ['Plot', 'Land']);
      }
      // Special case: "land" should show Plot, Land, and Commercial Land
      else if (normalizedType === 'land') {
        query = query.in('property_type', ['Plot', 'Land', 'Commercial Land']);
      }
      // Special case: "commercial land" should show only Commercial Land
      else if (normalizedType === 'commercial land' || normalizedType === 'commercial lands') {
        query = query.eq('property_type', 'Commercial Land');
      }
      // For other property types, use the mapping
      else {
        // Map common variations (including plural/singular and case variations) to database values
        const propertyTypeMap: { [key: string]: string } = {
          'house': 'House',
          'villas': 'Villa',
          'villa': 'Villa',
          'flats': 'Flat',
          'flat': 'Flat',
          'warehouses': 'Warehouse',
          'warehouse': 'Warehouse',
          'commercial buildings': 'Commercial Building',
          'commercial building': 'Commercial Building',
          'apartment': 'Apartment',
          'apartments': 'Apartment',
          'studio': 'Studio',
          'penthouse': 'Penthouse',
          'townhouse': 'Townhouse',
        };
        
        // Use mapped value if available, otherwise capitalize first letter of each word
        let dbPropertyType: string;
        if (propertyTypeMap[normalizedType]) {
          dbPropertyType = propertyTypeMap[normalizedType];
        } else {
          // Capitalize first letter of each word as fallback
          dbPropertyType = propertyType
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
        
        // Use exact match with the normalized database value
        query = query.eq('property_type', dbPropertyType);
      }
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
    } else if (!featured) {
      // Default to active properties only (unless filtering by featured)
      query = query.eq('status', 'active');
    }

    // Featured filter
    if (featured && typeof featured === 'string') {
      const isFeatured = featured.toLowerCase() === 'true';
      query = query.eq('featured', isFeatured);
    }

    // Sorting
    const validSortFields = ['created_at', 'price', 'area_size', 'title'];
    const sortField = validSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : 'created_at';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    query = query.order(sortField, { ascending: order === 'asc' });

    // Pagination - Limit max to 100 per page for performance
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
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

