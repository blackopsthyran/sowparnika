# Fix Upload Issues - Step by Step

## Issue 1: Create the Storage Bucket

The diagnostic shows: **Bucket "property-images" does not exist**

### Steps:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **"New bucket"** or **"Create bucket"**
5. Fill in:
   - **Name**: `property-images` (must be exact)
   - **Public bucket**: ✅ **Check this box** (very important!)
   - **File size limit**: Leave default or set to 10MB
   - **Allowed MIME types**: Leave empty or add: `image/jpeg,image/png,image/webp,image/gif`
6. Click **"Create bucket"**

---

## Issue 2: Add Service Role Key

The diagnostic shows: **SUPABASE_SERVICE_ROLE_KEY is not set**

### Steps:
1. In Supabase Dashboard, go to **Settings** → **API**
2. Find the **"service_role"** key (it's a secret key, different from anon key)
3. Click the eye icon to reveal it, then copy it
4. Open your `.env.local` file in the project root
5. Add this line:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   Replace `your_service_role_key_here` with the actual key you copied
6. **Restart your dev server** (stop with Ctrl+C, then run `npm run dev` again)

---

## Verify the Fix

After completing both steps:

1. **Restart your dev server** (important!)
2. Visit: `http://localhost:3000/api/test-upload-config`
3. You should see:
   - `"propertyImagesExists": true`
   - `"usingServiceRole": true`
   - `"errorCount": 0`

---

## Quick Checklist

- [ ] Bucket `property-images` created in Supabase Dashboard
- [ ] Bucket is set to **Public**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to `.env.local`
- [ ] Dev server restarted
- [ ] Diagnostic endpoint shows no errors

---

## Still Having Issues?

If the diagnostic still shows errors after following these steps:

1. **Double-check the bucket name** - Must be exactly `property-images` (lowercase, with hyphen)
2. **Verify the service role key** - Make sure you copied the `service_role` key, not the `anon` key
3. **Check for typos** in `.env.local` - No extra spaces, quotes, or line breaks
4. **Clear browser cache** and try again

