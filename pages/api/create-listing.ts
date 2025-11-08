import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import Cookies from 'cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication - try multiple ways to get the cookie
    let session: string | undefined;
    
    try {
      const cookies = new Cookies(req, res);
      session = cookies.get('admin_session');
    } catch (cookieError) {
      // Fallback: try reading from headers directly
      session = req.headers.cookie
        ?.split(';')
        .find((c) => c.trim().startsWith('admin_session='))
        ?.split('=')[1];
    }

    if (!session) {
      console.error('No session found. Cookies:', req.headers.cookie);
      return res.status(401).json({ error: 'Unauthorized - Please login again' });
    }

    const {
      title,
      content,
      propertyType,
      bhk,
      baths,
      sellingType,
      price,
      areaSize,
      areaUnit,
      city,
      address,
      state,
      ownerName,
      ownerNumber,
      amenities,
      images,
      status,
    } = req.body;

    // Property types that don't require bedrooms/bathrooms
    const landPropertyTypes = ['plot', 'land', 'commercial land'];
    const isLandType = propertyType && landPropertyTypes.includes(propertyType.toLowerCase());
    const requiresBedroomsBathrooms = !isLandType;

    // Validate required fields
    const missingFields: any = {
      title: !title,
      propertyType: !propertyType,
      price: !price,
      city: !city,
      address: !address,
      ownerName: !ownerName,
      ownerNumber: !ownerNumber,
    };

    // Only require BHK and baths for non-land types
    if (requiresBedroomsBathrooms) {
      missingFields.bhk = !bhk;
      missingFields.baths = !baths;
    }

    const hasMissingFields = Object.values(missingFields).some(Boolean);
    if (hasMissingFields) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: missingFields
      });
    }

    // Prepare data for insertion
    const insertData: any = {
      title,
      content: content || '',
      property_type: propertyType,
      bhk: requiresBedroomsBathrooms && bhk ? parseInt(bhk) : null,
      selling_type: sellingType || 'Sale',
      price: price ? parseFloat(price) : null,
      area_size: areaSize ? parseFloat(areaSize) : null,
      area_unit: areaUnit || 'Sq. Ft.',
      city,
      address,
      state: state || '',
      owner_name: ownerName,
      owner_number: ownerNumber,
      amenities: requiresBedroomsBathrooms ? (amenities || []) : [],
      images: images || [],
      status: status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Only include baths if provided (will be added after migration)
    if (requiresBedroomsBathrooms && baths) {
      insertData.baths = parseInt(baths);
    }

    console.log('Attempting to insert:', { ...insertData, owner_number: '***' });

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, returning success for demo');
      return res.status(200).json({
        success: true,
        message: 'Listing created (database not configured - demo mode)',
        data: insertData,
      });
    }

    // Insert into Supabase
    let { data, error } = await supabase.from('properties').insert([insertData]).select();

    // If error is due to missing 'baths' column, retry without it
    if (error && error.message && error.message.includes('baths')) {
      console.warn('Baths column not found, retrying without baths field');
      const insertDataWithoutBaths = { ...insertData };
      delete insertDataWithoutBaths.baths;
      
      const retryResult = await supabase.from('properties').insert([insertDataWithoutBaths]).select();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // If table doesn't exist, return helpful message
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return res.status(500).json({ 
          error: 'Database table not found',
          message: 'Please run the database schema SQL in your Supabase dashboard',
          details: error.message
        });
      }

      // If it's a constraint violation or other error
      return res.status(500).json({ 
        error: 'Database error',
        message: error.message,
        details: error
      });
    }

    console.log('Successfully created listing:', data);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Create listing error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to create listing',
      message: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

