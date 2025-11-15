/**
 * Cloudinary loader for Next.js Image component
 * Uses Cloudinary's fetch mode to optimize images from Supabase Storage
 * Images remain stored in Supabase but are optimized and delivered via Cloudinary CDN
 */

interface LoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Cloudinary fetch mode loader
 * Format: https://res.cloudinary.com/<CLOUD_NAME>/image/fetch/f_auto,q_auto,w_[width]/{src}
 * 
 * @param src - Full URL to the image (should be Supabase Storage public URL)
 * @param width - Desired width in pixels
 * @param quality - Image quality (1-100, default: auto)
 * @returns Cloudinary fetch URL that optimizes the image on-the-fly
 */
export function cloudinaryLoader({ src, width, quality }: LoaderProps): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('[CLOUDINARY-LOADER] CLOUDINARY_CLOUD_NAME not set, returning original src');
    return src;
  }

  // Encode the source URL for use in Cloudinary fetch URL
  // Cloudinary fetch mode requires URL-encoded source URLs
  const encodedSrc = encodeURIComponent(src);
  
  // Build Cloudinary fetch URL
  // f_auto: automatic format selection (WebP/AVIF when supported)
  // q_auto: automatic quality optimization (or q_[quality] if specified)
  // w_[width]: resize to specified width
  const params = [
    'f_auto',           // Auto format
    `w_${width}`,       // Width
  ];
  
  // Add quality parameter
  // If quality is provided (1-100), use it; otherwise use q_auto
  if (quality && typeof quality === 'number' && quality >= 1 && quality <= 100) {
    params.push(`q_${quality}`);
  } else {
    params.push('q_auto'); // Auto quality optimization
  }

  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/fetch/${params.join(',')}/${encodedSrc}`;
  
  return cloudinaryUrl;
}

/**
 * Default export for Next.js Image component
 */
export default cloudinaryLoader;

