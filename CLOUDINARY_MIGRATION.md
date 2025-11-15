# Cloudinary Migration - Complete

## Summary

This project has been migrated from Vercel's built-in image optimization to Cloudinary's fetch mode. Images remain stored in Supabase Storage but are now optimized and delivered via Cloudinary's CDN.

## Changes Made

### 1. ✅ Next.js Configuration (`next.config.js`)

- **Set `unoptimized: true`** - Disables Vercel's built-in image optimization
- **Added Cloudinary to `remotePatterns`** - Allows images from `res.cloudinary.com`
- **Kept Supabase domains** - All Supabase storage domains still allowed
- **Removed Vercel optimization config** - No more `/_next/image` endpoint calls

### 2. ✅ Cloudinary Loader (`lib/cloudinary-loader.ts`)

Created custom loader that:
- Takes Supabase Storage URLs as input
- Transforms them to Cloudinary fetch URLs
- Format: `https://res.cloudinary.com/<CLOUD_NAME>/image/fetch/f_auto,q_auto,w_[width]/{encoded_supabase_url}`
- Handles quality parameter (1-100 or auto)
- Falls back to original URL if cloud name not configured

### 3. ✅ Updated Image Components

#### `components/OptimizedImage/OptimizedImage.tsx`
- **Removed:** Supabase URL transformation logic (`getOptimizedImageUrl`)
- **Added:** Manual Cloudinary URL transformation (since `unoptimized: true` prevents loader prop from working)
- **Kept:** All existing props (fill, sizes, priority, quality, etc.)
- **Behavior:** Transforms Supabase URLs to Cloudinary URLs before passing to Image component

#### `components/LazyImage/LazyImage.tsx`
- **Added:** Manual Cloudinary URL transformation
- **Kept:** All existing functionality (lazy loading, error handling, etc.)
- **Behavior:** Transforms URLs for Supabase images, skips Cloudinary for placeholders

### 4. ✅ Environment Variables

- **Required:** `CLOUDINARY_CLOUD_NAME` or `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- **Location:** `.env.local` (not committed to git)
- **Note:** No API keys needed for fetch mode

See `CLOUDINARY_SETUP.md` for setup instructions.

### 5. ✅ Image Utils

`lib/image-utils.ts`:
- **Removed:** `getOptimizedImageUrl()` function usage (still exists but not used)
- **Kept:** `getImageSizes()` and `getAspectRatio()` helper functions (still useful)
- **Note:** `isSupabaseStorageUrl()` still available for utility purposes

## How It Works

1. **Storage:** Images stored in Supabase Storage bucket `property-images`
2. **Source URLs:** Components receive original Supabase CDN URLs
3. **Transformation:** Cloudinary loader transforms URLs to Cloudinary fetch format
4. **Optimization:** Cloudinary fetches from Supabase and optimizes on-the-fly
5. **Delivery:** Optimized images delivered via Cloudinary CDN

## URL Flow

```
Original: https://xxx.supabase.co/storage/v1/object/public/property-images/123.webp
↓ (Cloudinary loader)
Optimized: https://res.cloudinary.com/<cloud>/image/fetch/f_auto,q_auto,w_800/https%3A%2F%2Fxxx.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fproperty-images%2F123.webp
```

## Important Notes

### Why Manual Transformation?

With `unoptimized: true` in `next.config.js`, Next.js Image component doesn't automatically call the loader prop. Therefore, we manually call `cloudinaryLoader()` in components to transform URLs before passing them to Image.

### Image Components Updated

- ✅ `components/OptimizedImage/OptimizedImage.tsx` - Main reusable component
- ✅ `components/LazyImage/LazyImage.tsx` - Lazy loading component
- ✅ All other Image components use Chakra UI's Image (not Next.js Image)

### Placeholder Images

Placeholder images (`placehold.co`, `via.placeholder.com`) skip Cloudinary optimization and use original URLs directly.

## Testing Checklist

- [ ] Add `CLOUDINARY_CLOUD_NAME` to `.env.local`
- [ ] Restart dev server
- [ ] Verify images load correctly in development
- [ ] Check browser DevTools Network tab - should see Cloudinary URLs, not `/_next/image`
- [ ] Verify images still load visually the same
- [ ] Check Cloudinary dashboard for fetch usage
- [ ] Deploy to production and verify images work

## Benefits

✅ **No Vercel optimization costs** - Images optimized by Cloudinary  
✅ **Better CDN** - Global Cloudinary CDN delivery  
✅ **Automatic format optimization** - WebP/AVIF when supported  
✅ **Automatic quality optimization** - Cloudinary optimizes quality automatically  
✅ **Images stay in Supabase** - No migration needed  
✅ **Fetch mode** - No API keys required  

## Troubleshooting

### Images not loading
1. Check `CLOUDINARY_CLOUD_NAME` is set correctly
2. Verify Cloudinary cloud name is correct in dashboard
3. Check browser console for errors
4. Verify Supabase URLs are accessible

### Still seeing `/_next/image` URLs
1. Ensure `unoptimized: true` is set in `next.config.js`
2. Restart dev server after config changes
3. Clear browser cache

### Cloudinary errors
1. Verify cloud name is correct
2. Check Cloudinary dashboard for fetch mode usage
3. Ensure fetch mode is enabled (should be by default)

