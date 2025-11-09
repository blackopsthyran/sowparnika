import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, propertyType, city, price, bhk, baths, areaSize, areaUnit, type } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Strip HTML tags from input text for processing
    const plainText = text.replace(/<[^>]*>/g, '').trim();

    if (plainText.length === 0) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    // Determine if this is a title or description enhancement
    const isTitle = type === 'title';

    // Build context for better enhancement
    const context = [];
    if (propertyType) context.push(`Property Type: ${propertyType}`);
    if (city) context.push(`Location: ${city}`);
    if (price) context.push(`Price: ₹${parseFloat(price).toLocaleString('en-IN')}`);
    if (bhk) context.push(`Bedrooms: ${bhk} BHK`);
    if (baths) context.push(`Bathrooms: ${baths}`);
    if (areaSize && areaUnit) context.push(`Area: ${areaSize} ${areaUnit}`);

    // Create enhancement prompt based on type
    let enhancementPrompt: string;
    
    if (isTitle) {
      enhancementPrompt = `Please enhance the following property title to make it more attractive, professional, and appealing to potential buyers or renters.

${context.length > 0 ? `Property Details:\n${context.join('\n')}\n\n` : ''}Original Title:
${plainText}

Please provide an enhanced title that:
1. Is concise but compelling (50-80 characters ideal)
2. Highlights the key selling points (location, property type, key features)
3. Uses professional real estate language
4. Is attention-grabbing and SEO-friendly
5. Maintains the original information but makes it more appealing
6. Does not include price or contact information

Return only the enhanced title, no explanations, no HTML tags, just plain text.`;
    } else {
      enhancementPrompt = `You are a professional real estate copywriter. Transform this basic property description into a BRIEF, eye-catching listing with bullet points.

${context.length > 0 ? `Property Details:\n${context.join('\n')}\n\n` : ''}Original Description:
${plainText}

CRITICAL REQUIREMENTS:
- Keep it BRIEF and CONCISE - maximum 150-200 words total
- Use BULLET POINTS (•) for key features and highlights
- Make it EYE-CATCHING and engaging, not lengthy
- Use professional but punchy real estate language
- Keep ALL factual information (location, size, price, distances, measurements)
- Format in HTML with <p> for opening/closing, <ul><li> for bullet points, and <strong> for emphasis

The enhanced description should:
1. Start with ONE engaging sentence (max 20 words) highlighting the main appeal
2. Use BULLET POINTS to list key features:
   • Location advantages
   • Nearby amenities/landmarks
   • Property specifications (size, price, etc.)
   • Key benefits
3. End with ONE closing sentence (max 15 words) if needed
4. Keep it SHORT - aim for 5-7 bullet points maximum
5. Make each bullet point concise (10-15 words each)

IMPORTANT: 
- Do NOT write long paragraphs
- Do NOT make it verbose or wordy
- Use bullet points (•) format
- Keep total length under 200 words
- Make it scannable and easy to read quickly

Return ONLY the enhanced HTML description. Format: <p>Opening sentence</p><ul><li>Bullet point 1</li><li>Bullet point 2</li>...</ul><p>Closing sentence (optional)</p>`;
    }

    // Check if Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      // Fallback: Simple text enhancement without AI
      // This provides basic improvements if Gemini is not configured
      const enhanced = isTitle 
        ? enhanceTitleSimple(plainText, context)
        : enhanceTextSimple(plainText, context);
      return res.status(200).json({ 
        enhancedText: enhanced,
        method: 'simple'
      });
    }

    // Use Gemini API for enhancement
    try {
      console.log('[Enhance Description] Calling Gemini API...');
      console.log('[Enhance Description] Input text length:', plainText.length);
      console.log('[Enhance Description] Type:', isTitle ? 'title' : 'description');
      
      const systemInstruction = 'You are a professional real estate copywriter specializing in creating engaging property descriptions. Make the text significantly better, more professional, and more appealing. Do not just return the same text.';
      const fullPrompt = `${systemInstruction}\n\n${enhancementPrompt}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
              temperature: 0.8,
              topP: 0.95,
              candidateCount: 1,
              maxOutputTokens: isTitle ? 200 : 1500,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        
        console.error('[Enhance Description] ❌ Gemini API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Fallback to simple enhancement
        const enhanced = isTitle 
          ? enhanceTitleSimple(plainText, context)
          : enhanceTextSimple(plainText, context);
        return res.status(200).json({ 
          enhancedText: enhanced,
          method: 'simple',
          error: errorData.error?.message || `HTTP ${response.status}`,
        });
      }

      const data = await response.json();
      
      console.log('[Enhance Description] Gemini API response received');
      console.log('[Enhance Description] Response structure:', JSON.stringify(data).substring(0, 500));
      
      // Improved response parsing - handles different response shapes
      const cand = data?.candidates?.[0];
      let enhancedText = '';
      
      if (cand) {
        const content = cand.content ?? cand;
        const parts = content.parts ?? content?.content?.parts;
        if (Array.isArray(parts) && parts.length > 0) {
          enhancedText = parts.map((p: any) => p.text ?? p).join('\n').trim();
        } else if (typeof content.text === 'string') {
          enhancedText = content.text.trim();
        } else if (typeof cand.text === 'string') {
          enhancedText = cand.text.trim();
        }
      }
      
      console.log('[Enhance Description] Extracted text length:', enhancedText.length);
      console.log('[Enhance Description] Original text length:', plainText.length);
      
      // If we got a response but it's empty or same as original, log it
      if (!enhancedText || enhancedText.length === 0) {
        console.warn('[Enhance Description] ⚠️ Gemini returned empty response, using fallback');
        const enhanced = isTitle 
          ? enhanceTitleSimple(plainText, context)
          : enhanceTextSimple(plainText, context);
        return res.status(200).json({ 
          enhancedText: enhanced,
          method: 'simple',
          warning: 'Gemini returned empty response, used simple enhancement'
        });
      }
      
      // For titles, remove any HTML tags that might have been returned
      if (isTitle) {
        enhancedText = enhancedText.replace(/<[^>]*>/g, '').trim();
      }
      
      // Check if enhanced text is significantly different from original
      const isSignificantlyDifferent = enhancedText.toLowerCase() !== plainText.toLowerCase() && 
                                       enhancedText.length > plainText.length * 0.8;
      
      if (!isSignificantlyDifferent && enhancedText.length < plainText.length * 1.2) {
        console.warn('[Enhance Description] ⚠️ Enhanced text is too similar to original, may need improvement');
      }

      console.log('[Enhance Description] ✅ Gemini enhancement successful');
      return res.status(200).json({ 
        enhancedText: enhancedText,
        method: 'gemini',
        originalLength: plainText.length,
        enhancedLength: enhancedText.length,
      });
    } catch (apiError: any) {
      console.error('Gemini API request error:', apiError);
      
      // Fallback to simple enhancement
      const enhanced = isTitle 
        ? enhanceTitleSimple(plainText, context)
        : enhanceTextSimple(plainText, context);
      return res.status(200).json({ 
        enhancedText: enhanced,
        method: 'simple'
      });
    }
  } catch (error: any) {
    console.error('Enhance description error:', error);
    return res.status(500).json({ 
      error: 'Failed to enhance description',
      details: error.message 
    });
  }
}

// Simple title enhancement fallback (no AI required)
function enhanceTitleSimple(text: string, context: string[]): string {
  let enhanced = text.trim();

  // Capitalize first letter of each word
  enhanced = enhanced.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Add location if available and not already in title
  const locationInfo = context.find(c => c.startsWith('Location:'));
  if (locationInfo && !enhanced.toLowerCase().includes('kochi') && !enhanced.toLowerCase().includes('kakkanad')) {
    const location = locationInfo.replace('Location: ', '');
    if (location.toLowerCase().includes('kochi') || location.toLowerCase().includes('kakkanad')) {
      enhanced = `${enhanced} in ${location.split(',')[0]}`;
    }
  }

  // Add property type if available and not already in title
  const propertyTypeInfo = context.find(c => c.startsWith('Property Type:'));
  if (propertyTypeInfo && !enhanced.toLowerCase().includes(propertyTypeInfo.toLowerCase())) {
    const propertyType = propertyTypeInfo.replace('Property Type: ', '');
    // Only add if title doesn't already mention it
    if (!enhanced.toLowerCase().includes(propertyType.toLowerCase())) {
      enhanced = `${propertyType} - ${enhanced}`;
    }
  }

  // Ensure it's not too long (max 100 characters)
  if (enhanced.length > 100) {
    enhanced = enhanced.substring(0, 97) + '...';
  }

  return enhanced;
}

// Simple text enhancement fallback (no AI required)
function enhanceTextSimple(text: string, context: string[]): string {
  let enhanced = text;

  // Capitalize first letter of sentences
  enhanced = enhanced.replace(/(^\w{1}|\.\s*\w{1})/gi, (match) => match.toUpperCase());

  // Add structure with paragraphs if text is long
  if (enhanced.length > 200) {
    // Split into sentences
    const sentences = enhanced.split(/(?<=[.!?])\s+/);
    
    // Group sentences into paragraphs (2-3 sentences per paragraph)
    const paragraphs: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      paragraphs.push(sentences.slice(i, i + 2).join(' '));
    }
    
    enhanced = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
  } else {
    enhanced = `<p>${enhanced}</p>`;
  }

  // Add emphasis to key features (numbers, important words)
  enhanced = enhanced.replace(/(\d+\s*(BHK|bhk|bedroom|bathroom|sq\s*ft|cent|acre|floors?))/gi, '<strong>$1</strong>');
  enhanced = enhanced.replace(/(RERA|approved|furnished|semi-furnished|unfurnished)/gi, '<strong>$1</strong>');

  // Add context information if available
  if (context.length > 0) {
    const contextHtml = `<p><strong>Property Highlights:</strong> ${context.join(', ')}</p>`;
    enhanced = contextHtml + enhanced;
  }

  return enhanced;
}
