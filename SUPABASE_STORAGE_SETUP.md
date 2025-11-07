# Supabase Storage Setup Guide

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"** or **"Create bucket"**
5. Configure the bucket:
   - **Name**: `property-images` (must match exactly)
   - **Public bucket**: ✅ **Enable this** (so images are publicly accessible)
   - **File size limit**: Set as needed (default is fine)
   - **Allowed MIME types**: Leave empty or add: `image/jpeg,image/png,image/webp,image/gif`
6. Click **"Create bucket"**

## Step 2: Set Up Bucket Policies (REQUIRED)

After creating the bucket, you MUST set up policies:

1. Go to **Storage** > **Policies**
2. Select the `property-images` bucket
3. Create FOUR policies (one for each operation):

### Policy 1: Public Read Access (for viewing images)
   - Click **"New Policy"**
   - **Policy name**: `Public Access` or `Allow public read`
   - **Allowed operation**: Check **SELECT** only
   - **Target roles**: Leave as "Defaults to all (public) roles"
   - **Policy definition**: Enter only this:
     ```
     bucket_id = 'property-images'
     ```
   - Click **Review** → **Save policy**

### Policy 2: Allow Uploads (for uploading images)
   - Click **"New Policy"** again
   - **Policy name**: `Allow Uploads` or `Authenticated Upload`
   - **Allowed operation**: Check **INSERT** only
   - **Target roles**: Leave as "Defaults to all (public) roles" OR select "authenticated" if you want only logged-in users
   - **Policy definition**: Enter only this:
     ```
     bucket_id = 'property-images'
     ```
   - Click **Review** → **Save policy**

### Policy 3: Allow Updates (for updating/replacing images)
   - Click **"New Policy"** again
   - **Policy name**: `Allow Updates` or `Authenticated Update`
   - **Allowed operation**: Check **UPDATE** only
   - **Target roles**: Leave as "Defaults to all (public) roles" OR select "authenticated" for better security
   - **Policy definition**: Enter only this:
     ```
     bucket_id = 'property-images'
     ```
   - Click **Review** → **Save policy**

### Policy 4: Allow Deletes (for deleting images)
   - Click **"New Policy"** again
   - **Policy name**: `Allow Deletes` or `Authenticated Delete`
   - **Allowed operation**: Check **DELETE** only
   - **Target roles**: Leave as "Defaults to all (public) roles" OR select "authenticated" for better security
   - **Policy definition**: Enter only this:
     ```
     bucket_id = 'property-images'
     ```
   - Click **Review** → **Save policy**

**Important Notes:**
- The policy definition field should ONLY contain the condition `bucket_id = 'property-images'`, NOT the full SQL statement!
- For better security, you can set INSERT, UPDATE, and DELETE policies to "authenticated" role only, so only logged-in admins can modify images
- SELECT should remain public so anyone can view the images
- You can always modify these policies later in the Supabase dashboard

## Step 3: Verify Setup

1. The bucket should appear in your Storage list
2. Make sure it's marked as **Public**
3. Try uploading an image through your app

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `property-images`
- Check that the bucket exists in your Supabase Storage dashboard
- Verify you're using the correct Supabase project

### Images not displaying
- Ensure the bucket is set to **Public**
- Check the bucket policies allow public read access
- Verify the URLs in your database are correct

### Upload permissions error
- Check your bucket policies
- Make sure RLS (Row Level Security) policies allow uploads
- Verify your Supabase API keys are correct

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

That's it! Your images will now be stored in Supabase Storage and served via Supabase CDN.

