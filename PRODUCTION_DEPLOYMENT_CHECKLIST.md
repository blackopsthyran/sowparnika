# Production Deployment Checklist - Image Uploads

## ⚠️ CRITICAL: Environment Variables Must Be Set in Production

Your `.env.local` file is **NOT** deployed to production. You must manually add environment variables to your hosting platform.

---

## Vercel Setup (Most Common)

### Step 1: Add Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these **three** variables:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project.supabase.co
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon key)
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your service role key)
   Environment: Production, Preview, Development (select all)
   ⚠️ THIS IS THE MOST IMPORTANT ONE FOR UPLOADS!
   ```

### Step 2: Redeploy

**CRITICAL:** After adding environment variables, you **MUST** redeploy:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

**Why?** Environment variables are only loaded during build time. Existing deployments won't have the new variables.

---

## How to Verify It's Working

### Method 1: Diagnostic Endpoint

Visit: `https://your-domain.com/api/test-upload-config`

**Success looks like:**
```json
{
  "checks": {
    "env": {
      "usingServiceRole": true  ← Should be true!
    },
    "propertyImagesExists": true
  },
  "errors": [],
  "summary": {
    "status": "ok"
  }
}
```

**Failure looks like:**
```json
{
  "checks": {
    "env": {
      "usingServiceRole": false  ← Problem!
    }
  },
  "errors": ["SUPABASE_SERVICE_ROLE_KEY is not set..."]
}
```

### Method 2: Check Production Logs

1. Go to Vercel → Your Project → **Deployments**
2. Click on latest deployment → **Functions** tab
3. Look for `[UPLOAD]` log messages
4. Should see: `"usingServiceRole": true`

### Method 3: Try Uploading

1. Go to your production site
2. Try uploading an image
3. Check browser console (F12) for errors
4. Check Vercel logs for `[UPLOAD]` messages

---

## Common Mistakes

### ❌ Mistake 1: Only Setting Variables for Preview
- **Problem:** Variables set only for "Preview" environment
- **Fix:** Make sure to select **Production** when adding variables

### ❌ Mistake 2: Not Redeploying After Adding Variables
- **Problem:** Added variables but didn't redeploy
- **Fix:** Must redeploy for variables to take effect

### ❌ Mistake 3: Using Wrong Supabase Project
- **Problem:** Production pointing to different Supabase project
- **Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` matches your local setup

### ❌ Mistake 4: Missing Service Role Key
- **Problem:** Only set anon key, not service role key
- **Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` (this is critical for uploads!)

---

## Quick Test

After setting up, test with:

```bash
# Visit this URL in your production site
https://your-domain.com/api/test-upload-config
```

If it shows `"usingServiceRole": true` and `"errorCount": 0`, you're good to go!

---

## Still Not Working?

1. **Double-check** all three environment variables are set in Vercel
2. **Verify** you selected "Production" environment (not just Preview)
3. **Redeploy** your application
4. **Check** Vercel logs for `[UPLOAD]` error messages
5. **Compare** your local `.env.local` with Vercel environment variables


