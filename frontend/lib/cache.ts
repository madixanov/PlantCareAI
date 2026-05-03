/**
 * Cache Abstraction Layer
 * Provides a unified interface for caching that can be swapped with Redis
 * NOTE: Currently uses in-memory storage (replace with Redis in production)
 */

import { config } from './config';

export interface CacheEntry<T = string> {
  value: T;
  timestamp: number;
}

export interface CacheAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

/**
 * In-Memory Cache Implementation
 * NOTE: Can be replaced with Redis adapter for production
 */
class InMemoryCache implements CacheAdapter {
  private cache: Map<string, CacheEntry>;
  private lastCleanupTime: number;

  constructor() {
    this.cache = new Map();
    this.lastCleanupTime = Date.now();
  }

  async get(key: string): Promise<string | null> {
    // Run lazy cleanup periodically
    this.maybeCleanup();
    
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > config.cache.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    // Run lazy cleanup periodically
    this.maybeCleanup();
    
    // Enforce cache size limit (FIFO eviction)
    if (this.cache.size >= config.cache.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  /**
   * Lazy cleanup: only run when cache is accessed
   * Runs at most once every 10 minutes
   */
  private maybeCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanupTime > config.cache.cleanupInterval) {
      this.cleanupExpired();
      this.lastCleanupTime = now;
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    // Use Array.from for TypeScript compatibility
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > config.cache.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[Cache] Cleaned up ${cleanedCount} expired entries`);
    }
  }
}

// Singleton instance
let cacheInstance: CacheAdapter | null = null;

/**
 * Get cache instance
 * NOTE: This can be swapped with RedisCache for production
 */
export function getCache(): CacheAdapter {
  if (!cacheInstance) {
    cacheInstance = new InMemoryCache();
    // TODO: Replace with Redis adapter for production
    // cacheInstance = new RedisCache();
  }
  return cacheInstance;
}

/**
 * Helper functions for common cache operations
 */
export const cache = {
  async get(key: string): Promise<string | null> {
    return getCache().get(key);
  },

  async set(key: string, value: string, ttl?: number): Promise<void> {
    return getCache().set(key, value, ttl);
  },

  async delete(key: string): Promise<void> {
    return getCache().delete(key);
  },

  async clear(): Promise<void> {
    return getCache().clear();
  },

  async size(): Promise<number> {
    return getCache().size();
  },
};

// TODO: Redis adapter implementation for production
// export class RedisCache implements CacheAdapter { ... }

// Made with Bob
