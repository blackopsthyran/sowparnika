import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { IncomingMessage } from 'http';
import { createClient } from '@supabase/supabase-js';
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
  // Log request details for debugging on Vercel
  console.log('[UPLOAD] Request received:', {
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'user-agent': req.headers['user-agent']?.substring(0, 50),
    },
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('[UPLOAD] OPTIONS preflight request handled');
    return res.status(200).end();
  }

  // Check method - log what we received for debugging
  if (req.method !== 'POST') {
    console.error('[UPLOAD] Method not allowed:', {
      received: req.method,
      expected: 'POST',
      url: req.url,
    });
    return res.status(405).json({ 
      error: 'Method not allowed',
      received: req.method,
      expected: 'POST',
    });
  }

  console.log('[UPLOAD] Starting image upload request...');

  try {
    const { files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      console.error('[UPLOAD] No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('[UPLOAD] File received:', {
      filename: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
      filepath: file.filepath,
    });

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Use service role key for server-side uploads (bypasses RLS)
    // Fallback to anon key if service role is not available
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('[UPLOAD] Supabase configuration:', {
      hasUrl: !!supabaseUrl,
      hasServiceRoleKey,
      hasAnonKey,
      usingServiceRole: hasServiceRoleKey,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
      environment: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production',
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('[UPLOAD] Supabase not configured:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      // Clean up temporary file
      if (file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      const isProduction = process.env.NODE_ENV === 'production';
      return res.status(500).json({ 
        error: 'Storage not configured',
        details: isProduction 
          ? 'Supabase environment variables are missing in production. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your hosting platform (Vercel/Netlify/etc.) and redeploy.'
          : 'Supabase environment variables are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local',
        help: isProduction
          ? 'Go to your hosting platform (Vercel/Netlify) → Settings → Environment Variables → Add the required variables → Redeploy'
          : 'Add the variables to .env.local and restart your dev server',
      });
    }

    // Create server-side Supabase client for uploads
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('[UPLOAD] Supabase client created successfully');

    // Read file buffer
    console.log('[UPLOAD] Reading file from disk...');
    const originalBuffer = fs.readFileSync(file.filepath);
    const filename = file.originalFilename || `image-${Date.now()}.jpg`;
    const originalContentType = file.mimetype || 'image/jpeg';
    
    console.log('[UPLOAD] File read:', {
      size: `${(originalBuffer.length / 1024).toFixed(2)} KB`,
      filename,
      contentType: originalContentType,
    });
    
    // Validate that it's a valid image
    console.log('[UPLOAD] Validating image...');
    const isValid = await isValidImage(originalBuffer);
    if (!isValid) {
      console.error('[UPLOAD] Invalid image file');
      // Clean up temporary file
      if (file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      return res.status(400).json({ error: 'Invalid image file', details: 'File is not a valid image format' });
    }
    console.log('[UPLOAD] Image validation passed');

    // OPTIMIZE: Automatically optimize and reduce image size
    console.log('[UPLOAD] Starting image optimization...');
    console.log('[UPLOAD] Image details:', {
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

    console.log('[UPLOAD] Image optimization complete:', {
      originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
      optimizedSize: `${(optimizedSize / 1024).toFixed(2)} KB`,
      reduction: `${reductionPercent}%`,
      dimensions: `${optimizationResult.width}x${optimizationResult.height}`,
      format: optimizationResult.format,
    });

    console.log('[UPLOAD] Preparing Supabase Storage upload:', {
      filename: uniqueFilename,
      contentType: contentType,
      fileSize: optimizedSize,
      originalFilename: filename,
      bucket: 'property-images',
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
      usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    try {
      // Try to verify bucket exists by listing it (optional - may fail due to permissions)
      // If listing fails, we'll just try to upload directly and catch the error
      let bucketVerified = false;
      try {
        console.log('[UPLOAD] Attempting to verify bucket exists...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.warn('[UPLOAD] Could not list buckets (this is OK, will try direct upload):', {
            message: listError.message,
            statusCode: (listError as any).statusCode,
          });
          // Don't throw - we'll try direct upload instead
        } else {
          console.log('[UPLOAD] Available buckets:', buckets?.map(b => b.name) || 'none');
          
          const bucketExists = buckets?.some(bucket => bucket.name === 'property-images');
          if (bucketExists) {
            bucketVerified = true;
            console.log('[UPLOAD] ✓ Bucket "property-images" verified');
          } else {
            console.warn('[UPLOAD] Bucket "property-images" not found in list. Available buckets:', buckets?.map(b => b.name) || 'none');
            console.log('[UPLOAD] Will attempt direct upload - if bucket doesn\'t exist, upload will fail with specific error');
          }
        }
      } catch (listException) {
        console.warn('[UPLOAD] Bucket listing failed (will try direct upload):', listException);
        // Continue to direct upload attempt
      }

      if (!bucketVerified) {
        console.log('[UPLOAD] Skipping bucket verification, attempting direct upload...');
      }

      console.log('[UPLOAD] Starting upload to Supabase Storage...');
      
      // Upload optimized image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images') // Bucket name
        .upload(uniqueFilename, optimizedBuffer, {
          contentType: contentType,
          upsert: false, // Don't overwrite existing files
        });
      
      console.log('[UPLOAD] Upload response received:', {
        hasData: !!uploadData,
        hasError: !!uploadError,
        error: uploadError ? {
          message: uploadError.message,
          statusCode: (uploadError as any).statusCode,
          error: (uploadError as any).error,
        } : null,
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
        const errorStatusCode = (uploadError as any).statusCode;
        const errorCode = (uploadError as any).error;
        console.error('[UPLOAD] ❌ Supabase Storage upload error:', {
          error: uploadError,
          message: uploadError.message,
          statusCode: errorStatusCode,
          errorCode: errorCode,
          name: (uploadError as any).name,
        });
        
        // Clean up temporary file
        if (file.filepath) {
          try {
            fs.unlinkSync(file.filepath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        // If bucket doesn't exist, provide helpful error
        // Note: This error can also occur if the service role key is missing or has wrong permissions
        // errorStatusCode and errorCode are already defined above
        if (uploadError.message?.includes('Bucket not found') || 
            uploadError.message?.includes('The resource was not found') ||
            uploadError.message?.includes('does not exist') ||
            errorStatusCode === '404' ||
            errorStatusCode === 404) {
          console.error('[UPLOAD] Bucket not found error (or permission issue)');
          console.error('[UPLOAD] Full error details:', JSON.stringify(uploadError, null, 2));
          
          // Check if this might be a permission issue instead
          const mightBePermissionIssue = !hasServiceRoleKey;
          const isProduction = process.env.NODE_ENV === 'production';
          
          return res.status(404).json({
            error: 'Storage bucket not found or inaccessible',
            details: mightBePermissionIssue 
              ? isProduction
                ? 'Bucket exists but cannot be accessed. SUPABASE_SERVICE_ROLE_KEY may not be loaded. Make sure you redeployed after adding it to Vercel environment variables.'
                : 'Bucket exists but cannot be accessed. This is likely a permissions issue. Add SUPABASE_SERVICE_ROLE_KEY to your environment variables.'
              : uploadError.message || 'Bucket "property-images" does not exist or cannot be accessed',
            help: mightBePermissionIssue
              ? isProduction
                ? 'Go to Vercel → Deployments → Redeploy the latest deployment. Environment variables only load during build.'
                : 'Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart server. Get it from Supabase Dashboard > Settings > API > service_role key.'
              : 'Verify the bucket exists in Supabase Dashboard > Storage and is set to Public. If it exists, add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
            statusCode: 404,
            usingServiceRole: hasServiceRoleKey,
            actualError: uploadError.message,
            environment: process.env.NODE_ENV,
          });
        }

        // Check for permission errors
        if (uploadError.message?.includes('new row violates row-level security') ||
            uploadError.message?.includes('permission denied') ||
            uploadError.message?.toLowerCase().includes('forbidden') ||
            errorStatusCode === '403' ||
            errorStatusCode === 403) {
          const isProduction = process.env.NODE_ENV === 'production';
          console.error('[UPLOAD] Permission denied error. Using service role key:', hasServiceRoleKey, 'Environment:', process.env.NODE_ENV);
          return res.status(403).json({
            error: 'Permission denied',
            details: uploadError.message || 'Upload to storage bucket is not allowed',
            help: hasServiceRoleKey 
              ? isProduction
                ? 'Service role key is set but may not be loaded. Redeploy your application in Vercel after adding SUPABASE_SERVICE_ROLE_KEY. Also check bucket RLS policies in Supabase.'
                : 'Service role key is set but still getting permission error. Check bucket RLS policies.'
              : isProduction
                ? 'Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables and redeploy.'
                : 'Add SUPABASE_SERVICE_ROLE_KEY to your environment variables for server-side uploads, or configure RLS policies for the bucket.',
            statusCode: 403,
            usingServiceRole: hasServiceRoleKey,
            environment: process.env.NODE_ENV,
          });
        }

        // Generic upload error
        console.error('[UPLOAD] Generic upload error');
        return res.status(500).json({
          error: 'Supabase upload failed',
          details: uploadError.message || 'Unknown upload error',
          statusCode: errorStatusCode || 500,
          errorCode: errorCode,
        });
      }

      if (!uploadData) {
        console.error('[UPLOAD] ❌ No upload data returned from Supabase');
        // Clean up temporary file
        if (file.filepath) {
          try {
            fs.unlinkSync(file.filepath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        return res.status(500).json({
          error: 'No data returned from upload',
          details: 'Upload appeared to succeed but no data was returned',
        });
      }

      console.log('[UPLOAD] ✓ Upload successful, getting public URL...');
      console.log('[UPLOAD] Upload data:', {
        path: uploadData.path,
        id: uploadData.id,
        fullPath: uploadData.fullPath,
      });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(uniqueFilename);

      const imageUrl = urlData.publicUrl;

      console.log('[UPLOAD] ✅ Image uploaded successfully to Supabase Storage:', {
        path: uniqueFilename,
        publicUrl: imageUrl,
        originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
        optimizedSize: `${(optimizedSize / 1024).toFixed(2)} KB`,
        reduction: `${reductionPercent}%`,
      });
      
      // Clean up temporary file
      if (file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
          console.log('[UPLOAD] Temporary file cleaned up');
        } catch (e) {
          console.warn('[UPLOAD] Failed to clean up temporary file:', e);
        }
      }
      
      // FIXED: Add cache headers for successful uploads
      // Images from Supabase Storage should be cached as they're immutable
      res.setHeader('Cache-Control', 'public, s-maxage=31536000, stale-while-revalidate=86400, immutable');
      // Explicitly set Content-Type to ensure proper JSON parsing on Vercel
      res.setHeader('Content-Type', 'application/json');
      
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
      console.error('[UPLOAD] ❌ Storage upload exception:', {
        error: storageError,
        message: storageError?.message,
        stack: storageError?.stack,
        name: storageError?.name,
      });
      // Clean up temporary file
      if (file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      return res.status(500).json({
        error: 'Storage upload failed',
        details: storageError?.message || 'Unknown storage error',
        stack: process.env.NODE_ENV === 'development' ? storageError?.stack : undefined,
      });
    }
  } catch (error: any) {
    console.error('[UPLOAD] ❌ Fatal upload error:', {
      error: error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return res.status(500).json({ 
      error: 'Failed to upload image', 
      details: error?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
}

