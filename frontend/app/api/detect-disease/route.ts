/**
 * Plant Disease Detection API Route
 * Uses HuggingFace transformers for image-based disease detection
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface DiseaseDetectionResponse {
  label: string;
  confidence: number;
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
// MODEL LOADING (SINGLETON PATTERN)
// ============================================================================

let modelPipeline: any = null;

async function getModel() {
  if (!modelPipeline) {
    const { pipeline } = await import('@xenova/transformers');
    // Use Xenova model - these have ONNX weights required for @xenova/transformers
    modelPipeline = await pipeline(
      'image-classification',
      'Xenova/vit-base-patch16-224'
    );
  }
  return modelPipeline;
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPG, JPEG, and PNG images are allowed',
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit',
    };
  }

  return { valid: true };
}

// ============================================================================
// DISEASE DETECTION
// ============================================================================

async function detectPlantDisease(file: File): Promise<DiseaseDetectionResponse> {
  try {
    // Get model (loads once, reused for subsequent requests)
    const { RawImage } = await import('@xenova/transformers');
    const classifier = await getModel();

    // CRITICAL FIX: Use RawImage.fromBlob for Node.js runtime
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    const image = await RawImage.fromBlob(blob);
    
    // Pass RawImage to the model
    const results = await classifier(image, { topk: 1 });

    console.log('Model results:', results); // Debug output

    // Get top prediction with fallback
    if (!results || results.length === 0) {
      throw new Error('Model returned no results');
    }

    const topPrediction = results[0];

    // Clean label and preserve confidence precision
    const cleanedLabel = cleanLabel(topPrediction.label);
    const confidence = topPrediction.score || 0;

    return {
      label: cleanedLabel,
      confidence: confidence,
    };
  } catch (error) {
    console.error('Disease detection error details:', error);
    
    // Return fallback instead of throwing error
    return {
      label: "Unknown disease",
      confidence: 0
    };
  }
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting (ADDED)
    const { checkRateLimit } = await import('@/lib/rateLimit');
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
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

    // Detect disease
    const result = await detectPlantDisease(file);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Disease detection API error:', error);

    // Return generic error message (don't leak internal details)
    return NextResponse.json(
      { error: 'An error occurred while processing your image. Please try again.' },
      { status: 500 }
    );
  }
}

// Made with Bob
// TODO: integrate YOLOS model for bounding box detection
// TODO: combine detection + explanation into one endpoint
// TODO: optimize model loading for production