import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Test endpoint to check if Gemini is working
 * Call this endpoint to verify your Gemini API key is configured correctly
 * This will try multiple model names and API versions to find what works
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return res.status(200).json({
      success: false,
      message: '❌ Gemini API key is not set in environment variables',
      error: 'Missing GEMINI_API_KEY in .env.local',
      help: 'Add GEMINI_API_KEY=your-key-here to your .env.local file',
    });
  }

  try {
    console.log('[Test Gemini] Testing Gemini API connection...');
    
    // Try v1 API models only (v1beta is deprecated for new models)
    const endpoints = [
      // Primary: v1 with gemini-2.5-flash (latest, fastest, cheapest) - RECOMMENDED
      {
        url: `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        model: 'gemini-2.5-flash',
        version: 'v1',
      },
      // Alternative: v1 with gemini-2.5-pro (more capable)
      {
        url: `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`,
        model: 'gemini-2.5-pro',
        version: 'v1',
      },
      // Fallback: v1 with gemini-1.5-flash-latest (older but stable)
      {
        url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
        model: 'gemini-1.5-flash-latest',
        version: 'v1',
      },
    ];

    let lastError: any = null;
    const errors: any[] = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`[Test Gemini] Trying ${endpoint.model} (${endpoint.version})...`);
        
        const testResponse = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Say "Hello, Gemini is working!" if you can read this.'
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topP: 0.95,
              candidateCount: 1,
              maxOutputTokens: 20,
            },
          }),
        });

        if (testResponse.ok) {
          const testData = await testResponse.json();
          
          // Improved response parsing - handles different response shapes
          const cand = testData?.candidates?.[0];
          let responseText = '';
          
          if (cand) {
            const content = cand.content ?? cand;
            const parts = content.parts ?? content?.content?.parts;
            if (Array.isArray(parts) && parts.length > 0) {
              responseText = parts.map((p: any) => p.text ?? p).join('\n').trim();
            } else if (typeof content.text === 'string') {
              responseText = content.text.trim();
            } else if (typeof cand.text === 'string') {
              responseText = cand.text.trim();
            }
          }
          
          return res.status(200).json({
            success: true,
            message: '✅ Gemini is working!',
            geminiResponse: responseText,
            model: endpoint.model,
            apiVersion: endpoint.version,
            endpoint: endpoint.url.split('?')[0],
            details: {
              status: testResponse.status,
              keyLength: geminiApiKey.length,
              keyPrefix: geminiApiKey.substring(0, 10) + '...',
            },
            note: `Using ${endpoint.model} with ${endpoint.version} API. This model is now configured in your codebase.`,
          });
        } else {
          const errorText = await testResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: { message: errorText } };
          }
          
          const errorInfo = {
            model: endpoint.model,
            version: endpoint.version,
            status: testResponse.status,
            error: errorData.error?.message || errorText.substring(0, 200),
          };
          
          errors.push(errorInfo);
          lastError = errorInfo;
          console.log(`[Test Gemini] ❌ ${endpoint.model} failed:`, errorInfo.error);
        }
      } catch (err: any) {
        const errorInfo = {
          model: endpoint.model,
          version: endpoint.version,
          error: err.message,
        };
        errors.push(errorInfo);
        lastError = errorInfo;
        continue;
      }
    }
    
    // If all endpoints failed, return error with details
    return res.status(200).json({
      success: false,
      message: '❌ All Gemini API endpoints failed',
      error: lastError?.error || 'Unknown error',
      errors: errors,
      help: 'Please check: 1) Your API key is valid, 2) You have enabled Gemini API in Google Cloud Console, 3) Check available models at /api/list-gemini-models',
      suggestion: 'Visit http://localhost:3000/api/list-gemini-models to see available models for your API key',
      troubleshooting: [
        '1. Verify your API key at https://aistudio.google.com/app/apikey',
        '2. Check if Gemini API is enabled in Google Cloud Console',
        '3. Try the list models endpoint to see what models are available',
        '4. Make sure you have internet connectivity',
      ],
    });
  } catch (error: any) {
    console.error('[Test Gemini] Error:', error);
    return res.status(200).json({
      success: false,
      message: '❌ Failed to connect to Gemini API',
      error: error.message || 'Unknown error',
      type: error.name || 'Error',
      help: 'Check your internet connection and Gemini API status',
    });
  }
}
