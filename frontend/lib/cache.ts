/**
 * Cache Abstraction Layer
 * Provides a unified interface for caching that can be swapped with Redis
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
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor() {
    this.cache = new Map();
    this.startCleanup();
  }

  async get(key: string): Promise<string | null> {
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
   * Cleanup expired entries periodically
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      Array.from(this.cache.entries()).forEach(([key, entry]) => {
        if (now - entry.timestamp > config.cache.ttl) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => this.cache.delete(key));

      if (keysToDelete.length > 0) {
        console.log(`[Cache] Cleaned up ${keysToDelete.length} expired entries`);
      }
    }, config.cache.cleanupInterval);
  }

  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
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
