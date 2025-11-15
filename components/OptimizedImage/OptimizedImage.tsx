import Image from 'next/image';
import { Box, BoxProps } from '@chakra-ui/react';
import { getImageSizes, getAspectRatio } from '@/lib/image-utils';
import cloudinaryLoader from '@/lib/cloudinary-loader';

interface OptimizedImageProps extends Omit<BoxProps, 'as' | 'fill'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  breakpoint?: 'card' | 'hero' | 'gallery' | 'thumbnail';
  fill?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Optimized Image component that uses Next.js Image with Supabase CDN transformations
 * Automatically optimizes images for performance
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 80,
  sizes,
  breakpoint = 'card',
  fill = false,
  objectFit = 'cover',
  onError,
  ...boxProps
}) => {
  // Get responsive sizes if not provided
  const imageSizes = sizes || getImageSizes(breakpoint);

  // Calculate aspect ratio if height not provided
  const aspectRatio = height ? undefined : getAspectRatio(breakpoint);
  const calculatedHeight = height || (width ? width / (aspectRatio || 1) : undefined);

  // Fallback placeholder
  const placeholderSrc = 'https://placehold.co/800x600/e2e8f0/64748b?text=No+Image';
  
  // Use original Supabase URL (Cloudinary loader will handle optimization)
  const imageSrc = src || placeholderSrc;
  
  // For placeholder images, skip Cloudinary (use as-is)
  const isPlaceholder = imageSrc.includes('placehold.co') || imageSrc.includes('via.placeholder.com');
  const imageWidth = width || 800;
  
  // Generate Cloudinary URL if not a placeholder
  // When unoptimized: true, loader is not called automatically, so we manually transform
  const finalSrc = isPlaceholder 
    ? imageSrc 
    : cloudinaryLoader({ 
        src: imageSrc, 
        width: imageWidth, 
        quality: quality 
      });

  if (fill) {
    return (
      <Box position="relative" width="100%" height="100%" overflow="hidden" {...boxProps}>
        <Image
          src={finalSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={imageSizes}
          style={{ objectFit }}
          onError={onError}
        />
      </Box>
    );
  }

  return (
    <Box position="relative" width={width} height={calculatedHeight} overflow="hidden" {...boxProps}>
      <Image
        src={finalSrc}
        alt={alt}
        width={imageWidth}
        height={calculatedHeight || 600}
        priority={priority}
        sizes={imageSizes}
        style={{ objectFit, width: '100%', height: '100%' }}
        onError={onError}
      />
    </Box>
  );
};

export default OptimizedImage;

