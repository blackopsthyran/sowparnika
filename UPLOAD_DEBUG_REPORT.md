# Image Upload Debugging Report

## 📋 Files Found Related to Uploads

### Frontend Files:
1. **`pages/create-listing.tsx`** - User-facing create listing page
2. **`pages/cpanel/create-listing.tsx`** - Admin create listing page
3. **`pages/submit-listing.tsx`** - Submit listing request page
4. **`pages/cpanel/edit-listing.tsx`** - Edit existing listing page

### Backend/API Files:
1. **`pages/api/upload-image.ts`** - Main upload API endpoint (THE CRITICAL FILE)

### Configuration Files:
1. **`lib/supabase.ts`** - Client-side Supabase client
2. **`lib/supabase-server.ts`** - Server-side Supabase client helper
3. **`lib/image-optimizer.ts`** - Image optimization using Sharp
4. **`next.config.js`** - Next.js config (file size limits, API config)

---

## 🔍 File-by-File Analysis

### 1. `pages/api/upload-image.ts` (CRITICAL - Main Upload Handler)

**What it does:**
- Receives multipart/form-data file uploads via `formidable`
- Optimizes images using Sharp (resize, compress, convert to WebP)
- Uploads optimized images to Supabase Storage bucket `property-images`
- Returns public URL of uploaded image

**Where upload happens:**
- **Line 178-183**: The actual Supabase Storage upload call
  ```typescript
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(uniqueFilename, optimizedBuffer, {
      contentType: contentType,
      upsert: false,
    });
  ```

**🔴 RED FLAGS IDENTIFIED:**

1. **❌ CRITICAL: Using anon key for server-side uploads**
   - Line 58: Falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` if service role key not set
   - **Problem**: Anon key has RLS restrictions and may not have upload permissions
   - **Fix**: Must use `SUPABASE_SERVICE_ROLE_KEY` for server-side uploads

2. **❌ Error handling returns 200 status even on errors**
   - Lines 209, 224, 235, 248, 301: All return `res.status(200)` even when errors occur
   - **Problem**: Frontend sees "success" but gets placeholder URLs
   - **Fix**: Return proper error status codes (400, 403, 500)

3. **❌ Bucket verification may fail silently**
   - Lines 164-175: Checks bucket exists but error might be caught in outer try-catch
   - **Problem**: Generic "Storage Error" message doesn't show real issue
   - **Fix**: Better error propagation

4. **⚠️ File size limit: 10MB** (Line 17)
   - May be too restrictive for high-res property photos
   - Consider increasing or making configurable

5. **⚠️ Missing Content-Type header in FormData**
   - Frontend doesn't set Content-Type explicitly
   - FormData should auto-set, but worth verifying

---

### 2. `pages/create-listing.tsx` (Frontend Upload Initiator)

**What it does:**
- Collects images via drag-and-drop (react-dropzone)
- Loops through images and uploads each via `/api/upload-image`
- Collects upload errors and displays them

**Where upload happens:**
- **Lines 226-229**: Makes POST request to `/api/upload-image`
  ```typescript
  const uploadResponse = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData, // FormData with file appended
  });
  ```

**🔴 RED FLAGS IDENTIFIED:**

1. **❌ No Content-Type header set**
   - Line 226-229: Missing `Content-Type` header
   - **Problem**: Browser should auto-set `multipart/form-data`, but explicit is better
   - **Fix**: Let browser set it automatically (don't set manually for FormData)

2. **✅ GOOD: Error handling improved**
   - Lines 231-249: Now checks for `result.error` field
   - Shows detailed error messages to user

3. **⚠️ No retry logic**
   - If upload fails, it just moves to next image
   - Consider adding retry for transient failures

---

### 3. `lib/supabase.ts` (Client Config)

**What it does:**
- Creates client-side Supabase client using anon key
- Used for client-side operations (not uploads)

**Status:** ✅ Not used for uploads, so no issues here

---

### 4. `lib/image-optimizer.ts` (Image Processing)

**What it does:**
- Uses Sharp to resize, compress, and convert images
- Converts to WebP format for better compression

**Status:** ✅ Looks good, no obvious issues

---

## 🐛 Common Failure Points Identified

### 1. **Missing Service Role Key** (HIGH PRIORITY)
- **Issue**: Server-side uploads need service role key to bypass RLS
- **Symptom**: "Permission denied" or "Storage upload failed"
- **Fix**: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

### 2. **Bucket Doesn't Exist** (HIGH PRIORITY)
- **Issue**: Bucket `property-images` not created in Supabase
- **Symptom**: "Bucket not found" error
- **Fix**: Create bucket in Supabase Dashboard → Storage

### 3. **Bucket Not Public** (MEDIUM PRIORITY)
- **Issue**: Bucket exists but is private
- **Symptom**: Images upload but URLs return 403 when accessed
- **Fix**: Make bucket public in Supabase Dashboard

### 4. **Missing RLS Policies** (MEDIUM PRIORITY)
- **Issue**: If using anon key, RLS policies must allow INSERT
- **Symptom**: "new row violates row-level security"
- **Fix**: Create INSERT policy for `property-images` bucket

### 5. **File Size Limits** (LOW PRIORITY)
- **Issue**: 10MB limit may be too small for some images
- **Symptom**: Large files fail silently
- **Fix**: Increase limit or add better error message

---

## 🔧 Proposed Fixes

### Fix 1: Enhanced Error Logging in upload-image.ts

Add detailed logging at every step to see exactly where it fails.

### Fix 2: Return Proper HTTP Status Codes

Change error responses to use proper status codes instead of always 200.

### Fix 3: Better Error Messages

Include full error details in response for debugging.

### Fix 4: Verify Environment Variables

Add startup check to warn if service role key is missing.

---

## 🧪 Test Plan

### Prerequisites:
1. Supabase project set up
2. `.env.local` with required keys
3. Bucket `property-images` created and public

### Test Steps:

1. **Check Environment Variables**
   ```bash
   # In terminal, verify these exist:
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Start Dev Server with Logging**
   ```bash
   npm run dev
   ```

3. **Open Browser DevTools**
   - Network tab: Filter by "upload-image"
   - Console tab: Watch for errors

4. **Upload Test Image**
   - Go to `/create-listing`
   - Upload a small test image (< 1MB)
   - Watch Network tab for `/api/upload-image` request

5. **Check Server Logs**
   - Look for console.log messages in terminal
   - Should see: "Uploading to Supabase Storage", "✓ Image uploaded"

6. **Verify Success**
   - Response should have `success: true` and a `url` field
   - URL should be a Supabase Storage URL (not placeholder)

### Expected Success Response:
```json
{
  "url": "https://[project].supabase.co/storage/v1/object/public/property-images/1234567890-abc123.webp",
  "path": "1234567890-abc123.webp",
  "success": true,
  "optimization": { ... }
}
```

### Expected Failure Response:
```json
{
  "url": "https://placehold.co/800x600/e2e8f0/64748b?text=Storage+Error",
  "error": "Storage upload failed",
  "details": "Actual error message here"
}
```

---

## 📝 Next Steps

1. Implement enhanced logging
2. Fix HTTP status codes
3. Add environment variable validation
4. Test with actual Supabase bucket

