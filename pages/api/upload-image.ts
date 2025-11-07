import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { IncomingMessage } from 'http';
import { supabase } from '@/lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: IncomingMessage): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

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
    const { files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured, using placeholder');
      const placeholderUrl = `https://placehold.co/800x600/e2e8f0/64748b?text=Image+${Date.now()}`;
      // Clean up temporary file
      if (file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      return res.status(200).json({ url: placeholderUrl });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    const filename = file.originalFilename || `image-${Date.now()}.jpg`;
    const contentType = file.mimetype || 'image/jpeg';
    
    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = filename.split('.').pop() || 'jpg';
    // File path in the bucket (without bucket name prefix)
    const uniqueFilename = `${timestamp}-${randomString}.${fileExtension}`;

    console.log('Uploading to Supabase Storage:', {
      filename: uniqueFilename,
      contentType: contentType,
      fileSize: fileBuffer.length,
      originalFilename: filename,
      bucket: 'property-images',
    });

    try {
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images') // Bucket name
        .upload(uniqueFilename, fileBuffer, {
          contentType: contentType,
          upsert: false, // Don't overwrite existing files
        });

      // Clean up temporary file
      if (file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
        
        // If bucket doesn't exist, provide helpful error
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('The resource was not found')) {
          return res.status(200).json({
            url: `https://placehold.co/800x600/e2e8f0/64748b?text=Image+${Date.now()}`,
            error: 'Storage bucket not found',
            details: 'Please create a bucket named "property-images" in your Supabase Storage',
            help: 'Go to Supabase Dashboard > Storage > Create Bucket > Name: "property-images" > Public: Yes',
          });
        }

        const fallbackUrl = `https://placehold.co/800x600/e2e8f0/64748b?text=Image+${Date.now()}`;
        return res.status(200).json({
          url: fallbackUrl,
          error: 'Supabase upload failed',
          details: uploadError.message,
        });
      }

      if (!uploadData) {
        console.error('No upload data returned from Supabase');
        const fallbackUrl = `https://placehold.co/800x600/e2e8f0/64748b?text=Image+${Date.now()}`;
        return res.status(200).json({
          url: fallbackUrl,
          error: 'No data returned from upload',
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(uniqueFilename);

      const imageUrl = urlData.publicUrl;

      console.log('✓ Image uploaded to Supabase Storage:', {
        path: uniqueFilename,
        publicUrl: imageUrl,
      });
      
      return res.status(200).json({ 
        url: imageUrl,
        path: uniqueFilename,
        success: true,
      });
    } catch (storageError: any) {
      console.error('Storage upload error:', storageError);
      // Clean up temporary file
      if (file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      const fallbackUrl = `https://placehold.co/800x600/e2e8f0/64748b?text=Image+${Date.now()}`;
      return res.status(200).json({
        url: fallbackUrl,
        error: 'Storage upload failed',
        details: storageError?.message || 'Unknown error',
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image', details: error?.message });
  }
}

