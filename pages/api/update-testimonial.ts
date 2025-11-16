import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import Cookies from 'cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
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

    const { id, name, company, image, testimonial, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Testimonial ID is required' });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(500).json({
        error: 'Database not configured',
      });
    }

    // If updating all fields, validate required fields
    if (name !== undefined && company !== undefined && testimonial !== undefined) {
      if (!name || !company || !testimonial) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['name', 'company', 'testimonial'],
        });
      }
    }

    // Build update data object - only include fields that are provided
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (company !== undefined) {
      updateData.company = company.trim();
    }

    if (testimonial !== undefined) {
      updateData.testimonial = testimonial.trim();
    }

    if (image !== undefined) {
      updateData.image = image || '';
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const { data, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      testimonial: data,
      message: 'Testimonial updated successfully',
    });
  } catch (error: any) {
    console.error('Update testimonial error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Failed to update testimonial',
    });
  }
}

