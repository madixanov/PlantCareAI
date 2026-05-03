import { NextRequest, NextResponse } from 'next/server';

// TODO: merge YOLOS + classification into one pipeline
// TODO: add caching (Redis) for common diseases
// TODO: add GPU support for faster inference

// Singleton pattern for model loading
let yolosModel: any = null;

async function getYOLOSModel() {
  if (!yolosModel) {
    const { pipeline } = await import('@xenova/transformers');
    yolosModel = await pipeline(
      'object-detection',
      'nickmuchi/yolos-small-plant-disease-detection'
    );
  }
  return yolosModel;
}

// Clean label by replacing underscores with spaces
function cleanLabel(label: string): string {
  return label.replace(/___/g, ' ').replace(/_/g, ' ');
}

// Fallback to basic classification endpoint
async function fallbackToBasicDetection(formData: FormData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/detect-disease`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Fallback detection failed');
    }

    const data = await response.json();
    
    // Convert classification result to detection format
    return {
      detections: [
        {
          label: data.label || 'Unknown',
          confidence: data.confidence || 0.5,
          box: [0, 0, 100, 100], // Full image box as fallback
        },
      ],
    };
  } catch (error) {
    console.error('Fallback detection error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (ADDED)
    const { checkRateLimit } = await import('@/lib/rateLimit');
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    try {
      // Load YOLOS model
      const { RawImage } = await import('@xenova/transformers');
      const model = await getYOLOSModel();

      // CRITICAL FIX: Use RawImage.fromBlob for Node.js runtime
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });
      const image = await RawImage.fromBlob(blob);
      
      // Pass RawImage to the model
      const rawDetections = await model(image);

      console.log('YOLOS raw detections:', rawDetections); // Debug output

      // Process and clean detections
      let detections = rawDetections.map((det: any) => ({
        label: cleanLabel(det.label),
        confidence: det.score || 0,
        box: det.box
          ? [
              Math.round(det.box.xmin || 0),
              Math.round(det.box.ymin || 0),
              Math.round(det.box.xmax || 0),
              Math.round(det.box.ymax || 0),
            ]
          : [0, 0, 100, 100],
      }));

      // Sort by confidence (highest first)
      detections.sort(
        (a: any, b: any) => (b.confidence || 0) - (a.confidence || 0)
      );

      // Limit to top 3 detections
      detections = detections.slice(0, 3);

      // If no detections found, fallback to basic detection
      if (detections.length === 0) {
        console.log('No YOLOS detections found, falling back to basic detection');
        return NextResponse.json(await fallbackToBasicDetection(formData));
      }

      return NextResponse.json({ detections });
    } catch (modelError) {
      // If YOLOS fails, fallback to basic classification
      console.error('YOLOS detection failed, falling back to basic detection:', modelError);
      return NextResponse.json(await fallbackToBasicDetection(formData));
    }
  } catch (error) {
    console.error('Error in detect-disease-advanced:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

// Use Node.js runtime for better compatibility with transformers
export const runtime = 'nodejs';

// Made with Bob
