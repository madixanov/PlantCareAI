/**
 * AI Chat API Route with Groq Integration
 * Production-ready endpoint with rate limiting, validation, and security
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  addConversationTurn,
  buildConversationContext,
  buildProfileContext,
} from '@/lib/memory';

// ============================================================================
// TYPES
// ============================================================================

interface ChatRequest {
  message: string;
  plantId?: string;  // NEW: optional plant ID for RAG-style context
  sessionId?: string;  // NEW: optional session ID for conversation memory
  plantContext?: {
    name?: string;
    species?: string;
    lightLevel?: string;
    humidity?: string;
    notes?: string;
  };
  diseaseInfo?: {
    label: string;
    confidence: number;
    detectedAt?: string;
  };
}

interface ChatResponse {
  answer: string;
}

interface GroqChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface GroqChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function getRateLimitKey(request: NextRequest): string {
  // Use X-Forwarded-For header if available (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Fallback to other headers or a default
  return request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(key: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// ============================================================================
// VALIDATION
// ============================================================================

function validateChatRequest(body: any): { valid: boolean; error?: string; data?: ChatRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { message, plantId, sessionId, plantContext } = body;

  // Validate message
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string' };
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmedMessage.length > 1000) {
    return { valid: false, error: 'Message must be 1000 characters or less' };
  }

  // Validate plantId if provided
  if (plantId !== undefined && typeof plantId !== 'string') {
    return { valid: false, error: 'Plant ID must be a string' };
  }

  // Validate sessionId if provided
  if (sessionId !== undefined && typeof sessionId !== 'string') {
    return { valid: false, error: 'Session ID must be a string' };
  }

  // Validate plantContext if provided
  if (plantContext !== undefined) {
    if (typeof plantContext !== 'object' || plantContext === null) {
      return { valid: false, error: 'Plant context must be an object' };
    }

    const allowedKeys = ['name', 'species', 'lightLevel', 'humidity', 'notes'];
    for (const key of Object.keys(plantContext)) {
      if (!allowedKeys.includes(key)) {
        return { valid: false, error: `Invalid plant context key: ${key}` };
      }
      if (typeof plantContext[key] !== 'string') {
        return { valid: false, error: `Plant context ${key} must be a string` };
      }
    }
  }

  // Validate diseaseInfo if provided
  if (body.diseaseInfo !== undefined) {
    const { diseaseInfo } = body;
    if (typeof diseaseInfo !== 'object' || diseaseInfo === null) {
      return { valid: false, error: 'Disease info must be an object' };
    }
    if (typeof diseaseInfo.label !== 'string' || !diseaseInfo.label) {
      return { valid: false, error: 'Disease label is required and must be a string' };
    }
    if (typeof diseaseInfo.confidence !== 'number' || diseaseInfo.confidence < 0 || diseaseInfo.confidence > 1) {
      return { valid: false, error: 'Disease confidence must be a number between 0 and 1' };
    }
    if (diseaseInfo.detectedAt !== undefined && typeof diseaseInfo.detectedAt !== 'string') {
      return { valid: false, error: 'Disease detectedAt must be a string' };
    }
  }

  return {
    valid: true,
    data: {
      message: trimmedMessage,
      plantId,
      sessionId,
      plantContext,
      diseaseInfo: body.diseaseInfo,
    },
  };
}

// ============================================================================
// PLANT CONTEXT FETCHING (RAG-STYLE)
// ============================================================================

/**
 * Fetch plant context from Strapi API
 * Returns null if fetch fails (graceful degradation)
 */
async function fetchPlantContext(plantId: string): Promise<string | null> {
  try {
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const response = await fetch(
      `${STRAPI_URL}/api/plants/${plantId}?populate=care_logs`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || ''}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch plant context:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch plant context:', error);
    return null;
  }
}

/**
 * Build context string from plant data and disease info
 * Prioritizes: disease > plant info > care history
 * Limits context size to 800 characters max
 */
function buildPlantContext(plant: any, diseaseInfo?: ChatRequest['diseaseInfo']): string {
  if (!plant && !diseaseInfo) return '';

  let context = '';
  let remainingChars = 800;

  // Priority 1: Disease information (if present)
  if (diseaseInfo) {
    const confidencePercent = Math.round(diseaseInfo.confidence * 100);
    const detectedDate = diseaseInfo.detectedAt
      ? new Date(diseaseInfo.detectedAt).toLocaleDateString()
      : 'recently';
    
    const diseaseContext = `Disease Detected: ${diseaseInfo.label} (${confidencePercent}% confidence)\nDetected: ${detectedDate}\n\n`;
    context += diseaseContext;
    remainingChars -= diseaseContext.length;
  }

  // Priority 2: Plant species and current conditions
  if (plant) {
    let plantInfo = 'Plant: ';
    if (plant.species) {
      plantInfo += plant.species;
      if (plant.name && plant.name !== plant.species) {
        plantInfo += ` (${plant.name})`;
      }
    } else if (plant.name) {
      plantInfo += plant.name;
    } else {
      plantInfo += 'Unknown species';
    }
    plantInfo += '\n';

    if (plant.lightLevel) plantInfo += `Light: ${plant.lightLevel}\n`;
    if (plant.humidity) plantInfo += `Humidity: ${plant.humidity}\n`;
    if (plant.temperature) plantInfo += `Temperature: ${plant.temperature}\n`;
    
    // Add notes if space allows (truncate to 200 chars)
    if (plant.notes && remainingChars > plantInfo.length + 50) {
      const maxNotesLength = Math.min(200, remainingChars - plantInfo.length - 20);
      const truncatedNotes = plant.notes.length > maxNotesLength
        ? plant.notes.substring(0, maxNotesLength) + '...'
        : plant.notes;
      plantInfo += `Notes: ${truncatedNotes}\n`;
    }

    if (plantInfo.length <= remainingChars) {
      context += plantInfo + '\n';
      remainingChars -= plantInfo.length + 1;
    }

    // Priority 3: Recent care history (if space allows)
    const careLogs = plant.care_logs?.slice(0, 3) || [];
    if (careLogs.length > 0 && remainingChars > 50) {
      let careContext = 'Recent Care:\n';
      
      for (const log of careLogs) {
        const date = new Date(log.date).toLocaleDateString();
        let logEntry = `- ${log.careType}: ${date}`;
        
        // Add truncated notes if space allows
        if (log.notes && remainingChars > careContext.length + logEntry.length + 30) {
          const maxLogNotesLength = Math.min(50, remainingChars - careContext.length - logEntry.length - 10);
          const truncatedLogNotes = log.notes.length > maxLogNotesLength
            ? log.notes.substring(0, maxLogNotesLength) + '...'
            : log.notes;
          logEntry += ` (${truncatedLogNotes})`;
        }
        
        logEntry += '\n';
        
        if (careContext.length + logEntry.length <= remainingChars) {
          careContext += logEntry;
        } else {
          break;
        }
      }
      
      if (careContext.length > 'Recent Care:\n'.length) {
        context += careContext;
      }
    }
  }
  
  // Final safety check - ensure we don't exceed 800 chars
  if (context.length > 800) {
    context = context.substring(0, 800) + '...';
  }
  
  return context.trim();
}

// ============================================================================
// GROQ API INTEGRATION
// ============================================================================

// Expert system prompt for intelligent plant care assistance
const SYSTEM_PROMPT = `You are a professional plant care expert with years of experience in horticulture and plant health.

Your expertise includes:
- Plant care (watering schedules, soil requirements, fertilization)
- Environmental conditions (light levels, humidity, temperature ranges)
- Disease diagnosis, treatment, and prevention
- Species-specific care recommendations

When plant context is provided:
- Give SPECIFIC advice tailored to that exact plant species
- Reference the plant's current conditions (light, humidity, temperature)
- Consider the plant's care history (last watering, fertilizing)
- Adapt recommendations based on the plant's current state

When disease information is available:
- Provide immediate treatment steps
- Explain prevention measures
- Give timeline for recovery
- Suggest monitoring points

Response format:
- Use clear sections with headers (Care Advice:, Conditions:, Treatment:)
- Provide actionable bullet points
- Include specific measurements and timings
- Avoid generic advice - be precise and practical

If the question is unrelated to plants or plant care:
Respond: "I can only help with plant-related questions. Please ask about plant care, conditions, or health issues."

Always prioritize plant health and user success.`;

// TODO: Implement long-term memory system (conversation history per user)
// TODO: Create user profiles with experience levels and preferences
// TODO: Learn from user interactions and feedback
// TODO: Build recommendation engine for plant selection
// TODO: Add predictive care reminders based on patterns
// TODO: Implement seasonal care adjustments
// TODO: Track advice effectiveness and improve over time

async function callGroqAPI(
  message: string,
  contextString?: string,
  sessionId?: string
): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error('API configuration error');
  }

  // Build enhanced system prompt with profile context
  let enhancedSystemPrompt = SYSTEM_PROMPT;
  if (sessionId) {
    const profileContext = buildProfileContext(sessionId);
    if (profileContext) {
      enhancedSystemPrompt = `${SYSTEM_PROMPT}\n\n${profileContext}`;
    }
  }

  // Build user prompt with context and conversation history
  let userPrompt = message;
  
  // Add conversation history if session exists
  if (sessionId) {
    const conversationContext = buildConversationContext(sessionId);
    if (conversationContext) {
      userPrompt = `${conversationContext}\n\n`;
    }
  }
  
  // Add plant/disease context
  if (contextString) {
    userPrompt += `${contextString}\n\n`;
  }
  
  userPrompt += `User Question: ${message}`;

  const requestBody: GroqChatCompletionRequest = {
    model: 'llama3-70b-8192',
    messages: [
      {
        role: 'system',
        content: enhancedSystemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
  };

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Don't leak provider-specific errors
      throw new Error('AI service error');
    }

    const data: GroqChatCompletionResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI service');
    }

    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    throw error;
  }
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = checkRateLimit(rateLimitKey);

    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.resetTime
        ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        : 60;

      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    // Parse and validate request
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validation = validateChatRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { message, plantId, sessionId, plantContext, diseaseInfo } = validation.data!;

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 401 }
      );
    }

    // Initialize or get session if sessionId provided
    if (sessionId) {
      getSession(sessionId); // This creates session if it doesn't exist
      console.log(`[chat] Using session: ${sessionId}`);
    }

    // Fetch plant data if plantId provided
    let plantData: any = null;
    if (plantId) {
      plantData = await fetchPlantContext(plantId);
    }

    // Build enriched context string with plant data and disease info
    let contextString = '';
    
    // Use fetched plant data or provided plant context
    if (plantData || plantContext) {
      contextString = buildPlantContext(plantData, diseaseInfo);
    } else if (diseaseInfo) {
      // Disease info only (no plant data)
      contextString = buildPlantContext(null, diseaseInfo);
    }

    // Call Groq API with enriched context and session
    const answer = await callGroqAPI(message, contextString || undefined, sessionId);

    // Save conversation to memory if session exists
    if (sessionId) {
      addConversationTurn(sessionId, message, answer);
      console.log(`[chat] Saved conversation turn for session: ${sessionId}`);
    }

    const response: ChatResponse = { answer };
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Chat API error:', error);

    // Return generic error message (don't leak internal details)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Made with Bob
