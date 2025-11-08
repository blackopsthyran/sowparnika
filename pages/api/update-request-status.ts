import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import Cookies from 'cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT' && req.method !== 'PATCH' && req.method !== 'DELETE') {
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

    const {
      id,
      request_status,
      status,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Property request ID is required' });
    }

    if (!request_status || !['pending', 'approved', 'rejected'].includes(request_status)) {
      return res.status(400).json({ error: 'Invalid request_status. Must be pending, approved, or rejected' });
    }

    console.log('Attempting to update request status:', id, request_status);

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Request status updated (database not configured - demo mode)',
      });
    }

    // First, fetch the request from property_requests table
    const { data: requestData, error: fetchError } = await supabase
      .from('property_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching request:', fetchError);
      // If table doesn't exist, return error
      if (fetchError.message.includes('relation') || fetchError.message.includes('does not exist')) {
        return res.status(500).json({
          error: 'Property requests table not found',
          message: 'Please run the migration SQL to create the property_requests table',
        });
      }
      return res.status(500).json({ error: 'Request not found', details: fetchError.message });
    }

    if (!requestData) {
      return res.status(404).json({ error: 'Property request not found' });
    }

    if (request_status === 'approved') {
      // Move data to properties table
      const propertyData: any = {
        title: requestData.title,
        content: requestData.content,
        property_type: requestData.property_type,
        bhk: requestData.bhk,
        baths: requestData.baths,
        selling_type: requestData.selling_type || 'Sale',
        price: requestData.price,
        area_size: requestData.area_size,
        area_unit: requestData.area_unit || 'Sq. Ft.',
        city: requestData.city,
        address: requestData.address,
        state: requestData.state || 'Kerala',
        owner_name: requestData.owner_name,
        owner_number: requestData.owner_number,
        amenities: requestData.amenities || [],
        images: requestData.images || [],
        status: status || 'active',
        created_at: requestData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Remove fields that don't exist in properties table
      delete propertyData.request_status;
      delete propertyData.user_email;

      console.log('Inserting approved request into properties table:', { ...propertyData, owner_number: '***' });

      // Insert into properties table
      const { data: insertedProperty, error: insertError } = await supabase
        .from('properties')
        .insert([propertyData])
        .select();

      if (insertError) {
        console.error('Error inserting into properties:', insertError);
        // If baths column doesn't exist, retry without it
        if (insertError.message && insertError.message.includes('baths')) {
          console.warn('Baths column not found in properties table, retrying without baths');
          delete propertyData.baths;
          const retryResult = await supabase
            .from('properties')
            .insert([propertyData])
            .select();
          
          if (retryResult.error) {
            return res.status(500).json({ error: 'Failed to approve request', details: retryResult.error.message });
          }
        } else {
          return res.status(500).json({ error: 'Failed to approve request', details: insertError.message });
        }
      }

      // Delete from property_requests table
      const { error: deleteError } = await supabase
        .from('property_requests')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting from property_requests:', deleteError);
        // Even if delete fails, the property was approved, so return success
        console.warn('Warning: Request was approved but could not be deleted from property_requests table');
      }

      console.log('Successfully approved and moved request to properties table');
      return res.status(200).json({
        success: true,
        message: 'Request approved and moved to properties table',
        data: insertedProperty,
      });

    } else if (request_status === 'rejected') {
      // Simply delete from property_requests table
      const { error: deleteError } = await supabase
        .from('property_requests')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting rejected request:', deleteError);
        return res.status(500).json({ error: 'Failed to reject request', details: deleteError.message });
      }

      console.log('Successfully rejected and deleted request');
      return res.status(200).json({
        success: true,
        message: 'Request rejected and deleted',
      });

    } else {
      // For pending status (shouldn't normally happen, but handle it)
      const updateData: any = {
        request_status: request_status,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('property_requests')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating request status:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        data,
        message: 'Request status updated successfully',
      });
    }
  } catch (error: any) {
    console.error('Update request status error:', error);
    return res.status(500).json({ error: 'Failed to update request status', details: error?.message });
  }
}
