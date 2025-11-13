/**
 * Image optimization utilities for Supabase Storage
 * Converts Supabase Storage URLs to optimized CDN URLs with transformations
 */

/**
 * Check if URL is a Supabase Storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('supabase.co/storage') || url.includes('supabase.com/storage');
}

/**
 * Get optimized image URL with Supabase CDN transformations
 * @param url - Original image URL
 * @param width - Target width in pixels
 * @param quality - Image quality (1-100, default: 80)
 * @param format - Image format ('webp' | 'avif' | 'jpeg' | 'png')
 */
export function getOptimizedImageUrl(
  url: string,
  width: number,
  quality: number = 80,
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
): string {
  if (!url) return 'https://placehold.co/800x600/e2e8f0/64748b?text=No+Image';
  
  // If it's a placeholder, return as-is
  if (url.includes('placehold.co') || url.includes('via.placeholder.com')) {
    return url;
  }

  // If it's a Supabase Storage URL, add transformation parameters
  // FIXED: Query parameters are stable based on input (width, quality, format)
  // Same inputs = same URL, which allows proper caching by Vercel
  // This prevents repeated image optimizations for the same image with same dimensions
  // NOTE: If Supabase Storage doesn't support these query params, Next.js Image will handle optimization
  if (isSupabaseStorageUrl(url)) {
    const urlObj = new URL(url);
    // Only add params if they don't already exist to avoid duplicate params
    if (!urlObj.searchParams.has('width')) {
      urlObj.searchParams.set('width', width.toString());
    }
    if (!urlObj.searchParams.has('quality')) {
      urlObj.searchParams.set('quality', quality.toString());
    }
    if (format && !urlObj.searchParams.has('format')) {
      urlObj.searchParams.set('format', format);
    }
    // Enable automatic format selection (WebP/AVIF when supported)
    if (!urlObj.searchParams.has('transform')) {
      urlObj.searchParams.set('transform', 'resize');
    }
    return urlObj.toString();
  }

  // For other URLs, return as-is (could add other CDN transformations here)
  return url;
}

/**
 * Get responsive image sizes for Next.js Image component
 */
export function getImageSizes(breakpoint: 'card' | 'hero' | 'gallery' | 'thumbnail' = 'card'): string {
  switch (breakpoint) {
    case 'hero':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px';
    case 'gallery':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    case 'thumbnail':
      return '(max-width: 768px) 50vw, 200px';
    case 'card':
    default:
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }
}

/**
 * Get aspect ratio for different image types
 */
export function getAspectRatio(type: 'card' | 'hero' | 'gallery' | 'thumbnail' = 'card'): number {
  switch (type) {
    case 'hero':
      return 16 / 9;
    case 'gallery':
      return 4 / 3;
    case 'thumbnail':
      return 1; // Square thumbnails
    case 'card':
    default:
      return 4 / 3;
  }
}

