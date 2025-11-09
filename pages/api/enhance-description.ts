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
      enhancementPrompt = `Please enhance the following property description to make it more engaging, professional, and appealing to potential buyers or renters. 

${context.length > 0 ? `Property Details:\n${context.join('\n')}\n\n` : ''}Original Description:
${plainText}

Please provide an enhanced version that:
1. Is more descriptive and engaging
2. Highlights key features and benefits
3. Uses professional real estate language
4. Is well-structured and easy to read
5. Maintains the original information but presents it better
6. Is formatted in HTML with appropriate paragraphs and emphasis

Return only the enhanced description in HTML format, no explanations or additional text.`;
    }

    // Check if OpenAI API key is configured
    const openAiKey = process.env.OPENAI_API_KEY;

    if (!openAiKey) {
      // Fallback: Simple text enhancement without AI
      // This provides basic improvements if OpenAI is not configured
      const enhanced = isTitle 
        ? enhanceTitleSimple(plainText, context)
        : enhanceTextSimple(plainText, context);
      return res.status(200).json({ 
        enhancedText: enhanced,
        method: 'simple'
      });
    }

    // Use OpenAI API for enhancement
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional real estate copywriter specializing in creating engaging property descriptions.'
            },
            {
              role: 'user',
              content: enhancementPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', errorData);
        
        // Fallback to simple enhancement
        const enhanced = isTitle 
          ? enhanceTitleSimple(plainText, context)
          : enhanceTextSimple(plainText, context);
        return res.status(200).json({ 
          enhancedText: enhanced,
          method: 'simple'
        });
      }

      const data = await response.json();
      let enhancedText = data.choices?.[0]?.message?.content?.trim() || plainText;
      
      // For titles, remove any HTML tags that might have been returned
      if (isTitle) {
        enhancedText = enhancedText.replace(/<[^>]*>/g, '').trim();
      }

      return res.status(200).json({ 
        enhancedText: enhancedText,
        method: 'openai'
      });
    } catch (apiError: any) {
      console.error('OpenAI API request error:', apiError);
      
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

