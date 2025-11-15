import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Cookies from 'cookies';

/**
 * Download Backup API endpoint
 * Creates a ZIP file with database backup and all images
 * Uses client-side ZIP creation approach (returns data for client to create ZIP)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Supabase not configured'
      });
    }

    console.log('[BACKUP] Starting backup download...');

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Export database
    console.log('[BACKUP] Exporting database...');
    const { data: properties, error: dbError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('[BACKUP] Database export error:', dbError);
      return res.status(500).json({ 
        error: 'Failed to export database',
        details: dbError.message 
      });
    }

    // List all images
    console.log('[BACKUP] Listing images...');
    const { data: imageFiles, error: listError } = await supabase.storage
      .from('property-images')
      .list('', {
        limit: 10000,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (listError) {
      console.error('[BACKUP] Error listing images:', listError);
      return res.status(500).json({ 
        error: 'Failed to list images',
        details: listError.message 
      });
    }

    // Create backup data structure
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        propertyCount: properties?.length || 0,
        imageCount: imageFiles?.length || 0,
      },
      database: {
        table: 'properties',
        data: properties || [],
      },
      images: imageFiles?.map(file => {
        const { data } = supabase.storage
          .from('property-images')
          .getPublicUrl(file.name);
        
        return {
          name: file.name,
          url: data.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          updated_at: file.updated_at,
        };
      }) || [],
    };

    // Return as JSON - client will download and create ZIP
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-data-${Date.now()}.json"`);
    
    console.log('[BACKUP] Backup data prepared successfully');
    return res.status(200).json(backupData);

  } catch (error: any) {
    console.error('[BACKUP] Backup download error:', error);
    return res.status(500).json({ 
      error: 'Failed to create backup', 
      details: error?.message 
    });
  }
}

