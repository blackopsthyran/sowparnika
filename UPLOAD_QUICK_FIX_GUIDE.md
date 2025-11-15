# Quick Fix Guide: Image Upload Failures

## 🚨 Most Common Issues & Quick Fixes

### Issue 1: "Storage upload failed" or "Permission denied"

**Root Cause:** Missing `SUPABASE_SERVICE_ROLE_KEY` or bucket RLS policies blocking uploads.

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (NOT the anon key)
3. Add to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
4. Restart your dev server

---

### Issue 2: "Bucket not found" or "Storage bucket not found"

**Root Cause:** The `property-images` bucket doesn't exist in Supabase.

**Fix:**
1. Go to Supabase Dashboard → Storage
2. Click "Create Bucket"
3. Name: `property-images` (exact match required)
4. ✅ Enable "Public bucket"
5. Click "Create"

---

### Issue 3: "Storage not configured"

**Root Cause:** Missing environment variables.

**Fix:**
Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🔍 How to Debug

### Step 1: Check Server Logs

When you upload an image, watch your terminal for logs prefixed with `[UPLOAD]`:

**Success looks like:**
```
[UPLOAD] Starting image upload request...
[UPLOAD] File received: { filename: 'photo.jpg', size: 1234567, ... }
[UPLOAD] Supabase configuration: { hasUrl: true, usingServiceRole: true, ... }
[UPLOAD] Bucket verified. Starting upload...
[UPLOAD] ✅ Image uploaded successfully to Supabase Storage: { publicUrl: '...' }
```

**Failure looks like:**
```
[UPLOAD] ❌ Supabase Storage upload error: { error: {...}, message: '...', statusCode: 403 }
```

### Step 2: Check Browser Console

Open DevTools → Console tab. Look for:
- `[FRONTEND] Image X uploaded successfully` ✅
- `[FRONTEND] Image X upload error` ❌

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "upload-image"
3. Click on the failed request
4. Check:
   - **Status Code**: Should be 200 for success, 403/404/500 for errors
   - **Response**: Should have `success: true` and a `url` field

---

## 📊 Expected Responses

### ✅ Success Response (Status 200):
```json
{
  "url": "https://[project].supabase.co/storage/v1/object/public/property-images/1234567890-abc123.webp",
  "path": "1234567890-abc123.webp",
  "success": true,
  "optimization": {
    "originalSize": 1234567,
    "optimizedSize": 234567,
    "reductionPercent": 81.0,
    "format": "webp",
    "dimensions": { "width": 1920, "height": 1080 }
  }
}
```

### ❌ Error Responses:

**403 Permission Denied:**
```json
{
  "error": "Permission denied",
  "details": "Upload to storage bucket is not allowed",
  "help": "Add SUPABASE_SERVICE_ROLE_KEY to your environment variables...",
  "statusCode": 403
}
```

**404 Bucket Not Found:**
```json
{
  "error": "Storage bucket not found",
  "details": "Please create a bucket named 'property-images'...",
  "help": "Go to Supabase Dashboard > Storage > Create Bucket...",
  "statusCode": 404
}
```

**500 Storage Not Configured:**
```json
{
  "error": "Storage not configured",
  "details": "Supabase environment variables are missing...",
  "statusCode": 500
}
```

---

## 🧪 Test Checklist

- [ ] Environment variables set in `.env.local`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is present (not just anon key)
- [ ] Bucket `property-images` exists in Supabase Dashboard
- [ ] Bucket is set to **Public**
- [ ] Dev server restarted after adding env vars
- [ ] Browser console shows `[FRONTEND]` logs
- [ ] Server terminal shows `[UPLOAD]` logs
- [ ] Network tab shows status 200 for successful uploads

---

## 🔧 What Changed

### Enhanced Logging
- All upload steps now log with `[UPLOAD]` prefix
- Frontend logs with `[FRONTEND]` prefix
- Full error details in console

### Proper HTTP Status Codes
- 200: Success
- 400: Invalid file
- 403: Permission denied
- 404: Bucket not found
- 500: Server error

### Better Error Messages
- Specific error messages for each failure type
- Help text with actionable steps
- Full error details in development mode

---

## 📝 Files Modified

1. **`pages/api/upload-image.ts`** - Enhanced logging, proper status codes
2. **`pages/create-listing.tsx`** - Better error handling
3. **`pages/cpanel/create-listing.tsx`** - Better error handling

---

## 🆘 Still Not Working?

1. **Check Supabase Dashboard:**
   - Storage → Buckets → `property-images` exists and is public
   - Settings → API → Service role key is correct

2. **Verify Environment Variables:**
   ```bash
   # In terminal (after restarting server)
   node -e "console.log(process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING')"
   ```

3. **Check Server Logs:**
   - Look for the exact error message
   - Check which step fails (bucket check, upload, etc.)

4. **Test with Small Image:**
   - Try uploading a small image (< 1MB) first
   - Large images may hit size limits

---

## 📚 Related Documentation

- `UPLOAD_DEBUG_REPORT.md` - Full technical analysis
- `SUPABASE_STORAGE_SETUP.md` - Complete setup guide

