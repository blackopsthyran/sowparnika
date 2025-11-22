# Production Upload Issues - Fix Guide

## Common Issues: Works Locally but Not in Production

### Issue 1: Missing Environment Variables in Production ⚠️ MOST COMMON

**Problem:** Environment variables are set locally (`.env.local`) but not configured in your production platform.

**Solution:**

#### If using Vercel:
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  ← CRITICAL!
   ```
4. **Important:** Make sure to select the correct **Environment** (Production, Preview, Development)
5. **Redeploy** your application after adding variables

#### If using other platforms:
- **Netlify:** Site settings → Environment variables
- **Railway:** Variables tab
- **AWS/Docker:** Add to your deployment configuration

### Issue 2: Service Role Key Not Set in Production

**Symptom:** Uploads work locally but fail in production with "Permission denied" or "Storage upload failed"

**Fix:**
1. Get your service role key from Supabase Dashboard → Settings → API
2. Add `SUPABASE_SERVICE_ROLE_KEY` to production environment variables
3. **Redeploy** (environment variables require a new deployment)

### Issue 3: Bucket Doesn't Exist or Has Wrong Permissions

**Check:**
1. Go to Supabase Dashboard → Storage
2. Verify `property-images` bucket exists
3. Make sure it's set to **Public**
4. Check bucket policies allow INSERT operations

### Issue 4: Different Supabase Project in Production

**Problem:** Production might be pointing to a different Supabase project than local.

**Fix:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` in production matches your local `.env.local`
2. Make sure the bucket exists in the production Supabase project

---

## Debugging Production Issues

### Step 1: Check Production Logs

**Vercel:**
- Go to your project → **Deployments** → Click on latest deployment → **Functions** tab
- Look for `[UPLOAD]` log messages

**Other platforms:**
- Check your platform's logging/console output

### Step 2: Use the Diagnostic Endpoint

Visit: `https://your-production-domain.com/api/test-upload-config`

This will show:
- Which environment variables are set
- If the bucket exists
- If service role key is configured
- Any configuration issues

### Step 3: Check Network Tab

1. Open browser DevTools → Network tab
2. Try uploading an image
3. Look for `/api/upload-image` request
4. Check:
   - **Status code** (should be 200 for success)
   - **Response body** (should have `success: true` and a `url`)

---

## Quick Checklist for Production

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set in production
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in production
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in production ⚠️ **CRITICAL**
- [ ] Environment variables are set for **Production** environment (not just Preview/Development)
- [ ] Application was **redeployed** after adding environment variables
- [ ] Bucket `property-images` exists in Supabase
- [ ] Bucket is set to **Public**
- [ ] Bucket has INSERT policy configured

---

## Testing After Fix

1. Visit: `https://your-domain.com/api/test-upload-config`
2. Should see: `"usingServiceRole": true` and `"errorCount": 0`
3. Try uploading an image
4. Check browser console for `[FRONTEND]` logs
5. Check production logs for `[UPLOAD]` logs

---

## Still Not Working?

1. **Check production logs** for the exact error message
2. **Compare** your local `.env.local` with production environment variables
3. **Verify** you're using the same Supabase project in both environments
4. **Test** the diagnostic endpoint to see what's missing





