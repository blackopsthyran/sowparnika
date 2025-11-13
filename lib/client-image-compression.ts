/**
 * Client-side image compression utility
 * Compresses images before upload to reduce upload time and bandwidth
 * Uses Canvas API for compression
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeMB?: number; // Target max file size in MB
  outputFormat?: 'jpeg' | 'webp' | 'png';
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
}

/**
 * Compress image file on client side before upload
 * Returns a Promise that resolves with the compressed File
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeMB = 2,
    outputFormat = 'jpeg',
  } = options;

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    // If file is already small enough, return as-is
    if (originalSize <= maxSizeMB * 1024 * 1024 && file.type === `image/${outputFormat}`) {
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        reductionPercent: 0,
      });
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (maintain aspect ratio)
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }

            // If still too large, reduce quality further
            if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
              // Recursively compress with lower quality
              const newQuality = Math.max(0.1, quality - 0.1);
              compressImage(file, { ...options, quality: newQuality })
                .then(resolve)
                .catch(reject);
              return;
            }

            // Create new File from blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`),
              {
                type: `image/${outputFormat}`,
                lastModified: Date.now(),
              }
            );

            const compressedSize = compressedFile.size;
            const reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              reductionPercent: Math.round(reductionPercent * 100) / 100,
            });
          },
          `image/${outputFormat}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressionResult[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

