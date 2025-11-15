import React, { useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinary-loader';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  className?: string;
  onError?: () => void;
  borderRadius?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  objectFit = 'cover',
  priority = false,
  className,
  onError,
  borderRadius,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleError = () => {
    setHasError(true);
    setImageSrc('https://placehold.co/800x600/e2e8f0/64748b?text=Image+Not+Available');
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If it's an external URL that Next.js Image can't optimize, use regular img
  const isExternalUrl = imageSrc && (imageSrc.startsWith('http://') || imageSrc.startsWith('https://'));

  if (hasError || !imageSrc) {
    return (
      <Box
        width={width || '100%'}
        height={height || '100%'}
        bg="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius={borderRadius}
      >
        <Image
          src="https://placehold.co/800x600/e2e8f0/64748b?text=Image+Not+Available"
          alt={alt}
          width={width || 800}
          height={height || 600}
          style={{ objectFit }}
          className={className}
          loader={undefined}
        />
      </Box>
    );
  }

  if (isExternalUrl && !imageSrc.includes('supabase.co') && !imageSrc.includes('placehold.co')) {
    // Use regular img for external URLs that Next.js can't optimize
    return (
      <Box position="relative" width={width || '100%'} height={height || '100%'} borderRadius={borderRadius} overflow="hidden">
        {isLoading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.100"
            zIndex={1}
          >
            <Spinner size="lg" color="blue.500" thickness="4px" />
          </Box>
        )}
        <Box
          as="img"
          src={imageSrc}
          alt={alt}
          width={width || '100%'}
          height={height || '100%'}
          objectFit={objectFit}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
          className={className}
        />
      </Box>
    );
  }

  // Generate Cloudinary URL if not a placeholder
  // When unoptimized: true, loader is not called automatically, so we manually transform
  const finalSrc = imageSrc?.includes('placehold.co') || imageSrc?.includes('via.placeholder.com')
    ? imageSrc
    : cloudinaryLoader({
        src: imageSrc,
        width: width || 800,
        quality: 80,
      });

  return (
    <Box position="relative" width={width || '100%'} height={height || '100%'} borderRadius={borderRadius} overflow="hidden">
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.100"
          zIndex={1}
        >
          <Spinner size="lg" color="blue.500" thickness="4px" />
        </Box>
      )}
      <Image
        src={finalSrc}
        alt={alt}
        width={width || 800}
        height={height || 600}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={className}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          objectFit: objectFit,
        }}
      />
    </Box>
  );
};

export default LazyImage;

