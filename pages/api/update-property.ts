import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import Cookies from 'cookies';
import { deleteImagesFromStorage } from '@/lib/image-cleanup';

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
      featured,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    // Parse property types - handle both comma-separated string and single value
    const propertyTypesArray = propertyType
      ? (Array.isArray(propertyType) ? propertyType : propertyType.split(',').map((t: string) => t.trim()).filter((t: string) => t))
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

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (propertyType !== undefined) {
      // Store property types as comma-separated string
      const propertyTypeString = propertyTypesArray.length > 0 
        ? propertyTypesArray.join(',')
        : propertyType;
      updateData.property_type = propertyTypeString;
    }
    if (bhk !== undefined) {
      updateData.bhk = requiresBedroomsBathrooms && bhk ? parseInt(bhk) : null;
    }
    // Only include baths if provided and required
    if (baths !== undefined) {
      if (requiresBedroomsBathrooms && baths) {
        updateData.baths = parseInt(baths);
      } else {
        updateData.baths = null;
      }
    }
    
    // Only include floors for Commercial Building (handle "Ground Floor" as string)
    if (floors !== undefined) {
      if (isCommercialBuilding && floors) {
        updateData.floors = floors === 'Ground Floor' ? 'Ground Floor' : (parseInt(floors) || null);
      } else {
        updateData.floors = null;
      }
    }
    
    if (sellingType !== undefined) updateData.selling_type = sellingType;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (areaSize !== undefined) updateData.area_size = areaSize ? parseFloat(areaSize) : null;
    if (areaUnit !== undefined) updateData.area_unit = areaUnit;
    if (landArea !== undefined) updateData.land_area = landArea ? parseFloat(landArea) : null;
    if (landAreaUnit !== undefined) updateData.land_area_unit = landAreaUnit;
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
    if (featured !== undefined) updateData.featured = featured === true || featured === 'true';
    updateData.updated_at = new Date().toISOString();

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Property updated (database not configured - demo mode)',
        data: updateData,
      });
    }

    // If images are being updated, delete removed images from storage
    let imageDeletionResult: { successCount: number; errorCount: number; errors: string[] } = { 
      successCount: 0, 
      errorCount: 0, 
      errors: [] as string[] 
    };
    if (images !== undefined && Array.isArray(images)) {
      // Get current property images
      const { data: currentProperty } = await supabase
        .from('properties')
        .select('images')
        .eq('id', id)
        .single();

      if (currentProperty?.images && Array.isArray(currentProperty.images)) {
        // Find images that were removed
        const removedImages = currentProperty.images.filter(
          (oldImage: string) => !images.includes(oldImage)
        );

        if (removedImages.length > 0) {
          console.log(`[UPDATE-PROPERTY] Deleting ${removedImages.length} removed images for property ${id}`);
          imageDeletionResult = await deleteImagesFromStorage(
            removedImages,
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          );
          console.log(`[UPDATE-PROPERTY] Image deletion result: ${imageDeletionResult.successCount} deleted, ${imageDeletionResult.errorCount} errors`);
        }
      }
    }

    // Update in Supabase
    let { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select();

    // If error is due to missing 'baths' or 'floors' column, retry without it
    if (error && error.message && (error.message.includes('baths') || error.message.includes('floors'))) {
      const updateDataWithoutOptional = { ...updateData };
      if (error.message.includes('baths')) {
        delete updateDataWithoutOptional.baths;
      }
      if (error.message.includes('floors')) {
        delete updateDataWithoutOptional.floors;
      }
      
      const retryResult = await supabase
        .from('properties')
        .update(updateDataWithoutOptional)
        .eq('id', id)
        .select();
      
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ 
        error: error.message,
        imagesDeleted: imageDeletionResult.successCount,
        imageErrors: imageDeletionResult.errorCount > 0 ? imageDeletionResult.errors : undefined,
      });
    }

    return res.status(200).json({ 
      success: true, 
      data,
      imagesDeleted: imageDeletionResult.successCount,
      imageErrors: imageDeletionResult.errorCount > 0 ? imageDeletionResult.errors : undefined,
    });
  } catch (error: any) {
    console.error('Update property error:', error);
    return res.status(500).json({ error: 'Failed to update property', details: error?.message });
  }
}

