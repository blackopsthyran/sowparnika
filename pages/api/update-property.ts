import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import Cookies from 'cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
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
      return res.status(401).json({ error: 'Unauthorized - Please login again' });
    }

    const {
      id,
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

    if (!id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    // Property types that don't require bedrooms/bathrooms
    const landPropertyTypes = ['plot', 'land', 'commercial land'];
    const isLandType = propertyType && landPropertyTypes.includes(propertyType.toLowerCase());
    const requiresBedroomsBathrooms = !isLandType;

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (propertyType !== undefined) updateData.property_type = propertyType;
    if (bhk !== undefined) {
      updateData.bhk = requiresBedroomsBathrooms && bhk ? parseInt(bhk) : null;
    }
    // Only include baths if provided (will be added after migration)
    if (baths !== undefined && requiresBedroomsBathrooms && baths) {
      updateData.baths = parseInt(baths);
    }
    if (sellingType !== undefined) updateData.selling_type = sellingType;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (areaSize !== undefined) updateData.area_size = areaSize ? parseFloat(areaSize) : null;
    if (areaUnit !== undefined) updateData.area_unit = areaUnit;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (state !== undefined) updateData.state = state;
    if (ownerName !== undefined) updateData.owner_name = ownerName;
    if (ownerNumber !== undefined) updateData.owner_number = ownerNumber;
    if (amenities !== undefined) {
      updateData.amenities = requiresBedroomsBathrooms ? (Array.isArray(amenities) ? amenities : []) : [];
    }
    if (images !== undefined) {
      updateData.images = Array.isArray(images) ? images : [];
    }
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    console.log('Attempting to update property:', id, updateData);

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Property updated (database not configured - demo mode)',
        data: updateData,
      });
    }

    // Update in Supabase
    let { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select();

    // If error is due to missing 'baths' column, retry without it
    if (error && error.message && error.message.includes('baths')) {
      console.warn('Baths column not found, retrying without baths field');
      const updateDataWithoutBaths = { ...updateData };
      delete updateDataWithoutBaths.baths;
      
      const retryResult = await supabase
        .from('properties')
        .update(updateDataWithoutBaths)
        .eq('id', id)
        .select();
      
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Successfully updated property:', data);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Update property error:', error);
    return res.status(500).json({ error: 'Failed to update property', details: error?.message });
  }
}

