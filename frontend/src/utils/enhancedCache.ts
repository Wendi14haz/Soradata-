
export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  onExpire?: (key: string, value: any) => void;
  compress?: boolean;
}

export interface CacheEntry<T = any> {
  value: T;
  expires: number;
  created: number;
  hits: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
  entries: number;
}

export class EnhancedCache {
  private cache = new Map<string, CacheEntry>();
  private stats = { hits: 0, misses: 0 };
  private options: Required<CacheOptions>;
  private cleanupInterval: number;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 300000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      onExpire: options.onExpire || (() => {}),
      compress: options.compress || false
    };

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000) as any;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl || this.options.ttl);
    const serialized = JSON.stringify(value);
    const size = new Blob([serialized]).size;

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.options.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      value,
      expires,
      created: Date.now(),
      hits: 0,
      size
    };

    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.options.onExpire(key, entry.value);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.options.onExpire(key, entry.value);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    let memoryUsage = 0;
    
    for (const entry of this.cache.values()) {
      memoryUsage += entry.size;
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 100) : 0,
      size: this.cache.size,
      memoryUsage,
      entries: this.cache.size
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        keysToDelete.push(key);
        this.options.onExpire(key, entry.value);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.created < oldestTime) {
        oldestTime = entry.created;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      if (entry) {
        this.options.onExpire(oldestKey, entry.value);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }

  // Advanced cache operations
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T> | T, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  touch(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.expires = Date.now() + (ttl || this.options.ttl);
    return true;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): any[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  entries(): [string, any][] {
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
  }
}

// Global cache instances
export const apiCache = new EnhancedCache({ ttl: 300000, maxSize: 500 }); // 5 minutes, 500 entries
export const fileCache = new EnhancedCache({ ttl: 3600000, maxSize: 100 }); // 1 hour, 100 files
export const userCache = new EnhancedCache({ ttl: 1800000, maxSize: 1000 }); // 30 minutes, 1000 users
