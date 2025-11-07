# Setup Instructions for Admin Login and Create Listing Feature

## Prerequisites

1. Node.js and npm installed
2. Supabase account (or Neon database)
3. Cloudflare account with Images enabled (optional)

## Installation

1. Install dependencies (already done):
```bash
npm install
```

## Environment Variables

Create a `.env.local` file in the `real-estate-main` directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Credentials
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password

# Cloudflare Images Configuration (Optional)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

## Database Setup

1. **For Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `database-schema.sql` to create the properties table

2. **For Neon:**
   - Connect to your Neon database
   - Run the SQL from `database-schema.sql` to create the properties table

## Cloudflare Images Setup (Optional)

1. Go to Cloudflare Dashboard
2. Navigate to Images
3. Get your Account ID and API Token
4. Add them to your `.env.local` file

If Cloudflare is not configured, the app will use placeholder images.

## Running the Application

```bash
npm run dev
```

## Features

### Admin Login
- Navigate to `/login`
- Use the admin email and password from your `.env.local`
- Only authenticated admins can access the create listing page

### Create Listing
- After logging in, click "CREATE LISTING" in the navigation
- Fill out all the form fields:
  - Basic Information (Title, Content, Property Type, BHK, Selling Type)
  - Price & Location
  - Owner Details
  - Features & Amenities
  - Images & Status
- Submit the form to save to the database

## Notes

- The app will work without Supabase/Cloudflare configured (using fallbacks)
- For production, make sure to configure all environment variables
- The admin credentials are checked against environment variables for security

