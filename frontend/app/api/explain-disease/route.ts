/**
 * Plant Disease Explanation API Route
 * Uses Groq AI to provide detailed disease explanations
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface ExplainDiseaseRequest {
  label: string;
}

interface ExplainDiseaseResponse {
  disease: string;
  explanation: string;
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
// LABEL CLEANING
// ============================================================================

function cleanLabel(label: string): string {
  return label
    .replace(/___/g, ' ')
    .replace(/_/g, ' ')
    .trim();
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateRequest(body: any): { valid: boolean; error?: string; data?: ExplainDiseaseRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { label } = body;

  // Validate label
  if (!label || typeof label !== 'string') {
    return { valid: false, error: 'Label is required and must be a string' };
  }

  const trimmedLabel = label.trim();
  if (trimmedLabel.length === 0) {
    return { valid: false, error: 'Label cannot be empty' };
  }

  return {
    valid: true,
    data: { label: trimmedLabel },
  };
}

// ============================================================================
// GROQ API INTEGRATION
// ============================================================================

async function explainDiseaseWithGroq(label: string): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error('API configuration error');
  }

  // Clean the label for better readability
  const cleanedLabel = cleanLabel(label);

  // Build user prompt
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

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for longer explanations

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

    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { label } = validation.data!;

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 401 }
      );
    }

    // Get explanation from Groq
    const explanation = await explainDiseaseWithGroq(label);

    // Clean label for response
    const cleanedLabel = cleanLabel(label);

    const response: ExplainDiseaseResponse = {
      disease: cleanedLabel,
      explanation,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Explain disease API error:', error);

    // Return generic error message (don't leak internal details)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// TODO: Add caching layer to avoid re-explaining the same diseases
// TODO: Integrate with RAG system for more accurate disease information
// TODO: Add support for multiple languages
// TODO: Include treatment product recommendations from database

// Made with Bob