import type { NextApiRequest, NextApiResponse } from 'next';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Test endpoint to verify Cloudflare upload works
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

    if (!cloudflareAccountId || !cloudflareApiToken) {
      return res.status(200).json({
        error: 'Cloudflare credentials not configured',
        hasAccountId: !!cloudflareAccountId,
        hasApiToken: !!cloudflareApiToken,
      });
    }

    // Create a simple test image (1x1 pixel PNG)
    // Or we can test with a real file if one exists
    const testImagePath = path.join(process.cwd(), 'public', 'favicon.ico');
    
    if (!fs.existsSync(testImagePath)) {
      return res.status(200).json({
        error: 'No test file found',
        message: 'Create a test image file or use an existing image',
      });
    }

    const fileBuffer = fs.readFileSync(testImagePath);
    const formData = new FormData();
    
    formData.append('file', fileBuffer, {
      filename: 'test-image.ico',
      contentType: 'image/x-icon',
    });

    const formHeaders = formData.getHeaders();

    console.log('Testing Cloudflare upload with:', {
      accountId: cloudflareAccountId,
      fileSize: fileBuffer.length,
      headers: formHeaders,
    });

    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cloudflareApiToken}`,
          ...formHeaders,
        },
        body: formData as any,
      }
    );

    const responseText = await uploadResponse.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    return res.status(200).json({
      success: uploadResponse.ok,
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      response: responseData,
      message: uploadResponse.ok 
        ? 'Upload test successful!' 
        : 'Upload test failed - check the response for details',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Test failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

