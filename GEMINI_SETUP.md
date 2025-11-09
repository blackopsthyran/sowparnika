# Gemini API Setup Guide

This guide will help you set up Google Gemini API for your property listings website.

## Why Gemini?

- ✅ **Free Tier Available** - Generous free quota for development
- ✅ **Cost Effective** - Lower pricing compared to OpenAI
- ✅ **Fast Responses** - Gemini 1.5 Flash is optimized for speed
- ✅ **No Quota Issues** - More reliable free tier than OpenAI

## Setup Steps

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on **"Get API Key"** in the left sidebar
4. Click **"Create API Key"** 
   - Choose "Create API key in new project" (recommended)
   - Or select an existing Google Cloud project
5. Copy the API key (it will look like: `AIza...`)

### 2. Add API Key to Environment Variables

1. Open your `.env.local` file in the root directory
2. Add the following line:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```
3. Replace `your-api-key-here` with your actual API key
4. Save the file

### 3. Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test the Integration

1. Open your browser and go to `http://localhost:3000`
2. Click on the "Chat with us" button (bottom-right)
3. In development mode, click the "Test Gemini" button in the chat header
4. You should see: ✅ **"Gemini is working!"**

Or test via API endpoint:
```bash
curl http://localhost:3000/api/test-gpt
```

## Features Using Gemini

### 1. Chatbot (`/api/chatbot`)
- Natural language property search
- Conversational responses
- Property recommendations

### 2. Text Enhancement (`/api/enhance-description`)
- Title enhancement
- Description enhancement
- Property listing improvements

## API Usage

The website uses **Gemini 1.5 Flash Latest** model with **v1 API**, which is:
- Fast and efficient (optimized for speed)
- Cost-effective (cheapest option)
- Stable and reliable
- Free tier: 60 requests per minute
- Uses the latest v1 API (not v1beta)

## Pricing

### Free Tier
- **60 requests per minute** (RPM)
- **1,500 requests per day** (RPD)
- Perfect for development and small-scale production
- No credit card required for free tier

### Paid Tier
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens
- Very affordable for production use

For more details: https://ai.google.dev/pricing

## Troubleshooting

### "Gemini API key is not set"
- Make sure `GEMINI_API_KEY` is in `.env.local`
- Restart your development server
- Check for typos in the variable name

### "API returned an error"
- Verify your API key is valid
- Check if you've exceeded the free tier limits
- Ensure your Google account has access to Gemini API

### "Failed to connect"
- Check your internet connection
- Verify firewall isn't blocking Google APIs
- Check Google Cloud status: https://status.cloud.google.com/

## Migration from OpenAI

If you were using OpenAI before:

1. **Remove** `OPENAI_API_KEY` from `.env.local` (optional)
2. **Add** `GEMINI_API_KEY` to `.env.local`
3. Restart your server
4. Test the chatbot - it should work with Gemini now!

## Support

- Gemini API Docs: https://ai.google.dev/docs
- Google AI Studio: https://aistudio.google.com/
- API Status: https://status.cloud.google.com/

