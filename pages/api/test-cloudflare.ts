import type { NextApiRequest, NextApiResponse } from 'next';

// Test endpoint to verify Cloudflare Images configuration
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;

    const config = {
      accountId: cloudflareAccountId ? 'Set' : 'Not Set',
      apiToken: cloudflareApiToken ? 'Set' : 'Not Set',
      accountIdValue: cloudflareAccountId || 'N/A',
      apiTokenPreview: cloudflareApiToken 
        ? `${cloudflareApiToken.substring(0, 10)}...` 
        : 'N/A',
    };

    // Test Cloudflare API connection
    if (cloudflareAccountId && cloudflareApiToken) {
      try {
        const testResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/images/v1`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${cloudflareApiToken}`,
            },
          }
        );

        const testData = await testResponse.json();

        return res.status(200).json({
          config,
          cloudflareConnection: testResponse.ok ? 'Connected' : 'Failed',
          cloudflareResponse: testData,
          message: testResponse.ok 
            ? 'Cloudflare Images API is accessible' 
            : 'Cloudflare Images API connection failed',
        });
      } catch (error: any) {
        return res.status(200).json({
          config,
          cloudflareConnection: 'Error',
          error: error.message,
          message: 'Failed to connect to Cloudflare Images API',
        });
      }
    } else {
      return res.status(200).json({
        config,
        cloudflareConnection: 'Not Configured',
        message: 'Cloudflare credentials not set in environment variables',
      });
    }
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Test failed',
      message: error.message 
    });
  }
}

