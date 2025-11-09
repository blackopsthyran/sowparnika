import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

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
      ownerEmail,
      amenities,
      images,
      request_status,
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
      ownerEmail: !ownerEmail,
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
      state: state || 'Kerala',
      owner_name: ownerName,
      owner_number: ownerNumber,
      user_email: ownerEmail, // Store user email
      amenities: requiresBedroomsBathrooms ? (amenities || []) : [],
      images: images || [],
      request_status: request_status || 'pending', // Request status (pending, approved, rejected)
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Only include baths if provided (will be added after migration)
    if (requiresBedroomsBathrooms && baths) {
      insertData.baths = parseInt(baths);
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Listing request submitted (database not configured - demo mode)',
        data: insertData,
      });
    }

    // Insert into property_requests table (not properties table)
    // First, try property_requests table
    let { data, error } = await supabase.from('property_requests').insert([insertData]).select();
    
    // If property_requests table doesn't exist, fall back to properties table
    if (error && (error.message.includes('relation') || error.message.includes('does not exist'))) {
      // Remove request_status and user_email for fallback
      const fallbackData = { ...insertData };
      delete fallbackData.request_status;
      delete fallbackData.user_email;
      const fallbackResult = await supabase.from('properties').insert([fallbackData]).select();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    // If error is due to missing 'baths' column, retry without it
    if (error && error.message && error.message.includes('baths')) {
      const insertDataWithoutBaths = { ...insertData };
      delete insertDataWithoutBaths.baths;
      
      const retryResult = await supabase.from('property_requests').insert([insertDataWithoutBaths]).select();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      
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

    return res.status(200).json({ success: true, data, message: 'Listing request submitted successfully' });
  } catch (error: any) {
    console.error('Submit listing request error:', error);
    return res.status(500).json({ 
      error: 'Failed to submit listing request',
      message: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

