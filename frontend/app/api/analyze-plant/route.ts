import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rateLimit';
import { config } from '@/lib/config';

export const runtime = "nodejs";

// ============================================================================
// TYPES
// ============================================================================

interface AnalyzePlantResponse {
  label: string;
  confidence: number;
  explanation: string;
  detections?: any[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function cleanLabel(label: string): string {
  return label.replace(/___/g, ' ').replace(/_/g, ' ').trim();
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: 'No file provided' };
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPG, JPEG, and PNG allowed' };
  }
  if (file.size > MAX_FILE_SIZE) return { valid: false, error: 'File size exceeds 5MB' };
  return { valid: true };
}

/**
 * Глобальная переменная для хранения модели (синглтон)
 */
let modelPipeline: any = null;

async function getModel() {
  if (!modelPipeline) {
    const { pipeline, env } = await import('@xenova/transformers');
    
    // Включаем возможность загрузки удаленных моделей
    env.allowRemoteModels = true;
    
    // В новых версиях используется remotePathTemplate
    // По умолчанию он и так настроен на Hugging Face, 
    // но если нужно указать явно:
    (env as any).remotePathTemplate = '{model}/resolve/{revision}/';

    // Use Xenova model - these have ONNX weights required for @xenova/transformers
    // ViT (Vision Transformer) is well-supported and works reliably
    modelPipeline = await pipeline(
      'image-classification',
      'Xenova/vit-base-patch16-224'
    );
  }
  return modelPipeline;
}

/**
 * Disease Detection
 * CRITICAL FIX: Use RawImage.fromBlob for Node.js runtime
 */
async function detectDisease(file: File): Promise<{ label: string; confidence: number }> {
  try {
    const { RawImage } = await import('@xenova/transformers');
    const classifier = await getModel();
    
    // Convert File to Blob, then to RawImage
    // This is the CORRECT way for Node.js runtime with @xenova/transformers
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    const image = await RawImage.fromBlob(blob);
    
    // Pass RawImage to the model
    const results = await classifier(image, { topk: 1 });

    console.log('Model results:', results); // Debug output

    if (!results || results.length === 0) {
      throw new Error('Model returned no results');
    }

    return {
      label: cleanLabel(results[0].label),
      confidence: results[0].score,
    };
  } catch (error) {
    console.error('Detection error details:', error);
    // Propagate error instead of hiding it with fallback
    throw error;
  }
}

/**
 * Generate explanation via Groq (Streaming)
 */
async function getExplanationStream(label: string): Promise<ReadableStream> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a plant disease expert. Provide clear, concise advice.' },
        { role: 'user', content: `Explain plant disease: ${label}. Include causes, treatment, and prevention.` }
      ],
      temperature: 0.5,
      max_tokens: 500,
      stream: true,
    }),
  });

  if (!response.ok) throw new Error('Groq API error');
  return response.body!;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Parse file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }
    const validation = validateImageFile(file);
    if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });

    // 3. Detection - pass File directly (CRITICAL FIX)
    const { label, confidence } = await detectDisease(file);

    const cachedExplanation = await cache.get(label);
    if (cachedExplanation) {
      return NextResponse.json({
        label,
        confidence,
        explanation: cachedExplanation,
        cached: true
      });
    }

    // 5. Validate Groq API key before streaming
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // 6. Stream response
    const encoder = new TextEncoder();
    let fullText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send detection result as first chunk
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'detection', label, confidence })}\n\n`));

          const groqStream = await getExplanationStream(label);
          const reader = groqStream.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    fullText += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: content })}\n\n`));
                  }
                } catch (e) {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }

          // Save to cache after stream completes
          if (fullText) {
            await cache.set(label, fullText);
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          // Send error to client instead of just closing
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message: 'Stream failed' })}\n\n`
          ));
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}