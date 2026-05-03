/**
 * Unified Plant Disease Analysis API Route
 * Combines disease detection and explanation in a single request with caching
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rateLimit';
import { config } from '@/lib/config';

// ============================================================================
// TYPES
// ============================================================================

interface AnalyzePlantResponse {
  label: string;
  confidence: number;
  explanation: string;
  detections?: any[]; // Optional for future YOLOS integration
}

interface GroqChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface GroqChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface GroqStreamChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason?: string;
  }>;
}

// TODO: Implement Redis cache adapter for production
// TODO: Add Redis-based rate limiter for distributed systems
// TODO: Implement horizontal scaling with load balancer
// TODO: Add Prometheus metrics collection
// TODO: Implement distributed tracing
// TODO: Add health check endpoints
// TODO: Implement cache warming on startup
// TODO: implement WebSocket support for real-time bidirectional communication
// TODO: add real-time updates for collaborative features
// TODO: add stream resumption on disconnect
// TODO: implement retry logic for failed streams

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Clean disease label for better readability
 */
function cleanLabel(label: string): string {
  return label
    .replace(/___/g, ' ')
    .replace(/_/g, ' ')
    .trim();
}

/**
 * Validate image file
 */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPG, JPEG, and PNG images are allowed',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit',
    };
  }

  return { valid: true };
}

/**
 * Load and cache the disease detection model
 */
let modelPipeline: any = null;

async function getModel() {
  if (!modelPipeline) {
    const { pipeline } = await import('@xenova/transformers');
    modelPipeline = await pipeline(
      'image-classification',
      'linkanjarad/mobilenet_v2_plant_disease'
    );
  }
  return modelPipeline;
}

/**
 * Detect plant disease from image
 */
async function detectDisease(imageBuffer: Buffer): Promise<{
  label: string;
  confidence: number;
}> {
  try {
    const classifier = await getModel();
    const results = await classifier(imageBuffer);

    if (!results || results.length === 0) {
      return {
        label: "Unknown",
        confidence: 0,
      };
    }

    const topPrediction = results[0];
    const cleanedLabel = cleanLabel(topPrediction.label);
    const roundedConfidence = Math.round(topPrediction.score * 100) / 100;

    return {
      label: cleanedLabel,
      confidence: roundedConfidence,
    };
  } catch (error) {
    console.error('Disease detection error:', error);
    return {
      label: "Unknown",
      confidence: 0,
    };
  }
}

/**
 * Get disease explanation with cache check (non-streaming)
 */
async function getExplanation(label: string): Promise<string> {
  const cleanedLabel = cleanLabel(label);
  
  // Check cache first
  const cachedValue = await cache.get(cleanedLabel);
  if (cachedValue) {
    console.log(`Cache hit for disease: ${cleanedLabel}`);
    return cachedValue;
  }

  console.log(`Cache miss for disease: ${cleanedLabel}`);

  // Generate explanation using Groq
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error('API configuration error');
  }

  const userPrompt = `Disease: ${cleanedLabel}

Explain:
1. What this disease is
2. Why it happens
3. How to treat it
4. How to prevent it

Be clear, practical, and concise.`;

  const requestBody: GroqChatCompletionRequest = {
    model: 'llama3-70b-8192',
    messages: [
      {
        role: 'system',
        content: 'You are a plant disease expert.',
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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
      throw new Error('AI service error');
    }

    const data: GroqChatCompletionResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI service');
    }

    const explanation = data.choices[0].message.content;

    // Store in cache (cache abstraction handles size limits and TTL)
    await cache.set(cleanedLabel, explanation);
    console.log(`Cached explanation for disease: ${cleanedLabel}`);

    return explanation;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    throw error;
  }
}

/**
 * Get disease explanation with streaming support
 */
async function getExplanationStream(label: string): Promise<ReadableStream> {
  const cleanedLabel = cleanLabel(label);

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error('API configuration error');
  }

  const userPrompt = `Disease: ${cleanedLabel}

Explain:
1. What this disease is
2. Why it happens
3. How to treat it
4. How to prevent it

Be clear, practical, and concise.`;

  const requestBody: GroqChatCompletionRequest = {
    model: 'llama3-70b-8192',
    messages: [
      {
        role: 'system',
        content: 'You are a plant disease expert.',
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
    stream: true,
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error('AI service error');
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  return response.body;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    console.log(`[${requestId}] Processing request`);

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit using abstraction
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      console.log(`[${requestId}] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${Math.ceil(config.rateLimit.windowMs / 1000)} seconds.` },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(config.rateLimit.windowMs / 1000).toString(),
          },
        }
      );
    }

    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 1: Detect disease
    const { label, confidence } = await detectDisease(buffer);

    // Step 2: Check if explanation is cached
    const cleanedLabel = cleanLabel(label);
    const cachedValue = await cache.get(cleanedLabel);

    // If cached, return non-streaming response (backward compatibility)
    if (cachedValue) {
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] Processed in ${duration}ms (cached)`);
      
      const response: AnalyzePlantResponse = {
        label,
        confidence,
        explanation: cachedValue,
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Step 3: Stream explanation if not cached and confidence is high enough
    if (confidence <= config.ai.confidenceThreshold) {
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] Processed in ${duration}ms (low confidence)`);
      
      return NextResponse.json({
        label,
        confidence,
        explanation: 'Confidence too low to provide a reliable explanation. Please try with a clearer image.',
      }, { status: 200 });
    }

    // Create streaming response
    const encoder = new TextEncoder();
    let fullExplanation = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send detection result first
          const detectionData = JSON.stringify({
            type: 'detection',
            label,
            confidence,
          });
          controller.enqueue(encoder.encode(`data: ${detectionData}\n\n`));

          // Get streaming explanation
          const explanationStream = await getExplanationStream(label);
          const reader = explanationStream.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  continue;
                }

                try {
                  const parsed: GroqStreamChunk = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;

                  if (content) {
                    fullExplanation += content;
                    
                    // Send chunk to client
                    const chunkData = JSON.stringify({
                      type: 'chunk',
                      text: content,
                    });
                    controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`));
                  }
                } catch (parseError) {
                  console.error('Error parsing stream chunk:', parseError);
                }
              }
            }
          }

          // Cache the complete explanation (cache abstraction handles size limits and TTL)
          if (fullExplanation) {
            await cache.set(cleanedLabel, fullExplanation);
            console.log(`[${requestId}] Cached streamed explanation for disease: ${cleanedLabel}`);
          }

          // Send completion signal
          const doneData = JSON.stringify({ type: 'done' });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

          const duration = Date.now() - startTime;
          console.log(`[${requestId}] Processed in ${duration}ms (streamed)`);

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          
          try {
            // Send error and fallback to cached or default explanation
            const errorData = JSON.stringify({
              type: 'error',
              message: 'Streaming failed, using fallback',
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));

            // Try to get non-streaming explanation as fallback
            try {
              const fallbackExplanation = await getExplanation(label);
              const chunkData = JSON.stringify({
                type: 'chunk',
                text: fallbackExplanation,
              });
              controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`));
            } catch (fallbackError) {
              const fallbackText = 'Unable to retrieve disease explanation at this time.';
              const chunkData = JSON.stringify({
                type: 'chunk',
                text: fallbackText,
              });
              controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`));
            }

            const doneData = JSON.stringify({ type: 'done' });
            controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
            
            controller.close();
          } catch (closeError) {
            // Controller already closed or in error state
            console.error('Error closing stream controller:', closeError);
          }
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Plant analysis API error:', error);

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Failed in ${duration}ms`);

    return NextResponse.json(
      { error: 'An error occurred while analyzing your image. Please try again.' },
      { status: 500 }
    );
  }
}

// TODO: implement batch processing for multiple images

// Made with Bob