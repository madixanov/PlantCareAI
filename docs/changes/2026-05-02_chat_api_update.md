# AI Chat API Implementation - May 2, 2026

## Change Summary

Replaced the mock AI implementation with a production-ready Groq API integration for the PlantCareAI application. The new implementation provides real AI-powered plant care assistance through a secure, rate-limited API endpoint.

## What Was Implemented

### 1. Production-Ready Chat API Endpoint
Created a new Next.js API route (`/api/chat`) that integrates with Groq's LLM API to provide intelligent plant care assistance.

### 2. Updated AI Client Function
Modified the `askAI()` function in the Strapi client library to call the new API endpoint instead of returning mock responses.

### 3. Environment Configuration
Updated environment configuration to include the Groq API key placeholder.

## Files Created

### `frontend/app/api/chat/route.ts`
A comprehensive API route handler with the following features:

**Core Functionality:**
- POST endpoint accepting JSON with `message` and optional `plantContext`
- Direct integration with Groq API (no SDK dependency)
- Uses `llama3-70b-8192` model for responses
- Temperature: 0.5, Max tokens: 300

**Security Features:**
- Input validation (1-1000 characters, required fields)
- API key validation (returns 401 if missing)
- Never leaks API keys or provider-specific errors
- Sanitized error messages for users

**Rate Limiting:**
- In-memory rate limiting: 10 requests per minute per IP
- Uses `Map` for tracking request counts
- Automatic cleanup of expired entries
- Returns 429 status with `Retry-After` header

**Error Handling:**
- 400: Bad input (invalid JSON, missing fields, validation errors)
- 401: Missing API key
- 429: Rate limit exceeded
- 500: Generic server errors (no internal details leaked)
- 7-second timeout with AbortController

**System Prompt:**
Enforces strict plant-care-only responses. The AI will refuse to answer non-plant-related questions with: "I can only help with plant-related questions."

## Files Modified

### `frontend/lib/strapi.ts`

**Changed Function Signature:**
```typescript
// Before (mock):
export async function askAI(plantId: string, question: string): Promise<string>

// After (real API):
export async function askAI(
  message: string,
  plantContext?: {
    name?: string;
    species?: string;
    lightLevel?: string;
    humidity?: string;
    notes?: string;
  }
): Promise<string>
```

**New Implementation:**
- Makes POST request to `/api/chat` endpoint
- Sends message and optional plant context
- Handles all error cases gracefully with user-friendly messages
- Special handling for rate limiting (429) and service unavailability (401)
- Network error fallback messages

### `frontend/.env.example`

**Updated Configuration:**
```env
# Before:
OPENAI_API_KEY=your_openai_api_key_here

# After:
GROQ_API_KEY=your_groq_api_key_here
```

Added helpful comment with link to get API key: https://console.groq.com/keys

## How It Works

### Request Flow

1. **User Interaction**
   - User sends a message through the frontend (e.g., AI Assistant page)
   - Optional plant context can be included (name, species, light level, etc.)

2. **Client-Side Request**
   - `askAI()` function in `strapi.ts` is called
   - Sends POST request to `/api/chat` with JSON body

3. **API Route Processing**
   - Rate limiting check (10 req/min per IP)
   - Input validation (message length, required fields)
   - API key verification

4. **Groq API Call**
   - Constructs system prompt (plant-care-only assistant)
   - Builds user prompt with context if provided
   - Calls Groq API with 7-second timeout
   - Model: `llama3-70b-8192`

5. **Response Handling**
   - Extracts AI response from Groq API
   - Returns JSON: `{ answer: string }`
   - Client displays answer to user

### Example Request

```json
POST /api/chat
Content-Type: application/json

{
  "message": "How often should I water this plant?",
  "plantContext": {
    "name": "My Monstera",
    "species": "Monstera deliciosa",
    "lightLevel": "bright indirect",
    "humidity": "60%",
    "notes": "Recently repotted"
  }
}
```

### Example Response

```json
{
  "answer": "For a Monstera deliciosa in bright indirect light, water when the top 2-3 inches of soil are dry. Since you recently repotted it, be careful not to overwater during the first few weeks as the roots are adjusting. Check the soil moisture before watering, and ensure good drainage to prevent root rot."
}
```

## Why This Approach

### Direct API Integration (No SDK)
- **Pros:** Minimal dependencies, full control, smaller bundle size
- **Cons:** Manual error handling, no built-in retries
- **Decision:** For this use case, the simplicity and control outweigh the benefits of an SDK

### In-Memory Rate Limiting
- **Pros:** Simple, no database required, fast
- **Cons:** Resets on server restart, not shared across instances
- **Decision:** Sufficient for MVP; can upgrade to Redis later if needed

### Node Runtime
- **Pros:** Access to Node.js APIs, better for server-side operations
- **Cons:** Cannot use Edge runtime features
- **Decision:** Required for proper timeout handling and future extensibility

### Groq API Choice
- **Pros:** Fast inference, good models, generous free tier
- **Cons:** Less established than OpenAI
- **Decision:** Excellent for plant care use case; can switch providers later if needed

## Security Considerations

### ✅ Implemented Security Measures

1. **API Key Protection**
   - Key stored in environment variable (`GROQ_API_KEY`)
   - Never exposed to client-side code
   - Not included in error messages or logs

2. **Input Validation**
   - Message length limits (1-1000 characters)
   - Type checking for all inputs
   - Whitespace trimming
   - Plant context validation

3. **Rate Limiting**
   - 10 requests per minute per IP
   - Prevents abuse and cost overruns
   - Automatic cleanup of old entries

4. **Error Sanitization**
   - Generic error messages to users
   - No internal details leaked
   - No provider-specific errors exposed

5. **Timeout Protection**
   - 7-second timeout prevents hanging requests
   - AbortController for proper cleanup

6. **System Prompt Injection Protection**
   - Strict system prompt enforces plant-only responses
   - Ignores user attempts to override instructions

### 🔒 Additional Recommendations

1. **Add Request Logging**
   - Log requests for monitoring and debugging
   - Exclude sensitive data (API keys, personal info)

2. **Implement CORS**
   - Restrict API access to your domain only
   - Prevent unauthorized cross-origin requests

3. **Add Authentication**
   - Require user authentication for API access
   - Track usage per user instead of per IP

4. **Monitor Costs**
   - Track API usage and costs
   - Set up alerts for unusual activity

## Future Improvements

### 1. RAG (Retrieval-Augmented Generation)
**What:** Enhance AI responses with plant care knowledge base
**Why:** More accurate, consistent, and detailed plant care advice
**How:**
- Create vector database of plant care information
- Embed user questions and retrieve relevant context
- Include context in Groq API prompts

### 2. Response Caching
**What:** Cache common questions and responses
**Why:** Reduce API costs and improve response times
**How:**
- Use Redis or in-memory cache
- Hash question + context as cache key
- Set appropriate TTL (e.g., 24 hours)

### 3. Streaming Responses
**What:** Stream AI responses token-by-token
**Why:** Better UX for long responses, feels more responsive
**How:**
- Use Groq's streaming API
- Implement Server-Sent Events (SSE)
- Update frontend to handle streaming

### 4. Conversation History
**What:** Maintain conversation context across messages
**Why:** More natural, contextual conversations
**How:**
- Store conversation history in database or session
- Include previous messages in API calls
- Implement conversation management UI

### 5. Multi-Language Support
**What:** Support plant care questions in multiple languages
**Why:** Broader user base, better accessibility
**How:**
- Detect user language
- Translate questions/responses
- Use multilingual models

### 6. Advanced Rate Limiting
**What:** Upgrade to distributed rate limiting
**Why:** Works across multiple server instances
**How:**
- Use Redis for shared rate limit state
- Implement sliding window algorithm
- Add per-user rate limits

### 7. Response Quality Monitoring
**What:** Track and improve AI response quality
**Why:** Ensure helpful, accurate responses
**How:**
- Add user feedback buttons (helpful/not helpful)
- Log responses for review
- Fine-tune prompts based on feedback

### 8. Cost Optimization
**What:** Reduce API costs while maintaining quality
**Why:** Sustainable long-term operation
**How:**
- Implement aggressive caching
- Use smaller models for simple questions
- Batch similar requests

## Testing the Endpoint

### Prerequisites
1. Get a Groq API key from https://console.groq.com/keys
2. Create `frontend/.env.local` file:
   ```env
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

### Manual Testing with cURL

**Basic Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I care for a snake plant?"}'
```

**Request with Plant Context:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Is my plant getting enough light?",
    "plantContext": {
      "name": "My Monstera",
      "species": "Monstera deliciosa",
      "lightLevel": "low",
      "notes": "Leaves are turning yellow"
    }
  }'
```

**Test Rate Limiting:**
```bash
# Run this 11 times quickly to trigger rate limit
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' &
done
```

**Test Invalid Input:**
```bash
# Empty message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'

# Message too long (>1000 chars)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "'$(python3 -c 'print("a"*1001)')'"}'
```

### Testing from Frontend

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the AI Assistant page
3. Ask a plant care question
4. Verify the response is from the real AI (not mock)

### Expected Responses

**Success (200):**
```json
{
  "answer": "Snake plants are very low-maintenance. Water every 2-3 weeks, allow soil to dry completely between waterings. They tolerate low light but prefer indirect bright light. Avoid overwatering as this is the most common cause of problems."
}
```

**Rate Limited (429):**
```json
{
  "error": "Too many requests. Please try again later."
}
```

**Invalid Input (400):**
```json
{
  "error": "Message must be 1000 characters or less"
}
```

**Service Unavailable (401):**
```json
{
  "error": "Service temporarily unavailable"
}
```

## Migration Notes

### Breaking Changes
- `askAI()` function signature changed
- First parameter is now `message` (string) instead of `plantId` (string)
- Second parameter is now optional `plantContext` (object) instead of `question` (string)

### Code Updates Required
Any code calling `askAI()` needs to be updated:

```typescript
// Before:
const response = await askAI(plantId, "How do I water this?");

// After:
const plant = await getPlantById(plantId);
const response = await askAI("How do I water this?", {
  name: plant.name,
  species: plant.species,
  // ... other context
});
```

### Deployment Checklist
- [ ] Add `GROQ_API_KEY` to production environment variables
- [ ] Test API endpoint in staging environment
- [ ] Monitor API usage and costs
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure rate limiting for production load
- [ ] Add API endpoint to monitoring/alerting

## Conclusion

This implementation provides a solid foundation for AI-powered plant care assistance in the PlantCareAI application. The code is production-ready with proper security, error handling, and rate limiting. Future improvements can be added incrementally without major refactoring.

The choice of Groq API provides fast, cost-effective AI responses while maintaining the flexibility to switch providers if needed. The architecture supports future enhancements like RAG, caching, and streaming without significant changes to the core implementation.