# Sharp Installation Fix for Vercel

## Issue
Sharp library is not available in production on Vercel, causing image uploads to fail or skip optimization.

## Root Cause
Sharp uses native binaries that need to be compiled for the serverless environment. Sometimes Vercel doesn't install Sharp correctly during the build process.

## Solution Applied

### 1. Made Sharp Optional with Fallback ✅
Updated `lib/image-optimizer.ts` to:
- Check if Sharp is available at module load time
- If not available, return original buffer without optimization
- Use basic image validation (magic numbers) if Sharp is unavailable

### 2. Fix Sharp Installation on Vercel

**Option A: Ensure Sharp is Installed (Recommended)**

1. **Add postinstall script to package.json** (already has one, may need to modify):
   ```json
   {
     "scripts": {
       "postinstall": "npm rebuild sharp"
     }
   }
   ```

2. **OR add .npmrc file** in project root:
   ```
   sharp_binary_host="https://github.com/lovell/sharp-libvips/releases/download"
   ```

3. **OR ensure Sharp is in dependencies** (already done ✅)
   ```json
   {
     "dependencies": {
       "sharp": "^0.34.5"
     }
   }
   ```

**Option B: Let Vercel Handle It Automatically**

Vercel should automatically install Sharp if it's in `dependencies`. If it's still not working:

1. Delete `node_modules` and `.next` locally
2. Run `npm install` to ensure Sharp builds correctly
3. Commit and push - this ensures Sharp binaries are correct for your platform
4. Vercel will rebuild during deployment

### 3. Verify Installation After Deploy

Check the diagnostic endpoint:
```
https://your-domain.com/api/test-upload-config
```

Should show:
```json
{
  "checks": {
    "sharp": {
      "status": "installed",
      "version": "0.34.5"
    }
  }
}
```

## Current Status

- ✅ Sharp is in `dependencies` (not `devDependencies`)
- ✅ Code has fallback if Sharp is unavailable
- ✅ Image uploads will work even without Sharp (just no optimization)
- ⚠️ Need to verify Sharp installs on Vercel after deployment

## Testing

1. **Deploy to Vercel**
2. **Check diagnostic endpoint**: `/api/test-upload-config`
3. **If Sharp is still not available**:
   - Try redeploying
   - Check Vercel build logs for Sharp installation errors
   - May need to add `.npmrc` or modify build command

## Alternative: Use Client-Side Compression

If Sharp continues to fail on Vercel, you can use client-side compression before upload (see `lib/client-image-compression.ts`). However, server-side optimization with Sharp is preferred for better security and control.

