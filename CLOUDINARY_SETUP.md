# Cloudinary Setup Guide

## Overview

This project uses Cloudinary's fetch mode to optimize images from Supabase Storage. Images remain stored in Supabase but are optimized and delivered via Cloudinary's CDN.

## Environment Variables

Add the following to your `.env.local` file:

```bash
# Cloudinary Configuration
# Get your cloud name from: https://cloudinary.com/console
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
```

Or add it as `CLOUDINARY_CLOUD_NAME` (without NEXT_PUBLIC_ prefix for server-side use):

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
```

**Note:** You don't need API keys or secrets for fetch mode - only the cloud name is required.

## How It Works

1. **Storage:** All images are stored in Supabase Storage bucket `property-images`
2. **Optimization:** Cloudinary fetches images from Supabase CDN and optimizes them on-the-fly
3. **Delivery:** Optimized images are delivered via Cloudinary's CDN
4. **Format:** Automatic format selection (WebP/AVIF when supported)
5. **Quality:** Automatic quality optimization

## Cloudinary Fetch URL Format

```
https://res.cloudinary.com/<CLOUD_NAME>/image/fetch/f_auto,q_auto,w_[width]/{encoded_supabase_url}
```

## Components Using Cloudinary

- `components/OptimizedImage/OptimizedImage.tsx` - Main optimized image component
- `components/LazyImage/LazyImage.tsx` - Lazy loading image component

All Next.js `<Image>` components use the Cloudinary loader automatically.

## Getting Your Cloud Name

1. Sign up for a free Cloudinary account: https://cloudinary.com/
2. Go to Dashboard: https://cloudinary.com/console
3. Copy your "Cloud name" from the dashboard
4. Add it to `.env.local` as shown above

## No Migration Required

- ✅ No need to upload images to Cloudinary
- ✅ No API keys required
- ✅ Images stay in Supabase Storage
- ✅ Cloudinary only optimizes on-the-fly

## Benefits

- **Automatic format optimization** (WebP/AVIF)
- **Automatic quality optimization**
- **Responsive image sizing**
- **Global CDN delivery**
- **No Vercel optimization costs**
- **Images remain in Supabase**

