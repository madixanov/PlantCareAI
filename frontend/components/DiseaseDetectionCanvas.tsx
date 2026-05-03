'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface Detection {
  label: string;
  confidence: number;
  box: [number, number, number, number];
}

interface DiseaseDetectionCanvasProps {
  imageUrl: string;
  detections: Detection[];
}

/**
 * Get color based on confidence level
 * High (>0.8): Green
 * Medium (0.5-0.8): Yellow
 * Low (<0.5): Red
 */
function getColorByConfidence(confidence: number): string {
  if (confidence > 0.8) {
    return '#10b981'; // Green
  } else if (confidence >= 0.5) {
    return '#f59e0b'; // Yellow
  } else {
    return '#ef4444'; // Red
  }
}

export default function DiseaseDetectionCanvas({
  imageUrl,
  detections,
}: DiseaseDetectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load and draw image with bounding boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      // Validate image dimensions
      if (image.width <= 0 || image.height <= 0) {
        console.error('Invalid image dimensions');
        setImageLoaded(false);
        return;
      }

      // Calculate responsive dimensions
      const containerWidth = container.clientWidth;
      const aspectRatio = image.height / image.width;
      const canvasWidth = Math.min(containerWidth, 800);
      const canvasHeight = canvasWidth * aspectRatio;

      // Validate calculated dimensions
      if (!isFinite(canvasWidth) || !isFinite(canvasHeight) || canvasWidth <= 0 || canvasHeight <= 0) {
        console.error('Invalid canvas dimensions');
        setImageLoaded(false);
        return;
      }

      // Set canvas dimensions
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      setDimensions({ width: canvasWidth, height: canvasHeight });

      // Draw image
      ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

      // Calculate scale factors for bounding boxes
      const scaleX = canvasWidth / image.width;
      const scaleY = canvasHeight / image.height;

      // Draw bounding boxes
      detections.forEach((detection) => {
        const [x1, y1, x2, y2] = detection.box;
        
        // Scale coordinates to canvas size
        const scaledX1 = x1 * scaleX;
        const scaledY1 = y1 * scaleY;
        const scaledX2 = x2 * scaleX;
        const scaledY2 = y2 * scaleY;
        const width = scaledX2 - scaledX1;
        const height = scaledY2 - scaledY1;

        // Get color based on confidence
        const color = getColorByConfidence(detection.confidence);

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(scaledX1, scaledY1, width, height);

        // Draw label background
        const label = `${detection.label} (${(detection.confidence * 100).toFixed(0)}%)`;
        ctx.font = 'bold 14px sans-serif';
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textHeight = 20;
        const padding = 4;

        // Position label above box, or below if too close to top
        const labelY = scaledY1 > textHeight + padding ? scaledY1 - padding : scaledY1 + height + textHeight + padding;

        // Draw label background
        ctx.fillStyle = color;
        ctx.fillRect(
          scaledX1,
          labelY - textHeight,
          textWidth + padding * 2,
          textHeight + padding
        );

        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, scaledX1 + padding, labelY - padding);
      });

      setImageLoaded(true);
    };

    image.onerror = () => {
      console.error('Failed to load image');
      setImageLoaded(false);
    };

    image.src = imageUrl;
  }, [imageUrl, detections]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-render by updating a dummy state
      setImageLoaded(false);
      setTimeout(() => setImageLoaded(true), 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto rounded-lg shadow-lg"
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        {!imageLoaded && (
          <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading image...</p>
            </div>
          </div>
        )}
      </div>

      {/* Detection Legend */}
      {detections.length > 0 && imageLoaded && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Detected Diseases:</h3>
          <div className="space-y-2">
            {detections.map((detection, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded border-l-4"
                style={{ borderLeftColor: getColorByConfidence(detection.confidence) }}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{detection.label}</p>
                  <p className="text-sm text-gray-600">
                    Confidence: {(detection.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColorByConfidence(detection.confidence) }}
                />
              </div>
            ))}
          </div>

          {/* Confidence Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Confidence Levels:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700">High (>80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700">Medium (50-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-700">Low (<50%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
