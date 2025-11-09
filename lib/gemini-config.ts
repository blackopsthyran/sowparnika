/**
 * Gemini API Configuration
 * 
 * This file centralizes the Gemini API model configuration.
 * If you need to change the model, update it here.
 */

// Default model to use - will be determined by testing
// Common options:
// - gemini-2.5-flash (recommended: latest, fastest, cheapest for v1 API)
// - gemini-2.5-pro (more capable, slightly slower)
// - gemini-1.5-flash-latest (fallback: older but stable)
// - gemini-1.5-pro-latest (fallback: older but more capable)
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
export const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || 'v1';

/**
 * Get the Gemini API endpoint URL
 */
export function getGeminiEndpoint(model?: string, apiVersion?: string): string {
  const modelName = model || GEMINI_MODEL;
  const version = apiVersion || GEMINI_API_VERSION;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  
  return `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
}

/**
 * Get Gemini API request body
 */
export function getGeminiRequestBody(prompt: string, options?: {
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
}): any {
  const { temperature = 0.7, maxOutputTokens = 1000, systemInstruction } = options || {};
  
  let fullPrompt = prompt;
  if (systemInstruction) {
    fullPrompt = `${systemInstruction}\n\n${prompt}`;
  }
  
  return {
    contents: [
      {
        parts: [
          {
            text: fullPrompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };
}

