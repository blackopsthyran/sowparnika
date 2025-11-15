# How to Check Vercel Logs - Complete Guide

## Method 1: Via Vercel Dashboard (Easiest)

### Step 1: Access Your Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (`sowparnikaproperties`)

### Step 2: View Deployment Logs
1. Click on the **"Deployments"** tab (top menu)
2. Click on your **latest deployment** (the one at the top)
3. Click on the **"Functions"** tab
4. Find the function: `api/upload-image.ts` (or `api/upload-image`)
5. Click on it to see logs for that function

### Step 3: View Real-time Logs
1. In the Functions tab, you'll see logs in real-time
2. Look for logs starting with `[UPLOAD]` prefix
3. These logs show what's happening during image uploads

### Step 4: Filter Logs
- Use the search box to filter by keyword (e.g., "UPLOAD", "error", "405")
- Use the time range selector to view logs from specific time periods

---

## Method 2: Via Vercel CLI (More Advanced)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Link Your Project
```bash
cd your-project-directory
vercel link
```

### Step 4: View Logs
```bash
# View all logs
vercel logs

# View logs for specific function
vercel logs --function api/upload-image

# Follow logs in real-time (like tail -f)
vercel logs --follow

# Filter by output
vercel logs | grep UPLOAD
```

---

## Method 3: Via Vercel API (For Advanced Users)

You can use the Vercel API to fetch logs programmatically.

**API Endpoint:** `https://api.vercel.com/v2/deployments/{deploymentId}/events`

**Headers:**
- `Authorization: Bearer YOUR_VERCEL_TOKEN`
- Get your token from: Vercel Dashboard → Settings → Tokens

---

## What to Look For in Logs

### Good Logs (Successful Upload):
```
[UPLOAD] Request received: { method: 'POST', ... }
[UPLOAD] Starting image upload request...
[UPLOAD] File received: { filename: 'image.jpg', ... }
[UPLOAD] Supabase configuration: { usingServiceRole: true, ... }
[UPLOAD] ✓ Upload successful, getting public URL...
[UPLOAD] ✅ Image uploaded successfully to Supabase Storage
```

### Bad Logs (Error):
```
[UPLOAD] Method not allowed: { received: 'GET', expected: 'POST' }
[UPLOAD] ❌ Supabase Storage upload error: ...
[UPLOAD] ❌ Fatal upload error: ...
```

---

## Debugging 405 Error Specifically

When you see a 405 error, check logs for:

1. **Method Mismatch:**
   ```
   [UPLOAD] Request received: { method: 'GET', ... }  ← Wrong method!
   [UPLOAD] Method not allowed: { received: 'GET', expected: 'POST' }
   ```

2. **Missing Request:**
   - If you don't see `[UPLOAD] Request received` at all, the route might not be deployed or accessible

3. **CORS Issues:**
   - Look for preflight OPTIONS requests
   - Should see: `[UPLOAD] OPTIONS preflight request handled`

---

## Quick Debugging Steps

1. **Check if route exists:**
   - Visit: `https://www.sowparnikaproperties.com/api/upload-image` in browser
   - Should return JSON error (not 404)

2. **Check deployment:**
   - Go to Vercel → Deployments → Latest
   - Verify `api/upload-image.ts` is listed in Functions tab

3. **Check environment variables:**
   - Go to Vercel → Settings → Environment Variables
   - Verify all required variables are set for **Production** environment

4. **Redeploy:**
   - After checking logs and making changes, redeploy
   - Go to Deployments → Click "..." → Redeploy

---

## Common Log Patterns

### Pattern 1: Route Not Found
**Logs:** No `[UPLOAD]` logs at all
**Fix:** Verify file exists at `pages/api/upload-image.ts` and redeploy

### Pattern 2: Method Wrong
**Logs:** `[UPLOAD] Method not allowed: { received: 'GET', ... }`
**Fix:** Check client code is using `method: 'POST'`

### Pattern 3: Timeout
**Logs:** Request starts but never completes
**Fix:** Check function timeout limits, optimize image processing

### Pattern 4: Environment Variable Missing
**Logs:** `[UPLOAD] Supabase not configured`
**Fix:** Add environment variables in Vercel and redeploy

---

## Tips

- **Export logs:** You can copy/paste logs from Vercel dashboard
- **Time stamps:** All logs include timestamps for correlation
- **Log retention:** Vercel keeps logs for limited time (usually 7-30 days)
- **Multiple environments:** Make sure to check Production logs, not Preview

---

## Need More Help?

If logs don't show up:
1. Make sure you're checking the **correct deployment** (latest production)
2. Verify the function is actually being called (check Network tab in browser)
3. Try redeploying to ensure latest code is deployed
4. Check if there are any build errors in the deployment logs

