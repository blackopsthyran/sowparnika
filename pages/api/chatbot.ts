import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Helper function to safely extract text from Gemini API response
 * Handles different response shapes and edge cases
 */
function extractTextFromGemini(resp: any): string | null {
  const candidate = resp?.candidates?.[0];
  if (!candidate) {
    return null;
  }

  // Check if content exists
  const content = candidate.content;
  if (!content) {
    return null;
  }

  // Handle parts array (standard format)
  if (content.parts && Array.isArray(content.parts)) {
    const textParts = content.parts
      .map((p: any) => {
        if (typeof p === 'string') return p;
        if (p && typeof p.text === 'string') return p.text;
        return '';
      })
      .filter((text: string) => text.trim().length > 0);
    
    if (textParts.length > 0) {
      return textParts.join('\n').trim();
    }
  }

  // Handle single part
  if (content.parts && !Array.isArray(content.parts)) {
    const part = content.parts;
    if (typeof part === 'string') return part;
    if (part && typeof part.text === 'string') return part.text.trim();
  }

  // Handle content as direct text
  if (typeof content === 'string') {
    return content.trim();
  }

  // Handle candidate.text (legacy format)
  if (candidate.text && typeof candidate.text === 'string') {
    return candidate.text.trim();
  }

  // If content has text property
  if (content.text && typeof content.text === 'string') {
    return content.text.trim();
  }

  return null;
}

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
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return res.status(500).json({ 
        error: 'Chatbot service not configured',
        message: 'Gemini API key is not set'
      });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(500).json({ 
        error: 'Database not configured',
        message: 'Unable to search properties'
      });
    }

    // Step 1: Check if user is actually asking for properties or just having a conversation
    // Don't show properties for greetings, thanks, or general questions without search intent
    const messageLower = message.toLowerCase().trim();
    
    // Keywords that indicate user wants to search/see properties
    const searchIntentKeywords = [
      'find', 'search', 'looking', 'looking for', 'need', 'want', 'show', 'list', 'see',
      'house', 'apartment', 'villa', 'plot', 'land', 'property', 'properties',
      'buy', 'purchase', 'rent', 'budget', 'price', 'lakh', 'crore',
      'bhk', 'bedroom', 'location', 'city', 'area', 'kochi', 'thrissur', 'kozhikode'
    ];
    
    // Keywords that indicate general conversation (no property search)
    const generalConversationKeywords = [
      'hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye', 'ok', 'okay',
      'yes', 'no', 'sure', 'maybe', 'help', 'what', 'how', 'why', 'when', 'where'
    ];
    
    // Check if message has search intent
    const hasSearchIntent = searchIntentKeywords.some(keyword => messageLower.includes(keyword));
    const isGeneralConversation = generalConversationKeywords.some(keyword => 
      messageLower === keyword || messageLower.startsWith(keyword + ' ') || messageLower.endsWith(' ' + keyword)
    );
    
    // If it's clearly general conversation without search intent, don't search for properties
    if (isGeneralConversation && !hasSearchIntent) {
      console.log('[Chatbot] General conversation detected - skipping property search');
      return res.status(200).json({
        message: 'I\'m here to help you find the perfect property! Tell me what you\'re looking for - for example, "I\'m looking for a 2 BHK house in Kochi under 50 lakhs" or "Show me apartments for sale".',
        properties: [],
        _meta: {
          usingGemini: false,
          geminiError: null,
          propertyCount: 0,
          searchCriteria: {},
          reason: 'general_conversation'
        }
      });
    }
    
    // Step 2: Extract search parameters from user message (with fallback if OpenAI fails)
    let searchCriteria: any = {};
    let hasAnyCriteria = false;
    const propertyTypeKeywords: { [key: string]: string } = {
      'house': 'House',
      'houses': 'House',
      'home': 'House',
      'homes': 'House',
      'apartment': 'Apartment',
      'apartments': 'Apartment',
      'flat': 'Flat',
      'flats': 'Flat',
      'villa': 'Villa',
      'villas': 'Villa',
      'plot': 'Plot',
      'plots': 'Plot',
      'land': 'Land',
      'commercial land': 'Commercial Land',
      'commercial building': 'Commercial Building',
      'warehouse': 'Warehouse',
      'studio': 'Studio',
      'penthouse': 'Penthouse',
      'townhouse': 'Townhouse',
    };

    // Simple extraction from message
    for (const [keyword, type] of Object.entries(propertyTypeKeywords)) {
      if (messageLower.includes(keyword)) {
        searchCriteria.propertyType = type;
        hasAnyCriteria = true;
        break;
      }
    }

    // Extract city (default to Kochi if not specified)
    if (messageLower.includes('kochi') || messageLower.includes('kakkanad')) {
      searchCriteria.city = 'Kochi';
      hasAnyCriteria = true;
    } else if (messageLower.includes('thrissur')) {
      searchCriteria.city = 'Thrissur';
      hasAnyCriteria = true;
    } else if (messageLower.includes('kozhikode') || messageLower.includes('calicut')) {
      searchCriteria.city = 'Kozhikode';
      hasAnyCriteria = true;
    } else if (messageLower.includes('aluva')) {
      searchCriteria.city = 'Aluva';
      hasAnyCriteria = true;
    } else if (messageLower.includes('alappuzha')) {
      searchCriteria.city = 'Alappuzha';
      hasAnyCriteria = true;
    }

    // Extract selling type
    if (messageLower.includes('rent') || messageLower.includes('rental')) {
      searchCriteria.sellingType = 'Rent';
      hasAnyCriteria = true;
    } else if (messageLower.includes('sale') || messageLower.includes('buy') || messageLower.includes('purchase')) {
      searchCriteria.sellingType = 'Sale';
      hasAnyCriteria = true;
    }

    // Extract BHK
    const bhkMatch = message.match(/(\d+)\s*(bhk|bedroom|bed|bedroom)/i);
    if (bhkMatch) {
      searchCriteria.bhk = parseInt(bhkMatch[1]);
      hasAnyCriteria = true;
    }

    // Extract price range from message (improved - handles budget, under, less than, etc.)
    // Handle "budget of X", "under X", "less than X", "upto X", "maximum X"
    const budgetPatterns = [
      /(?:budget|maximum|max|upto|under|less than|below)\s*(?:of|is)?\s*(\d+)\s*(lakh|lakhs|lac|lacs|cr|crore|crores|rupees?|rs)/i,
      /(\d+)\s*(lakh|lakhs|lac|lacs|cr|crore|crores)\s*(?:budget|maximum|max|budget|price)?/i,
      /(?:₹|rs\.?|rupees?)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|cr|crore|crores)?/i,
    ];
    
    for (const pattern of budgetPatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        const unit = (match[2] || '').toLowerCase();
        
        if (unit.includes('lakh') || unit.includes('lac')) {
          searchCriteria.maxPrice = Math.round(amount * 100000); // Convert lakhs to rupees
          hasAnyCriteria = true;
          console.log('[Chatbot] Extracted budget:', amount, 'lakhs = ₹', searchCriteria.maxPrice);
          break;
        } else if (unit.includes('crore') || unit.includes('cr')) {
          searchCriteria.maxPrice = Math.round(amount * 10000000); // Convert crores to rupees
          hasAnyCriteria = true;
          console.log('[Chatbot] Extracted budget:', amount, 'crores = ₹', searchCriteria.maxPrice);
          break;
        } else if (amount > 100000) {
          // If amount is large and no unit specified, assume it's already in rupees
          searchCriteria.maxPrice = Math.round(amount);
          hasAnyCriteria = true;
          console.log('[Chatbot] Extracted budget: ₹', searchCriteria.maxPrice);
          break;
        }
      }
    }
    
    // Also handle price ranges like "50 to 60 lakhs"
    const rangePattern = /(\d+)\s*(?:to|-|and)\s*(\d+)\s*(lakh|lakhs|lac|lacs|cr|crore|crores)/i;
    const rangeMatch = message.match(rangePattern);
    if (rangeMatch) {
      const minAmount = parseFloat(rangeMatch[1]);
      const maxAmount = parseFloat(rangeMatch[2]);
      const unit = rangeMatch[3].toLowerCase();
      const multiplier = (unit.includes('lakh') || unit.includes('lac')) ? 100000 : 10000000;
      searchCriteria.minPrice = Math.round(minAmount * multiplier);
      searchCriteria.maxPrice = Math.round(maxAmount * multiplier);
      hasAnyCriteria = true;
      console.log('[Chatbot] Extracted price range:', searchCriteria.minPrice, 'to', searchCriteria.maxPrice);
    }
    
    // If no search criteria found and no clear search intent, don't search for properties
    if (!hasAnyCriteria && !hasSearchIntent) {
      console.log('[Chatbot] No search criteria found - skipping property search');
      return res.status(200).json({
        message: 'I\'d be happy to help you find properties! Could you tell me what you\'re looking for? For example:\n\n• "I\'m looking for a 2 BHK house in Kochi"\n• "Show me apartments under 50 lakhs"\n• "Find properties in Thrissur"\n\nYou can specify property type, location, budget, number of bedrooms, or any combination.',
        properties: [],
        _meta: {
          usingGemini: false,
          geminiError: null,
          propertyCount: 0,
          searchCriteria: {},
          reason: 'no_criteria'
        }
      });
    }

    // Try Gemini extraction for more complex queries (but don't fail if it doesn't work)
    let usingGeminiExtraction = false;
    try {
      console.log('[Chatbot] Attempting Gemini extraction for search criteria...');
      const extractionPrompt = `You are a real estate assistant. Analyze the user's message and extract property search criteria in JSON format.

User message: "${message}"

CRITICAL: Only extract criteria if the user is actually asking to search/find/see/list properties. If it's just a greeting ("hello", "hi", "thanks"), general question, or conversation without property search intent, return ALL null values.

Extract the following information ONLY if the user is searching for properties:
- propertyType: Use exact values: "Apartment", "House", "Villa", "Flat", "Studio", "Penthouse", "Townhouse", "Plot", "Land", "Commercial Land", "Warehouse", "Commercial Building"
- city: (location/city name, default to "Kochi" if location mentioned in Kochi area)
- sellingType: ("Sale" or "Rent")
- minPrice: (minimum price as number, no commas, convert lakhs: 50 lakhs = 5000000)
- maxPrice: (maximum price as number, no commas, convert lakhs: 50 lakhs = 5000000)
- bhk: (number of bedrooms as integer)
- minArea: (minimum area size as number)
- maxArea: (maximum area size as number)
- keywords: (any important features or requirements mentioned)

Return ONLY a valid JSON object. If the user is NOT searching (just greeting/conversation), return all null values.

Example (user searching):
{
  "propertyType": "Apartment",
  "city": "Kochi",
  "sellingType": "Sale",
  "minPrice": null,
  "maxPrice": 5000000,
  "bhk": 3,
  "minArea": null,
  "maxArea": null,
  "keywords": "furnished"
}

Example (user NOT searching - greeting/conversation):
{
  "propertyType": null,
  "city": null,
  "sellingType": null,
  "minPrice": null,
  "maxPrice": null,
  "bhk": null,
  "minArea": null,
  "maxArea": null,
  "keywords": null
}`;

      const systemInstruction = 'You are a helpful assistant that extracts real estate search criteria from user messages. ONLY extract criteria if the user is actually searching for properties. For greetings or general conversation without search intent, return all null values. Always return valid JSON only.';
      const fullPrompt = `${systemInstruction}\n\n${extractionPrompt}`;

      const extractionResponse = await fetch(
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
              temperature: 0.2,
              topP: 0.95,
              candidateCount: 1,
              maxOutputTokens: 200,
            },
          }),
        }
      );

      if (extractionResponse.ok) {
        const extractionData = await extractionResponse.json();
        
        // Improved response parsing - handles different response shapes
        const cand = extractionData?.candidates?.[0];
        let criteriaText = '{}';
        
        if (cand) {
          const content = cand.content ?? cand;
          const parts = content.parts ?? content?.content?.parts;
          if (Array.isArray(parts) && parts.length > 0) {
            criteriaText = parts.map((p: any) => p.text ?? p).join('\n');
          } else if (typeof content.text === 'string') {
            criteriaText = content.text;
          } else if (typeof cand.text === 'string') {
            criteriaText = cand.text;
          }
        }
        
        criteriaText = criteriaText.trim() || '{}';
        
        // Extract JSON from response (might be wrapped in code blocks)
        const jsonMatch = criteriaText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedCriteria = JSON.parse(jsonMatch[0]);
            // Merge with simple extraction, preferring Gemini results
            // Only merge if Gemini found actual criteria (not all null)
            const hasGeminiCriteria = Object.values(extractedCriteria).some(val => val !== null && val !== undefined && val !== '');
            if (hasGeminiCriteria) {
              searchCriteria = { ...searchCriteria, ...extractedCriteria };
              // Update hasAnyCriteria based on merged criteria
              hasAnyCriteria = Object.values(searchCriteria).some(val => val !== null && val !== undefined && val !== '');
              usingGeminiExtraction = true;
              console.log('[Chatbot] ✅ Gemini extraction successful:', searchCriteria);
            } else {
              console.log('[Chatbot] Gemini extraction returned no criteria - user may not be searching');
            }
          } catch (parseError) {
            console.error('[Chatbot] ❌ Error parsing Gemini extraction JSON:', parseError);
            // Continue with simple extraction
          }
        }
      } else {
        const errorText = await extractionResponse.text();
        console.error('[Chatbot] ❌ Gemini extraction failed:', extractionResponse.status, errorText.substring(0, 200));
        // Continue with simple extraction
      }
    } catch (error: any) {
      console.error('[Chatbot] ❌ Error in Gemini extraction (using fallback):', error.message || error);
      // Continue with simple extraction
    }
    
    if (!usingGeminiExtraction) {
      console.log('[Chatbot] ⚠️ Using keyword-based extraction (fallback):', searchCriteria);
    }

    // Final check: If we still have no criteria after all extraction attempts, don't search
    const finalHasCriteria = Object.values(searchCriteria).some(val => val !== null && val !== undefined && val !== '');
    if (!finalHasCriteria && !hasSearchIntent) {
      console.log('[Chatbot] No criteria found after extraction - skipping property search');
      return res.status(200).json({
        message: 'I\'d be happy to help you find properties! Could you provide some details about what you\'re looking for? For example:\n\n• Property type (house, apartment, villa, plot, etc.)\n• Location (city or area)\n• Budget (e.g., "under 50 lakhs")\n• Number of bedrooms (BHK)\n• For sale or rent\n\nYou can provide any combination of these details.',
        properties: [],
        _meta: {
          usingGemini: false,
          geminiError: null,
          propertyCount: 0,
          searchCriteria: {},
          reason: 'no_criteria_after_extraction'
        }
      });
    }

    // Step 2: Query properties database based on extracted criteria
    // Only query if we have at least one search criteria
    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('properties')
      .select('id, title, property_type, price, city, address, images, selling_type, bhk, baths, area_size, area_unit')
      .eq('status', 'active')
      .limit(10);

    // Property type mapping for flexibility
    const propertyTypeMap: { [key: string]: string } = {
      'apartment': 'Apartment',
      'house': 'House',
      'villa': 'Villa',
      'flat': 'Flat',
      'studio': 'Studio',
      'penthouse': 'Penthouse',
      'townhouse': 'Townhouse',
      'plot': 'Plot',
      'land': 'Land',
      'commercial land': 'Commercial Land',
      'warehouse': 'Warehouse',
      'commercial building': 'Commercial Building',
    };

    // Apply filters
    if (searchCriteria.propertyType) {
      const normalizedType = searchCriteria.propertyType.toLowerCase().trim();
      const dbPropertyType = propertyTypeMap[normalizedType] || searchCriteria.propertyType;
      
      // Special handling for plot/land
      if (normalizedType === 'plot') {
        query = query.in('property_type', ['Plot', 'Land']);
      } else if (normalizedType === 'land') {
        query = query.in('property_type', ['Plot', 'Land', 'Commercial Land']);
      } else {
        query = query.eq('property_type', dbPropertyType);
      }
    }
    if (searchCriteria.city) {
      query = query.ilike('city', `%${searchCriteria.city}%`);
    }
    if (searchCriteria.sellingType) {
      // Normalize selling type
      const sellingType = searchCriteria.sellingType === 'Rent' ? 'Rent' : 'Sale';
      query = query.eq('selling_type', sellingType);
    }
    if (searchCriteria.minPrice) {
      query = query.gte('price', Number(searchCriteria.minPrice));
    }
    if (searchCriteria.maxPrice) {
      query = query.lte('price', Number(searchCriteria.maxPrice));
    }
    if (searchCriteria.bhk) {
      query = query.eq('bhk', Number(searchCriteria.bhk));
    }
    if (searchCriteria.minArea) {
      query = query.gte('area_size', Number(searchCriteria.minArea));
    }
    if (searchCriteria.maxArea) {
      query = query.lte('area_size', Number(searchCriteria.maxArea));
    }

    const { data: properties, error: dbError } = await query;

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Process properties to ensure images array is properly formatted
    let processedProperties = (properties || []).map((property: any) => {
      // Supabase might return JSON arrays as strings, so parse if needed
      let images = property.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [];
        }
      }
      // Ensure it's an array
      if (!Array.isArray(images)) {
        images = [];
      }
      
      return {
        ...property,
        images: images,
      };
    });

    // CRITICAL: Post-query filtering to ensure properties match criteria strictly
    // This prevents showing properties that don't match budget or other criteria
    if (processedProperties.length > 0) {
      const originalCount = processedProperties.length;
      
      // Filter by budget if specified (with 10% tolerance for rounding)
      if (searchCriteria.maxPrice) {
        const maxPriceWithTolerance = searchCriteria.maxPrice * 1.1; // 10% tolerance
        processedProperties = processedProperties.filter((p: any) => {
          const price = p.price || 0;
          return price <= maxPriceWithTolerance;
        });
        console.log(`[Chatbot] Filtered by budget (max ₹${searchCriteria.maxPrice}): ${originalCount} → ${processedProperties.length} properties`);
      }
      
      if (searchCriteria.minPrice) {
        const minPriceWithTolerance = searchCriteria.minPrice * 0.9; // 10% tolerance
        processedProperties = processedProperties.filter((p: any) => {
          const price = p.price || 0;
          return price >= minPriceWithTolerance;
        });
        console.log(`[Chatbot] Filtered by min price (min ₹${searchCriteria.minPrice}): ${processedProperties.length} properties`);
      }
      
      // Filter by property type if specified (strict match)
      if (searchCriteria.propertyType) {
        const normalizedType = searchCriteria.propertyType.toLowerCase().trim();
        processedProperties = processedProperties.filter((p: any) => {
          const pType = (p.property_type || '').toLowerCase();
          // Handle house/house types
          if (normalizedType === 'house' && (pType === 'house' || pType === 'villa')) {
            return true;
          }
          // Handle plot/land types
          if ((normalizedType === 'plot' || normalizedType === 'land') && 
              (pType === 'plot' || pType === 'land' || pType === 'commercial land')) {
            return true;
          }
          // Exact match for other types
          return pType === normalizedType;
        });
        console.log(`[Chatbot] Filtered by property type (${searchCriteria.propertyType}): ${processedProperties.length} properties`);
      }
      
      // Filter by BHK if specified (strict match)
      if (searchCriteria.bhk) {
        processedProperties = processedProperties.filter((p: any) => {
          return p.bhk === searchCriteria.bhk;
        });
        console.log(`[Chatbot] Filtered by BHK (${searchCriteria.bhk}): ${processedProperties.length} properties`);
      }
    }
    
    // Log search criteria for debugging
    console.log('[Chatbot] Search criteria:', JSON.stringify(searchCriteria));
    console.log(`[Chatbot] Properties found: ${processedProperties.length}`);

    // Step 3: Format properties for Gemini context (optimized - shorter format to save tokens)
    const propertiesText = processedProperties.length > 0
      ? processedProperties.slice(0, 5).map((p: any, idx: number) => 
          `${idx + 1}. ${p.title} — ${p.property_type} in ${p.city} for ₹${p.price?.toLocaleString('en-IN') || 'Price on request'}${p.bhk ? `, ${p.bhk} BHK` : ''}`
        ).join('\n')
      : 'No properties found matching the criteria.';

    // Step 4: Generate response using Gemini with property context (with fallback)
    let assistantMessage = '';
    let usingGemini = false;
    let geminiError: string | null = null;

    try {
      // Build user criteria summary for context
      const criteriaSummary: string[] = [];
      if (searchCriteria.maxPrice) {
        criteriaSummary.push(`Budget: Up to ₹${(searchCriteria.maxPrice / 100000).toFixed(1)} lakhs`);
      }
      if (searchCriteria.minPrice) {
        criteriaSummary.push(`Minimum: ₹${(searchCriteria.minPrice / 100000).toFixed(1)} lakhs`);
      }
      if (searchCriteria.propertyType) {
        criteriaSummary.push(`Type: ${searchCriteria.propertyType}`);
      }
      if (searchCriteria.city) {
        criteriaSummary.push(`Location: ${searchCriteria.city}`);
      }
      if (searchCriteria.bhk) {
        criteriaSummary.push(`Bedrooms: ${searchCriteria.bhk} BHK`);
      }
      
      const systemPrompt = `You are a friendly real estate assistant. Help users find properties.

User's requirements: ${criteriaSummary.length > 0 ? criteriaSummary.join(', ') : 'None specified'}

${processedProperties.length > 0 
  ? `Available properties that match the criteria (${processedProperties.length} found):\n${propertiesText}\n\nIMPORTANT: Only mention properties from the list above that match the user's requirements. Do NOT mention properties that don't match their budget or criteria.`
  : 'No properties found matching the user\'s criteria.\n\nIMPORTANT: Do NOT suggest or mention any properties. Instead, politely explain that no properties match their requirements and ask if they would like to adjust their criteria (e.g., increase budget, consider different location, etc.).'
}

Guidelines:
- Be conversational and helpful
- ${processedProperties.length > 0 
    ? 'ONLY mention properties from the list that match the user\'s requirements (especially budget). If properties are listed but none match, say no properties match.'
    : 'Do NOT suggest any properties. Explain that no properties match and offer to help adjust criteria.'}
- ${processedProperties.length > 0 
    ? 'Mention 2-3 most relevant properties that match their criteria'
    : 'Ask if they want to adjust their criteria (budget, location, property type, etc.)'}
- Keep responses concise but natural
- Don't make up property details
- If user mentioned a budget, ONLY show properties within that budget`;

      // Build conversation context for Gemini
      let conversationContext = systemPrompt + '\n\n';
      
      // Add conversation history
      if (conversationHistory.length > 0) {
        conversationContext += 'Previous conversation:\n';
        conversationHistory.slice(-6).forEach((msg: any) => {
          conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
        conversationContext += '\n';
      }
      
      conversationContext += `User: ${message}\nAssistant:`;

      console.log('[Chatbot] Calling Gemini API...');
      const chatResponse = await fetch(
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
                    text: conversationContext
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              candidateCount: 1,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        
        // Extract text using helper function
        const extractedText = extractTextFromGemini(chatData);
        
        // Check if response was truncated
        const candidate = chatData?.candidates?.[0];
        const finishReason = candidate?.finishReason;
        
        if (finishReason === 'MAX_TOKENS') {
          console.warn('[Chatbot] ⚠️ Response was truncated (MAX_TOKENS) - response may be incomplete');
          // Response is still valid, just truncated - use what we got
        }
        
        // Validate extracted message
        if (extractedText && extractedText.length > 0) {
          assistantMessage = extractedText;
          usingGemini = true;
          console.log('[Chatbot] ✅ Gemini API successful, response length:', assistantMessage.length, 'chars');
          
          // Log warning if response seems incomplete (ends abruptly)
          if (finishReason === 'MAX_TOKENS' && assistantMessage.length < 100) {
            console.warn('[Chatbot] ⚠️ Response seems very short for MAX_TOKENS - may need more tokens');
          }
        } else {
          console.error('[Chatbot] ❌ Could not extract text from Gemini response:', {
            finishReason: finishReason,
            hasCandidates: !!chatData?.candidates?.length,
            candidateStructure: candidate ? Object.keys(candidate) : 'none'
          });
          // Don't dump JSON - use a proper fallback message
          assistantMessage = ''; // Will trigger fallback message generation below
        }
      } else {
        const errorText = await chatResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        
        console.error('[Chatbot] ❌ Gemini API error:', {
          status: chatResponse.status,
          statusText: chatResponse.statusText,
          error: errorData
        });
        
        geminiError = errorData.error?.message || `HTTP ${chatResponse.status}: ${chatResponse.statusText}`;
        // Fall through to fallback message generation
      }
    } catch (error: any) {
      console.error('[Chatbot] ❌ Error calling Gemini chat API:', error.message || error);
      geminiError = error.message || 'Network or connection error';
      // Fall through to fallback message generation
    }

    // Fallback: Generate a simple response if Gemini fails
    if (!assistantMessage) {
      console.log('[Chatbot] ⚠️ Using fallback response (Gemini not available)');
      
      // Build criteria summary
      const criteriaParts: string[] = [];
      if (searchCriteria.maxPrice) {
        criteriaParts.push(`budget of ₹${(searchCriteria.maxPrice / 100000).toFixed(1)} lakhs`);
      }
      if (searchCriteria.propertyType) {
        criteriaParts.push(searchCriteria.propertyType);
      }
      if (searchCriteria.city) {
        criteriaParts.push(`in ${searchCriteria.city}`);
      }
      if (searchCriteria.bhk) {
        criteriaParts.push(`${searchCriteria.bhk} BHK`);
      }
      
      if (processedProperties.length > 0) {
        // Only show properties that match - already filtered above
        const propertyCount = Math.min(processedProperties.length, 3);
        const propertyList = processedProperties.slice(0, propertyCount)
          .map((p: any, idx: number) => {
            const details = [];
            if (p.bhk) details.push(`${p.bhk} BHK`);
            if (p.area_size) details.push(`${p.area_size} ${p.area_unit || 'sq ft'}`);
            const detailStr = details.length > 0 ? ` (${details.join(', ')})` : '';
            return `${idx + 1}. ${p.title} - ${p.property_type} in ${p.city} for ₹${p.price?.toLocaleString('en-IN') || 'Price on request'}${detailStr}`;
          })
          .join('. ');

        const criteriaStr = criteriaParts.length > 0 ? ` matching your ${criteriaParts.join(', ')}` : '';
        assistantMessage = `I found ${processedProperties.length} property${processedProperties.length > 1 ? 'ies' : ''}${criteriaStr}: ${propertyList}. Click on any property card below to view more details!`;
      } else {
        // No properties match - don't show any
        if (criteriaParts.length > 0) {
          assistantMessage = `I couldn't find any properties matching your ${criteriaParts.join(', ')}. Would you like to adjust your search criteria? For example, you could increase your budget, consider a different location, or look at different property types.`;
        } else {
          assistantMessage = `I couldn't find any properties matching your search. Could you provide more details? For example, you could specify the property type (house, apartment, villa, etc.), location (city or area), price range, or number of bedrooms (BHK).`;
        }
      }
    }

    // Step 5: Return response with suggested properties
    // CRITICAL: Only return properties if they actually match the criteria
    // If no properties match, return empty array so frontend doesn't show random properties
    const propertiesToReturn = processedProperties.length > 0 
      ? processedProperties.slice(0, 3).map((p: any) => ({
          id: p.id,
          title: p.title,
          propertyType: p.property_type,
          price: p.price,
          city: p.city,
          address: p.address,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
          sellingType: p.selling_type,
          bhk: p.bhk,
          baths: p.baths,
          areaSize: p.area_size,
          areaUnit: p.area_unit,
        }))
      : [];
    
    console.log(`[Chatbot] Returning ${propertiesToReturn.length} properties to frontend`);
    
    return res.status(200).json({
      message: assistantMessage,
      properties: propertiesToReturn,
      // Include Gemini status for debugging
      _meta: {
        usingGemini: usingGemini,
        geminiError: geminiError,
        propertyCount: processedProperties.length,
        searchCriteria: searchCriteria,
      }
    });
  } catch (error: any) {
    console.error('Chatbot error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message || 'Please try again later'
    });
  }
}

