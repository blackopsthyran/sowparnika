import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

/**
 * Diagnostic endpoint to test Supabase Storage configuration
 * Call this to verify your setup before attempting uploads
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
  };

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  diagnostics.checks.env = {
    hasUrl: !!supabaseUrl,
    hasServiceRoleKey,
    hasAnonKey,
    usingServiceRole: hasServiceRoleKey,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
  };

  if (!supabaseUrl) {
    diagnostics.errors.push('NEXT_PUBLIC_SUPABASE_URL is missing');
  }
  if (!supabaseKey) {
    diagnostics.errors.push('Both SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY are missing');
  }
  if (!hasServiceRoleKey) {
    diagnostics.warnings.push('SUPABASE_SERVICE_ROLE_KEY is not set - using anon key (may have permission issues)');
  }

  // Test Supabase client connection
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      diagnostics.checks.client = {
        status: 'created',
      };

      // Try to list buckets
      try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          diagnostics.checks.bucketList = {
            status: 'error',
            error: listError.message,
            statusCode: (listError as any).statusCode,
            note: 'Cannot list buckets - this is OK, will try direct upload',
          };
          diagnostics.warnings.push('Cannot list buckets (may be permission issue, but uploads might still work)');
        } else {
          const bucketNames = buckets?.map(b => b.name) || [];
          const bucketExists = bucketNames.includes('property-images');
          
          diagnostics.checks.bucketList = {
            status: 'success',
            availableBuckets: bucketNames,
            propertyImagesExists: bucketExists,
          };

          if (!bucketExists) {
            diagnostics.errors.push('Bucket "property-images" does not exist. Create it in Supabase Dashboard > Storage');
          }
        }
      } catch (listException: any) {
        diagnostics.checks.bucketList = {
          status: 'exception',
          error: listException.message,
          note: 'Exception during bucket listing - will try direct upload',
        };
        diagnostics.warnings.push('Bucket listing threw exception (will try direct upload)');
      }

      // Try to access the bucket directly (test read)
      try {
        const { data: files, error: readError } = await supabase.storage
          .from('property-images')
          .list('', { limit: 1 });

        if (readError) {
          const errorStatusCode = (readError as any).statusCode;
          diagnostics.checks.bucketAccess = {
            status: 'error',
            error: readError.message,
            statusCode: errorStatusCode,
          };
          
          if (readError.message?.includes('not found') || errorStatusCode === 404) {
            diagnostics.errors.push('Cannot access bucket "property-images" - it may not exist');
          } else if (errorStatusCode === 403) {
            diagnostics.errors.push('Permission denied accessing bucket - check RLS policies or use service role key');
          }
        } else {
          diagnostics.checks.bucketAccess = {
            status: 'success',
            note: 'Can access bucket (read test passed)',
          };
        }
      } catch (accessException: any) {
        diagnostics.checks.bucketAccess = {
          status: 'exception',
          error: accessException.message,
        };
        diagnostics.errors.push(`Exception accessing bucket: ${accessException.message}`);
      }

    } catch (clientError: any) {
      diagnostics.checks.client = {
        status: 'error',
        error: clientError.message,
      };
      diagnostics.errors.push(`Failed to create Supabase client: ${clientError.message}`);
    }
  }

  // Check Sharp (image optimization library)
  // Note: Sharp is optional - uploads work without it (just no optimization)
  try {
    const sharp = require('sharp');
    diagnostics.checks.sharp = {
      status: 'installed',
      version: sharp.versions?.sharp || 'unknown',
      note: 'Image optimization enabled',
    };
  } catch (sharpError) {
    diagnostics.checks.sharp = {
      status: 'warning',
      error: 'Sharp not installed or not available',
      note: 'Uploads will work but images won\'t be optimized. This is OK for functionality.',
    };
    // Changed to warning instead of error since uploads can work without Sharp
    diagnostics.warnings.push('Sharp library (for image optimization) is not available - uploads will work but without optimization');
  }

  // Summary
  // Only critical errors (missing Supabase config or bucket) should block uploads
  // Sharp missing is a warning, not an error
  const hasCriticalErrors = diagnostics.errors.length > 0;
  const hasWarnings = diagnostics.warnings.length > 0;

  return res.status(hasCriticalErrors ? 500 : 200).json({
    ...diagnostics,
    summary: {
      status: hasCriticalErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
      message: hasCriticalErrors 
        ? 'Configuration has critical errors that will prevent uploads (check Supabase setup)'
        : hasWarnings
        ? 'Configuration has warnings but uploads should work (Sharp missing means no optimization)'
        : 'Configuration looks good - all systems ready',
      errorCount: diagnostics.errors.length,
      warningCount: diagnostics.warnings.length,
      uploadsWillWork: !hasCriticalErrors, // Uploads will work if no critical errors
    },
  });
}

