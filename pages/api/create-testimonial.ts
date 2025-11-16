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

    const { name, company, image, testimonial, status } = req.body;

    // Validate required fields
    if (!name || !company || !testimonial) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'company', 'testimonial'],
      });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(500).json({
        error: 'Database not configured',
      });
    }

    // Insert testimonial
    const { data, error } = await supabase
      .from('testimonials')
      .insert([
        {
          name: name.trim(),
          company: company.trim(),
          image: image || '',
          testimonial: testimonial.trim(),
          status: status || 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      testimonial: data,
      message: 'Testimonial created successfully',
    });
  } catch (error: any) {
    console.error('Create testimonial error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Failed to create testimonial',
    });
  }
}

