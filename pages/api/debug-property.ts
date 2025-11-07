import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Debug endpoint to check property data
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      // Get all properties
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, images')
        .limit(5);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        properties: data,
        message: 'Sample properties with image data',
      });
    }

    // Get specific property
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      property: data,
      imagesType: typeof data.images,
      imagesIsArray: Array.isArray(data.images),
      imagesLength: data.images?.length || 0,
      firstImage: data.images?.[0],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

