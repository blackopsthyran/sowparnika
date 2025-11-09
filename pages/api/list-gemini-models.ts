import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Helper endpoint to list available Gemini models
 * This will help us find the correct model name to use
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
      message: '❌ Gemini API key is not set',
      error: 'Missing GEMINI_API_KEY in .env.local',
    });
  }

  try {
    // Try v1 first (latest API version)
    console.log('[List Models] Trying v1...');
    const v1Response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${geminiApiKey}`
    );

    if (v1Response.ok) {
      const v1Data = await v1Response.json();
      const models = v1Data.models || [];
      
      // Filter models that support generateContent
      const generateContentModels = models.filter((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      return res.status(200).json({
        success: true,
        apiVersion: 'v1',
        totalModels: models.length,
        generateContentModels: generateContentModels.length,
        models: models,
        modelsList: models.map((m: any) => ({
          name: m.name,
          displayName: m.displayName,
          supportedGenerationMethods: m.supportedGenerationMethods,
          supportsGenerateContent: m.supportedGenerationMethods?.includes('generateContent') || false,
        })),
        recommendedModels: generateContentModels.map((m: any) => ({
          name: m.name,
          displayName: m.displayName,
          endpoint: `https://generativelanguage.googleapis.com/v1/models/${m.name.split('/').pop()}:generateContent`,
        })),
      });
    }

    // Try v1beta if v1 fails (fallback for older API keys)
    console.log('[List Models] v1 failed, trying v1beta...');
    const v1betaResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`
    );

    if (v1betaResponse.ok) {
      const v1betaData = await v1betaResponse.json();
      const models = v1betaData.models || [];
      
      const generateContentModels = models.filter((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      return res.status(200).json({
        success: true,
        apiVersion: 'v1beta',
        totalModels: models.length,
        generateContentModels: generateContentModels.length,
        models: models,
        modelsList: models.map((m: any) => ({
          name: m.name,
          displayName: m.displayName,
          supportedGenerationMethods: m.supportedGenerationMethods,
          supportsGenerateContent: m.supportedGenerationMethods?.includes('generateContent') || false,
        })),
        recommendedModels: generateContentModels.map((m: any) => ({
          name: m.name,
          displayName: m.displayName,
          endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${m.name.split('/').pop()}:generateContent`,
        })),
        warning: 'Using v1beta API. Consider upgrading to v1 for better performance.',
      });
    }

    // If both fail, return error
    const v1ErrorText = await v1Response.text();
    const v1betaErrorText = await v1betaResponse.text();
    
    return res.status(200).json({
      success: false,
      message: '❌ Failed to list models',
      v1Error: v1ErrorText.substring(0, 500),
      v1betaError: v1betaErrorText.substring(0, 500),
      help: 'Check your API key is valid and has access to Gemini API',
    });
  } catch (error: any) {
    console.error('[List Models] Error:', error);
    return res.status(200).json({
      success: false,
      message: '❌ Failed to connect to Gemini API',
      error: error.message || 'Unknown error',
    });
  }
}

