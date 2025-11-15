/**
 * Server-side image optimization utility using Sharp
 * Automatically optimizes and reduces image file size while maintaining quality
 */

// Dynamic import for Sharp to handle cases where it's not available
let sharp: any = null;
let sharpAvailable = false;

// Try to load Sharp at module load time
try {
  sharp = require('sharp');
  sharpAvailable = true;
} catch (error) {
  console.warn('[IMAGE-OPTIMIZER] Sharp not available:', error);
  sharpAvailable = false;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 1-100, default: 85
  format?: 'jpeg' | 'webp' | 'png' | 'avif';
  progressive?: boolean; // For JPEG
  compressionLevel?: number; // For PNG (1-9)
}

export interface OptimizationResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  originalSize: number;
  optimizedSize: number;
  reductionPercent: number;
}

/**
 * Optimize image buffer using Sharp
 * Automatically determines best format and reduces file size
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizationResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 85,
    format,
    progressive = true,
    compressionLevel = 6,
  } = options;

  const originalSize = inputBuffer.length;

  // If Sharp is not available, return original buffer
  if (!sharpAvailable || !sharp) {
    console.warn('[IMAGE-OPTIMIZER] Sharp not available, returning original buffer');
    return {
      buffer: inputBuffer,
      width: 0,
      height: 0,
      format: 'unknown',
      originalSize,
      optimizedSize: originalSize,
      reductionPercent: 0,
    };
  }

  try {
    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;
    const originalFormat = metadata.format || 'jpeg';

    // Determine output format
    // Prefer WebP for better compression, fallback to original format
    let outputFormat: 'jpeg' | 'webp' | 'png' | 'avif' = format || 'webp';
    
    // If format not specified, choose best format based on original
    if (!format) {
      if (originalFormat === 'png' && metadata.hasAlpha) {
        // Keep PNG if it has transparency
        outputFormat = 'png';
      } else {
        // Use WebP for better compression (JPEG/PNG without transparency)
        outputFormat = 'webp';
      }
    }

    // Calculate resize dimensions (maintain aspect ratio)
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (originalWidth > maxWidth || originalHeight > maxHeight) {
      const aspectRatio = originalWidth / originalHeight;
      
      if (originalWidth > originalHeight) {
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth / aspectRatio);
      } else {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * aspectRatio);
      }
    }

    // Create Sharp pipeline
    let pipeline = sharp(inputBuffer);

    // Resize if needed
    if (targetWidth !== originalWidth || targetHeight !== originalHeight) {
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Apply format-specific optimizations
    switch (outputFormat) {
      case 'webp':
        pipeline = pipeline.webp({
          quality,
          effort: 6, // Higher effort = better compression (0-6)
        });
        break;
      
      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality,
          progressive,
          mozjpeg: true, // Use mozjpeg for better compression
        });
        break;
      
      case 'png':
        pipeline = pipeline.png({
          compressionLevel,
          adaptiveFiltering: true,
          palette: true, // Use palette if possible for smaller files
        });
        break;
      
      case 'avif':
        pipeline = pipeline.avif({
          quality,
          effort: 4, // Higher effort = better compression (0-9)
        });
        break;
    }

    // Optimize and get buffer
    const optimizedBuffer = await pipeline.toBuffer();
    const optimizedSize = optimizedBuffer.length;
    const reductionPercent = ((originalSize - optimizedSize) / originalSize) * 100;

    // Get final dimensions
    const finalMetadata = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      width: finalMetadata.width || targetWidth,
      height: finalMetadata.height || targetHeight,
      format: outputFormat,
      originalSize,
      optimizedSize,
      reductionPercent: Math.round(reductionPercent * 100) / 100,
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    // Return original buffer if optimization fails
    return {
      buffer: inputBuffer,
      width: 0,
      height: 0,
      format: 'unknown',
      originalSize,
      optimizedSize: originalSize,
      reductionPercent: 0,
    };
  }
}

/**
 * Check if buffer is a valid image
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  // If Sharp is not available, do basic MIME type check
  if (!sharpAvailable || !sharp) {
    // Basic check: look for image file signatures (magic numbers)
    const signatures = [
      [0xff, 0xd8, 0xff], // JPEG
      [0x89, 0x50, 0x4e, 0x47], // PNG
      [0x47, 0x49, 0x46, 0x38], // GIF
      [0x52, 0x49, 0x46, 0x46], // WebP (RIFF header)
    ];
    
    return signatures.some(sig => {
      return sig.every((byte, index) => buffer[index] === byte);
    });
  }

  try {
    const metadata = await sharp(buffer).metadata();
    return !!metadata.format;
  } catch {
    return false;
  }
}

/**
 * Get image metadata without processing
 */
export async function getImageMetadata(buffer: Buffer) {
  if (!sharpAvailable || !sharp) {
    console.warn('[IMAGE-OPTIMIZER] Sharp not available, cannot get metadata');
    return null;
  }

  try {
    return await sharp(buffer).metadata();
  } catch (error) {
    console.error('Error getting image metadata:', error);
    return null;
  }
}

