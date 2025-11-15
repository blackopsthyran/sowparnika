/**
 * Utility functions for cleaning up images from Supabase Storage
 * Used when deleting listings or removing images from listings
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Extract file path from Supabase Storage URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/property-images/123456-abc.webp
 * Returns: 123456-abc.webp
 */
export function extractFilePathFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Check if it's a Supabase Storage URL
    if (url.includes('/storage/v1/object/public/property-images/')) {
      // Extract the filename from the URL
      const parts = url.split('/property-images/');
      if (parts.length > 1) {
        // Get everything after /property-images/ and before any query params
        const filename = parts[1].split('?')[0].split('#')[0];
        return filename;
      }
    }
    
    // Also handle direct bucket URLs
    if (url.includes('property-images')) {
      const match = url.match(/property-images[\/]([^\/\?#]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If URL doesn't match expected pattern, try to extract the last part
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && !lastPart.includes('?')) {
      return lastPart;
    }

    return null;
  } catch (error) {
    console.error('[IMAGE-CLEANUP] Error extracting file path:', error);
    return null;
  }
}

/**
 * Delete a single image from Supabase Storage
 */
export async function deleteImageFromStorage(
  imageUrl: string | null | undefined,
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<{ success: boolean; error?: string }> {
  if (!imageUrl) {
    return { success: true }; // Nothing to delete
  }

  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) {
    console.warn('[IMAGE-CLEANUP] Could not extract file path from URL:', imageUrl);
    return { success: false, error: 'Invalid image URL format' };
  }

  try {
    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('[IMAGE-CLEANUP] Supabase credentials not configured');
      return { success: false, error: 'Supabase not configured' };
    }

    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase.storage
      .from('property-images')
      .remove([filePath]);

    if (error) {
      console.error('[IMAGE-CLEANUP] Error deleting image:', filePath, error);
      // Don't fail if image doesn't exist (might have been deleted already)
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.warn('[IMAGE-CLEANUP] Image not found (may have been deleted already):', filePath);
        return { success: true }; // Consider this a success
      }
      return { success: false, error: error.message };
    }

    console.log('[IMAGE-CLEANUP] Successfully deleted image:', filePath);
    return { success: true };
  } catch (error: any) {
    console.error('[IMAGE-CLEANUP] Exception deleting image:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

/**
 * Delete multiple images from Supabase Storage
 */
export async function deleteImagesFromStorage(
  imageUrls: (string | null | undefined)[],
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
  const results = {
    successCount: 0,
    errorCount: 0,
    errors: [] as string[],
  };

  // Filter out null/undefined values
  const validUrls = imageUrls.filter((url): url is string => !!url);
  
  if (validUrls.length === 0) {
    return results;
  }

  // Extract file paths
  const filePaths: string[] = [];
  for (const url of validUrls) {
    const path = extractFilePathFromUrl(url);
    if (path) {
      filePaths.push(path);
    } else {
      console.warn('[IMAGE-CLEANUP] Could not extract path from URL:', url);
      results.errorCount++;
      results.errors.push(`Invalid URL: ${url.substring(0, 50)}...`);
    }
  }

  if (filePaths.length === 0) {
    return results;
  }

  try {
    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('[IMAGE-CLEANUP] Supabase credentials not configured');
      results.errorCount = filePaths.length;
      results.errors.push('Supabase not configured');
      return results;
    }

    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Delete all files in one batch (more efficient)
    const { data, error } = await supabase.storage
      .from('property-images')
      .remove(filePaths);

    if (error) {
      console.error('[IMAGE-CLEANUP] Error deleting images:', error);
      
      // Try deleting individually if batch fails
      console.log('[IMAGE-CLEANUP] Attempting individual deletions...');
      for (const filePath of filePaths) {
        const result = await deleteImageFromStorage(
          `property-images/${filePath}`,
          url,
          key
        );
        if (result.success) {
          results.successCount++;
        } else {
          results.errorCount++;
          results.errors.push(`${filePath}: ${result.error || 'Unknown error'}`);
        }
      }
    } else {
      // Batch delete succeeded
      const deletedCount = data?.length || filePaths.length;
      results.successCount = deletedCount;
      
      // Check if any failed
      const failed = filePaths.length - deletedCount;
      if (failed > 0) {
        results.errorCount = failed;
        results.errors.push(`${failed} images may not have been deleted`);
      }
      
      console.log(`[IMAGE-CLEANUP] Successfully deleted ${results.successCount} images`);
    }

    return results;
  } catch (error: any) {
    console.error('[IMAGE-CLEANUP] Exception deleting images:', error);
    results.errorCount = filePaths.length;
    results.errors.push(error?.message || 'Unknown error');
    return results;
  }
}

/**
 * Delete all images for a property listing
 */
export async function deletePropertyImages(
  propertyImages: string[] | null | undefined,
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
  if (!propertyImages || !Array.isArray(propertyImages) || propertyImages.length === 0) {
    return { successCount: 0, errorCount: 0, errors: [] };
  }

  return deleteImagesFromStorage(propertyImages, supabaseUrl, supabaseKey);
}

