import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Test endpoint to verify Supabase Storage bucket
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({
        error: 'Supabase not configured',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
    }

    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    // Test 2: Check if property-images bucket exists
    const propertyImagesBucket = buckets?.find((b) => b.name === 'property-images');

    // Test 3: Try to list files in the bucket (if it exists)
    let filesList = null;
    let filesError = null;
    if (propertyImagesBucket) {
      const { data: files, error: listError } = await supabase.storage
        .from('property-images')
        .list('property-images', {
          limit: 5,
          offset: 0,
        });
      filesList = files;
      filesError = listError;
    }

    // Test 4: Try to get a public URL (test URL generation)
    const testPath = 'property-images/test-image.jpg';
    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(testPath);

    return res.status(200).json({
      supabaseConfigured: true,
      buckets: {
        total: buckets?.length || 0,
        list: buckets?.map((b) => ({ name: b.name, public: b.public })) || [],
        error: bucketsError?.message,
      },
      propertyImagesBucket: propertyImagesBucket
        ? {
            name: propertyImagesBucket.name,
            public: propertyImagesBucket.public,
            id: propertyImagesBucket.id,
            created_at: propertyImagesBucket.created_at,
          }
        : null,
      files: {
        count: filesList?.length || 0,
        sample: filesList?.slice(0, 3) || [],
        error: filesError?.message,
      },
      urlGeneration: {
        testPath: testPath,
        publicUrl: urlData.publicUrl,
        urlFormat: 'Correct' + (urlData.publicUrl.includes('/storage/v1/object/public/') ? ' ✓' : ' ✗'),
      },
      recommendations: propertyImagesBucket
        ? propertyImagesBucket.public
          ? 'Bucket exists and is public - ready to use!'
          : 'Bucket exists but is NOT public - enable "Public bucket" in Supabase Dashboard'
        : 'Bucket "property-images" not found - create it in Supabase Dashboard > Storage',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Test failed',
      message: error.message,
    });
  }
}

