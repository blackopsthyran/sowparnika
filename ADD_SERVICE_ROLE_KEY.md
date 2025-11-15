# Add Service Role Key - Required for Uploads

## The Problem

Your bucket exists, but uploads are failing because you're using the **anon key** which doesn't have permission to upload files, even to public buckets.

## The Solution

Add the **service role key** to bypass RLS (Row Level Security) restrictions.

## Steps:

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Get the Service Role Key**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **API** in the settings menu
   - Find the **"service_role"** key section
   - Click the **eye icon** 👁️ to reveal the key
   - **Copy the entire key** (it's long, starts with `eyJ...`)

3. **Add to .env.local**
   - Open `.env.local` file in your project root
   - Add this line (replace with your actual key):
     ```env
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udHBi...
     ```
   - **Important**: 
     - No quotes around the key
     - No spaces before or after the `=`
     - Make sure it's on its own line

4. **Restart Your Dev Server**
   - Stop the server (Ctrl+C in terminal)
   - Start it again: `npm run dev`

5. **Verify It's Working**
   - Visit: `http://localhost:3000/api/test-upload-config`
   - You should see: `"usingServiceRole": true`
   - Try uploading an image again

## Why Service Role Key?

- **Anon key**: Has RLS restrictions, may not be able to upload even to public buckets
- **Service role key**: Bypasses RLS, has full access (use only on server-side!)

## Security Note

⚠️ **Never expose the service role key in client-side code!** It's only for server-side API routes (which is where we're using it).

