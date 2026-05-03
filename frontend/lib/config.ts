/**
 * Application Configuration
 * Centralized configuration for scalability and production readiness
 */

export const config = {
  // Cache Configuration
  cache: {
    maxSize: 100, // Maximum number of cache entries
    ttl: 3600000, // Time-to-live in milliseconds (1 hour)
    cleanupInterval: 300000, // Cleanup interval in milliseconds (5 minutes)
  },

  // Rate Limiting Configuration
  rateLimit: {
    maxRequests: 10, // Maximum requests per window
    windowMs: 60000, // Time window in milliseconds (1 minute)
  },

  // API Configuration
  api: {
    timeout: 30000, // Request timeout in milliseconds (30 seconds)
    maxRetries: 3, // Maximum retry attempts
  },

  // AI Model Configuration
  ai: {
    confidenceThreshold: 0.5, // Minimum confidence for explanations
    streamingEnabled: true, // Enable streaming responses
  },
} as const;

// Type-safe config access
export type AppConfig = typeof config;

// Made with Bob
