/**
 * Rate Limiting Abstraction
 * Provides request throttling that can be scaled with Redis
 */

import { config } from './config';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-Memory Rate Limiter
 * NOTE: Can be replaced with Redis-based rate limiter for distributed systems
 */
class InMemoryRateLimiter {
  private requests: Map<string, RateLimitEntry>;

  constructor() {
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   * @param identifier - Unique identifier (e.g., IP address, user ID)
   * @returns true if request is allowed, false if rate limited
   */
  async checkLimit(identifier: string): Promise<boolean> {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // No previous requests or window expired
    if (!entry || now > entry.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + config.rateLimit.windowMs,
      });
      return true;
    }

    // Within rate limit
    if (entry.count < config.rateLimit.maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get remaining requests for identifier
   */
  async getRemaining(identifier: string): Promise<number> {
    const entry = this.requests.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return config.rateLimit.maxRequests;
    }
    return Math.max(0, config.rateLimit.maxRequests - entry.count);
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    this.requests.delete(identifier);
  }
}

// Singleton instance
let rateLimiterInstance: InMemoryRateLimiter | null = null;

/**
 * Get rate limiter instance
 * NOTE: Can be swapped with Redis-based rate limiter for production
 */
export function getRateLimiter(): InMemoryRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new InMemoryRateLimiter();
    // TODO: Replace with Redis-based rate limiter for distributed systems
    // rateLimiterInstance = new RedisRateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Helper function to check rate limit
 */
export async function checkRateLimit(identifier: string): Promise<boolean> {
  return getRateLimiter().checkLimit(identifier);
}

// TODO: Redis-based rate limiter for production
// export class RedisRateLimiter { ... }

// Made with Bob
