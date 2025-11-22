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
      propertyType, // Can be comma-separated string or single value
      propertyTypes, // Array of property types (if sent)
      bhk,
      baths,
      floors,
      sellingType,
      price,
      areaSize,
      areaUnit,
      landArea,
      landAreaUnit,
      city,
      address,
      state,
      ownerName,
      ownerNumber,
      amenities,
      images,
      status,
    } = req.body;

    // Parse property types - handle both comma-separated string and array
    const propertyTypesArray = propertyTypes && Array.isArray(propertyTypes) 
      ? propertyTypes 
      : propertyType 
        ? propertyType.split(',').map((t: string) => t.trim()).filter((t: string) => t)
        : [];
    
    // Use first property type for backward compatibility and validation
    const primaryPropertyType = propertyTypesArray[0] || propertyType || '';
    
    // Property types that don't require bedrooms/bathrooms
    const landPropertyTypes = ['plot', 'land', 'commercial land'];
    const commercialPropertyTypes = ['warehouse', 'commercial building', 'commercial space/office space'];
    
    // Check if any selected type is land or commercial
    const hasLandType = propertyTypesArray.some((type: string) => 
      landPropertyTypes.includes(type.toLowerCase())
    );
    const hasCommercialType = propertyTypesArray.some((type: string) => 
      commercialPropertyTypes.includes(type.toLowerCase())
    );
    const hasResidentialType = propertyTypesArray.some((type: string) => 
      !landPropertyTypes.includes(type.toLowerCase()) && 
      !commercialPropertyTypes.includes(type.toLowerCase())
    );
    
    const requiresBedroomsBathrooms = hasResidentialType && propertyTypesArray.length > 0;
    const isCommercialBuilding = propertyTypesArray.some((type: string) => 
      type.toLowerCase() === 'commercial building' || 
      type.toLowerCase() === 'commercial space/office space'
    );

    // Validate required fields
    const missingFields: any = {
      title: !title,
      propertyType: !primaryPropertyType || propertyTypesArray.length === 0,
      price: !price,
      city: !city,
      address: !address,
      ownerName: !ownerName,
      ownerNumber: !ownerNumber,
    };

    // Only require BHK and baths for non-land and non-commercial types
    if (requiresBedroomsBathrooms) {
      missingFields.bhk = !bhk;
      missingFields.baths = !baths;
    }

    // Require floors for Commercial Building
    if (isCommercialBuilding) {
      missingFields.floors = !floors;
    }

    const hasMissingFields = Object.values(missingFields).some(Boolean);
    if (hasMissingFields) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: missingFields
      });
    }

    // Prepare data for insertion
    // Store property types as comma-separated string in property_type
    // This allows search to find properties by any of the selected types
    const propertyTypeString = propertyTypesArray.join(',');
    
    const insertData: any = {
      title,
      content: content || '',
      property_type: propertyTypeString, // Store all types as comma-separated
      bhk: requiresBedroomsBathrooms && bhk ? parseInt(bhk) : null,
      selling_type: sellingType || 'Sale',
      price: price ? parseFloat(price) : null,
      area_size: areaSize ? parseFloat(areaSize) : null,
      area_unit: areaUnit || 'Sq. Ft.',
      land_area: landArea ? parseFloat(landArea) : null,
      land_area_unit: landAreaUnit || 'Cent',
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

    // Only include baths if provided and required
    if (requiresBedroomsBathrooms && baths) {
      insertData.baths = parseInt(baths);
    }

    // Only include floors for Commercial Building (handle "Ground Floor" as string)
    if (isCommercialBuilding && floors) {
      insertData.floors = floors === 'Ground Floor' ? 'Ground Floor' : (parseInt(floors) || null);
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Listing created (database not configured - demo mode)',
        data: insertData,
      });
    }

    // Insert into Supabase
    let { data, error } = await supabase.from('properties').insert([insertData]).select();

    // If error is due to missing 'baths' or 'floors' column, retry without it
    if (error && error.message && (error.message.includes('baths') || error.message.includes('floors'))) {
      const insertDataWithoutOptional = { ...insertData };
      if (error.message.includes('baths')) {
        delete insertDataWithoutOptional.baths;
      }
      if (error.message.includes('floors')) {
        delete insertDataWithoutOptional.floors;
      }
      
      const retryResult = await supabase.from('properties').insert([insertDataWithoutOptional]).select();
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

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Create listing error:', error);
    return res.status(500).json({ 
      error: 'Failed to create listing',
      message: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

