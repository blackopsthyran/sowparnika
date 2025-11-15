import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Cookies from 'cookies';

/**
 * Backup API endpoint
 * Downloads database backup and all bucket images as a ZIP file
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
        error: 'Supabase not configured',
        message: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
      });
    }

    console.log('[BACKUP] Starting backup process...');

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Step 1: Export database (properties table)
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

    const databaseBackup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      table: 'properties',
      count: properties?.length || 0,
      data: properties || [],
    };

    console.log(`[BACKUP] Exported ${databaseBackup.count} properties`);

    // Step 2: List all images in bucket
    console.log('[BACKUP] Listing images in bucket...');
    const { data: imageFiles, error: listError } = await supabase.storage
      .from('property-images')
      .list('', {
        limit: 10000, // Large limit to get all images
        sortBy: { column: 'name', order: 'asc' },
      });

    if (listError) {
      console.error('[BACKUP] Error listing images:', listError);
      return res.status(500).json({ 
        error: 'Failed to list images',
        details: listError.message 
      });
    }

    console.log(`[BACKUP] Found ${imageFiles?.length || 0} images in bucket`);

    // Step 3: Download images and create ZIP
    // Note: We'll use a client-side approach with JSZip on the frontend
    // For server-side ZIP creation, we'd need archiver or jszip
    // For now, return JSON with all data and image URLs for client-side ZIP creation

    // Create a response object with all backup data
    const backupData = {
      timestamp: new Date().toISOString(),
      database: databaseBackup,
      images: imageFiles?.map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at,
        // Get public URL for each image
        url: supabase.storage
          .from('property-images')
          .getPublicUrl(file.name).data.publicUrl,
      })) || [],
      summary: {
        propertyCount: databaseBackup.count,
        imageCount: imageFiles?.length || 0,
        totalImageSize: imageFiles?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0,
      },
    };

    // Return as JSON for now - client will create ZIP
    // Alternatively, we could stream a ZIP file using archiver if installed
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`);
    
    return res.status(200).json(backupData);

  } catch (error: any) {
    console.error('[BACKUP] Backup error:', error);
    return res.status(500).json({ 
      error: 'Failed to create backup', 
      details: error?.message 
    });
  }
}

