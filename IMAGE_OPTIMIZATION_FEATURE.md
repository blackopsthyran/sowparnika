# Image Optimization Feature

## Overview

This project now includes automatic image optimization that reduces image file sizes while maintaining visual quality. Images are optimized both on the server-side (automatic) and can optionally be compressed on the client-side before upload.

## Features

### ✅ Server-Side Optimization (Automatic)

- **Automatic optimization** of all uploaded images
- **Format conversion** to WebP for better compression (typically 25-35% smaller than JPEG)
- **Automatic resizing** to max 1920x1920px (maintains aspect ratio)
- **Quality optimization** at 85% quality (excellent visual quality with smaller file size)
- **Transparency preservation** for PNG images with alpha channels

### ✅ Client-Side Compression (Optional)

- **Pre-upload compression** to reduce upload time and bandwidth
- **Configurable quality and dimensions**
- **Automatic format conversion**
- **Size target** - automatically reduces quality if file is still too large

## How It Works

### Server-Side Flow

1. User uploads an image
2. Server validates the image
3. **Image is automatically optimized:**
   - Resized if larger than 1920x1920px
   - Converted to WebP format (or PNG if has transparency)
   - Compressed with optimal quality settings
4. Optimized image is uploaded to Supabase Storage
5. Response includes optimization statistics

### Client-Side Flow (Optional)

1. User selects images
2. Images are compressed before upload (optional)
3. Compressed images are sent to server
4. Server performs additional optimization
5. Final optimized image is stored

## Usage

### Server-Side (Automatic)

No code changes needed! All images uploaded via `/api/upload-image` are automatically optimized.

**Response includes optimization stats:**
```json
{
  "url": "https://...",
  "success": true,
  "optimization": {
    "originalSize": 2048576,
    "optimizedSize": 512000,
    "reductionPercent": 75.0,
    "format": "webp",
    "dimensions": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

### Client-Side Compression (Optional)

To use client-side compression before upload:

```typescript
import { compressImage } from '@/lib/client-image-compression';

// Compress a single image
const result = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeMB: 2,
  outputFormat: 'jpeg',
});

console.log(`Reduced from ${result.originalSize} to ${result.compressedSize} bytes`);
console.log(`Reduction: ${result.reductionPercent}%`);

// Use compressed file for upload
const formData = new FormData();
formData.append('file', result.file);
```

**Example in a component:**

```typescript
import { compressImage } from '@/lib/client-image-compression';

const handleImageUpload = async (files: File[]) => {
  const compressedFiles = await Promise.all(
    files.map(file => compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.85,
    }))
  );

  // Upload compressed files
  for (const result of compressedFiles) {
    const formData = new FormData();
    formData.append('file', result.file);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
  }
};
```

## Configuration

### Server-Side Options

Edit `lib/image-optimizer.ts` to customize:

```typescript
const optimizationResult = await optimizeImage(buffer, {
  maxWidth: 1920,      // Max width in pixels
  maxHeight: 1920,     // Max height in pixels
  quality: 85,          // Quality 1-100 (higher = better quality, larger file)
  format: 'webp',      // 'jpeg' | 'webp' | 'png' | 'avif'
  progressive: true,   // Progressive JPEG (better for web)
  compressionLevel: 6, // PNG compression (1-9)
});
```

### Client-Side Options

```typescript
const options: CompressionOptions = {
  maxWidth: 1920,      // Max width in pixels
  maxHeight: 1920,     // Max height in pixels
  quality: 0.85,        // Quality 0.1-1.0
  maxSizeMB: 2,         // Target max file size
  outputFormat: 'jpeg', // 'jpeg' | 'webp' | 'png'
};
```

## Benefits

### Performance
- **Faster page loads** - Smaller images load faster
- **Reduced bandwidth** - Less data transferred
- **Better mobile experience** - Smaller files on slower connections

### Storage
- **Reduced storage costs** - Smaller files = less storage used
- **Faster uploads** - Smaller files upload faster

### SEO & User Experience
- **Better Core Web Vitals** - Faster LCP (Largest Contentful Paint)
- **Improved user experience** - Images load faster
- **Mobile-friendly** - Optimized for mobile data usage

## Expected Results

### Typical Reductions

- **JPEG images**: 60-80% size reduction
- **PNG images**: 70-90% size reduction (when converted to WebP)
- **Large images**: 80-95% size reduction (when resized + compressed)

### Example

- **Original**: 5MB JPEG, 4000x3000px
- **Optimized**: 500KB WebP, 1920x1440px
- **Reduction**: 90% smaller, same visual quality

## Technical Details

### Server-Side Library

Uses [Sharp](https://sharp.pixelplumbing.com/) - a high-performance Node.js image processing library:
- Fast and efficient
- Supports multiple formats (JPEG, PNG, WebP, AVIF)
- Automatic format detection
- Progressive JPEG support
- PNG optimization

### Client-Side Method

Uses HTML5 Canvas API:
- No external dependencies
- Works in all modern browsers
- Configurable quality and dimensions
- Automatic format conversion

## Monitoring

Check server logs for optimization statistics:

```
Image optimization complete: {
  originalSize: '2048.00 KB',
  optimizedSize: '512.00 KB',
  reduction: '75.00%',
  dimensions: '1920x1080',
  format: 'webp'
}
```

## Notes

- **Transparency**: PNG images with transparency are preserved as PNG (not converted to WebP)
- **Quality**: 85% quality provides excellent visual quality with significant size reduction
- **Dimensions**: Images larger than 1920x1920px are automatically resized (maintains aspect ratio)
- **Format**: WebP is used by default for best compression (widely supported in modern browsers)

## Future Enhancements

Potential improvements:
- [ ] AVIF format support (better compression than WebP)
- [ ] Automatic quality adjustment based on image content
- [ ] Batch optimization for existing images
- [ ] Image optimization API endpoint for manual optimization
- [ ] Progressive image loading with blur-up technique

