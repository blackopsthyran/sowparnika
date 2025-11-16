import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import Cookies from 'cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
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

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Testimonial ID is required' });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Testimonial deleted (database not configured - demo mode)',
      });
    }

    // Delete from Supabase database
    const { error } = await supabase.from('testimonials').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ 
        error: error.message,
      });
    }

    console.log('Successfully deleted testimonial:', id);
    return res.status(200).json({ 
      success: true, 
      message: 'Testimonial deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete testimonial error:', error);
    return res.status(500).json({ error: 'Failed to delete testimonial', details: error?.message });
  }
}

