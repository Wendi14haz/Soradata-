
import { supabase } from '@/integrations/supabase/client';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  hitRate: number;
}

export class AdvancedCacheManager {
  private static cache = new Map<string, CacheEntry>();
  private static maxSize = 1000;
  private static stats = { hits: 0, misses: 0 };
  private static cleanupInterval = 300000; // 5 minutes

  static {
    // Periodic cleanup of expired entries
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  static set<T>(key: string, data: T, ttl: number = 300000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      key
    });
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  static has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  static getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      entries: this.cache.size,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 100) : 0
    };
  }

  static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Database query caching with automatic invalidation
  static async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300000,
    invalidationTags: string[] = []
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return cached;

    const result = await queryFn();
    this.set(key, result, ttl);

    // Store invalidation tags for cache invalidation
    if (invalidationTags.length > 0) {
      this.set(`tags:${key}`, invalidationTags, ttl);
    }

    return result;
  }

  static invalidateByTag(tag: string): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith('tags:')) {
        const tags = entry.data as string[];
        if (tags.includes(tag)) {
          const originalKey = key.replace('tags:', '');
          keysToDelete.push(originalKey);
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Persistent cache using localStorage for larger data
  static async setPersistent<T>(key: string, data: T, ttl: number = 86400000): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        key
      };

      localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to set persistent cache:', error);
    }
  }

  static async getPersistent<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(`cache:${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`cache:${key}`);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Failed to get persistent cache:', error);
      return null;
    }
  }

  // File processing cache
  static cacheFileProcessing(fileHash: string, data: any, ttl: number = 3600000): void {
    this.set(`file:${fileHash}`, data, ttl);
  }

  static getCachedFileProcessing(fileHash: string): any | null {
    return this.get(`file:${fileHash}`);
  }
}

// Export alias for backward compatibility
export const AICacheManager = AdvancedCacheManager;

// Cache decorator for methods
export function cached(ttl: number = 300000, invalidationTags: string[] = []) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
      
      return AdvancedCacheManager.cachedQuery(
        cacheKey,
        () => method.apply(this, args),
        ttl,
        invalidationTags
      );
    };
  };
}
