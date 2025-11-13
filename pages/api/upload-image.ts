import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { IncomingMessage } from 'http';
import { supabase } from '@/lib/supabase';
import { optimizeImage, isValidImage } from '@/lib/image-optimizer';

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
      // FIXED: Use static placeholder URL without timestamp to allow caching
      // This prevents repeated Vercel image optimization for the same placeholder
      const placeholderUrl = 'https://placehold.co/800x600/e2e8f0/64748b?text=Image+Not+Available';
      // Clean up temporary file
      if (file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      // Add cache headers for placeholder responses
      res.setHeader('Cache-Control', 'public, s-maxage=31536000, stale-while-revalidate=86400');
      return res.status(200).json({ url: placeholderUrl });
    }

    // Read file buffer
    const originalBuffer = fs.readFileSync(file.filepath);
    const filename = file.originalFilename || `image-${Date.now()}.jpg`;
    const originalContentType = file.mimetype || 'image/jpeg';
    
    // Validate that it's a valid image
    const isValid = await isValidImage(originalBuffer);
    if (!isValid) {
      // Clean up temporary file
      if (file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      return res.status(400).json({ error: 'Invalid image file' });
    }

    // OPTIMIZE: Automatically optimize and reduce image size
    console.log('Optimizing image:', {
      originalSize: `${(originalBuffer.length / 1024).toFixed(2)} KB`,
      filename: filename,
    });

    const optimizationResult = await optimizeImage(originalBuffer, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 85,
      format: 'webp', // Use WebP for best compression
    });

    const optimizedBuffer = optimizationResult.buffer;
    const optimizedSize = optimizationResult.optimizedSize;
    const reductionPercent = optimizationResult.reductionPercent;

    // Determine content type based on optimized format
    const contentType = optimizationResult.format === 'webp' 
      ? 'image/webp' 
      : optimizationResult.format === 'png'
      ? 'image/png'
      : 'image/jpeg';

    // Update file extension based on optimized format
    const optimizedExtension = optimizationResult.format === 'webp' 
      ? 'webp' 
      : optimizationResult.format === 'png'
      ? 'png'
      : 'jpg';
    
    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    // File path in the bucket (without bucket name prefix)
    const uniqueFilename = `${timestamp}-${randomString}.${optimizedExtension}`;

    const originalSize = originalBuffer.length;

    console.log('Image optimization complete:', {
      originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
      optimizedSize: `${(optimizedSize / 1024).toFixed(2)} KB`,
      reduction: `${reductionPercent}%`,
      dimensions: `${optimizationResult.width}x${optimizationResult.height}`,
      format: optimizationResult.format,
    });

    console.log('Uploading to Supabase Storage:', {
      filename: uniqueFilename,
      contentType: contentType,
      fileSize: optimizedSize,
      originalFilename: filename,
      bucket: 'property-images',
    });

    try {
      // Upload optimized image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images') // Bucket name
        .upload(uniqueFilename, optimizedBuffer, {
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
          // FIXED: Use static placeholder URL without timestamp to allow caching
          const staticPlaceholderUrl = 'https://placehold.co/800x600/e2e8f0/64748b?text=Storage+Not+Configured';
          res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
          return res.status(200).json({
            url: staticPlaceholderUrl,
            error: 'Storage bucket not found',
            details: 'Please create a bucket named "property-images" in your Supabase Storage',
            help: 'Go to Supabase Dashboard > Storage > Create Bucket > Name: "property-images" > Public: Yes',
          });
        }

        // FIXED: Use static placeholder URL without timestamp to allow caching
        const fallbackUrl = 'https://placehold.co/800x600/e2e8f0/64748b?text=Upload+Failed';
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return res.status(200).json({
          url: fallbackUrl,
          error: 'Supabase upload failed',
          details: uploadError.message,
        });
      }

      if (!uploadData) {
        console.error('No upload data returned from Supabase');
        // FIXED: Use static placeholder URL without timestamp to allow caching
        const fallbackUrl = 'https://placehold.co/800x600/e2e8f0/64748b?text=Upload+Error';
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
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
        originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
        optimizedSize: `${(optimizedSize / 1024).toFixed(2)} KB`,
        reduction: `${reductionPercent}%`,
      });
      
      // FIXED: Add cache headers for successful uploads
      // Images from Supabase Storage should be cached as they're immutable
      res.setHeader('Cache-Control', 'public, s-maxage=31536000, stale-while-revalidate=86400, immutable');
      
      return res.status(200).json({ 
        url: imageUrl,
        path: uniqueFilename,
        success: true,
        optimization: {
          originalSize,
          optimizedSize,
          reductionPercent,
          format: optimizationResult.format,
          dimensions: {
            width: optimizationResult.width,
            height: optimizationResult.height,
          },
        },
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
      // FIXED: Use static placeholder URL without timestamp to allow caching
      const fallbackUrl = 'https://placehold.co/800x600/e2e8f0/64748b?text=Storage+Error';
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
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

