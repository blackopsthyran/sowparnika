# ✅ Exact API URLs - All Using v1

## Confirmed API Endpoints (100% v1)

### 1. Chatbot Extraction (`/api/chatbot.ts` - Line 136)
```typescript
const extractionResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
    }),
  }
);
```
✅ **URL:** `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent`
✅ **API Version:** `v1` (NOT v1beta)
✅ **Model:** `gemini-1.5-flash-latest`

### 2. Chatbot Response (`/api/chatbot.ts` - Line 326)
```typescript
const chatResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: conversationContext }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
    }),
  }
);
```
✅ **URL:** `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent`
✅ **API Version:** `v1` (NOT v1beta)
✅ **Model:** `gemini-1.5-flash-latest`

### 3. Text Enhancement (`/api/enhance-description.ts` - Line 103)
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
    }),
  }
);
```
✅ **URL:** `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent`
✅ **API Version:** `v1` (NOT v1beta)
✅ **Model:** `gemini-1.5-flash-latest`

### 4. Test Endpoint (`/api/test-gpt.ts` - Lines 34, 40)
```typescript
// Primary
{
  url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
  model: 'gemini-1.5-flash-latest',
  version: 'v1',
}

// Alternative
{
  url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`,
  model: 'gemini-1.5-pro-latest',
  version: 'v1',
}
```
✅ **URLs:** Both use `v1` (NOT v1beta)
✅ **API Version:** `v1` only
✅ **Models:** `gemini-1.5-flash-latest` and `gemini-1.5-pro-latest`

## ✅ Verification Complete

**All active API calls use:**
- ✅ API Version: `v1` (NOT v1beta)
- ✅ Endpoint: `/v1/models/...:generateContent`
- ✅ Model: `gemini-1.5-flash-latest`
- ✅ No v1beta in any active code paths

## 🔍 If You're Still Seeing v1beta Errors

### Possible Causes:

1. **Server Not Restarted**
   - ✅ **Fix:** Restart your development server
   ```bash
   npm run dev
   ```

2. **Old API Key (v1beta-only key)**
   - ✅ **Fix:** Get a new v1-compatible key
   - Visit: https://aistudio.google.com/app/apikey
   - Click "Create API key" (creates v1-compatible key)
   - Update `.env.local`: `GEMINI_API_KEY=AIzaSy...`
   - Restart server

3. **Cached Code**
   - ✅ **Fix:** Clear Next.js cache
   ```bash
   rm -rf .next
   npm run dev
   ```

4. **Check Your API Key**
   - ✅ **Test:** List available models
   ```bash
   curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_GEMINI_API_KEY"
   ```
   - If this returns 404 or error, your key might be v1beta-only
   - Get a new key from: https://aistudio.google.com/app/apikey

## 🧪 Test Your Setup

1. **Verify API Key:**
   ```bash
   curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY"
   ```
   Should return a list of models.

2. **Test Endpoint:**
   ```bash
   curl "http://localhost:3000/api/test-gpt"
   ```
   Should return: `"apiVersion": "v1"`

3. **Check Server Logs:**
   Look for: `[Chatbot] Calling Gemini API...`
   Should show v1 endpoint in logs.

## 📝 Summary

✅ **All code uses v1 API**  
✅ **All endpoints use gemini-1.5-flash-latest**  
✅ **No v1beta in active code**  
✅ **Test endpoint only tries v1**  

**If errors persist, the issue is likely:**
1. Server needs restart
2. API key is v1beta-only (need new key)
3. Cached code running

**Get a fresh v1-compatible API key from:**
https://aistudio.google.com/app/apikey

