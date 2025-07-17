
import { BackendMonitor } from './backendMonitor';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  retryAfter?: number;
}

export class AdvancedRateLimiter {
  private static limits = new Map<string, { count: number; resetTime: number }>();
  private static configs = new Map<string, RateLimitConfig>();

  static configure(key: string, config: RateLimitConfig): void {
    this.configs.set(key, config);
  }

  static checkLimit(key: string, identifier: string): RateLimitResult {
    const config = this.configs.get(key);
    if (!config) {
      throw new Error(`Rate limit configuration not found for key: ${key}`);
    }

    const limitKey = `${key}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let limit = this.limits.get(limitKey);
    
    // Reset if window has passed
    if (!limit || limit.resetTime <= now) {
      limit = {
        count: 0,
        resetTime: now + config.windowMs
      };
      this.limits.set(limitKey, limit);
    }

    const allowed = limit.count < config.maxRequests;
    
    if (allowed) {
      limit.count++;
    }

    const result: RateLimitResult = {
      allowed,
      remainingRequests: Math.max(0, config.maxRequests - limit.count),
      resetTime: limit.resetTime
    };

    if (!allowed) {
      result.retryAfter = Math.ceil((limit.resetTime - now) / 1000);
      
      // Log rate limit exceeded
      BackendMonitor.recordMetric({
        name: 'rate_limit_exceeded',
        value: 1,
        type: 'counter',
        tags: { key, identifier }
      });
    }

    return result;
  }

  static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, limit] of this.limits.entries()) {
      if (limit.resetTime <= now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.limits.delete(key));
  }

  // Advanced sliding window rate limiter
  static slidingWindowCheck(key: string, identifier: string, maxRequests: number, windowMs: number): RateLimitResult {
    const limitKey = `sliding:${key}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request timestamps array
    let timestamps = this.getTimestamps(limitKey) || [];
    
    // Remove old timestamps outside the window
    timestamps = timestamps.filter(ts => ts > windowStart);
    
    const allowed = timestamps.length < maxRequests;
    
    if (allowed) {
      timestamps.push(now);
      this.setTimestamps(limitKey, timestamps);
    }

    return {
      allowed,
      remainingRequests: Math.max(0, maxRequests - timestamps.length),
      resetTime: timestamps.length > 0 ? timestamps[0] + windowMs : now + windowMs,
      retryAfter: allowed ? undefined : Math.ceil((timestamps[0] + windowMs - now) / 1000)
    };
  }

  private static timestampCache = new Map<string, number[]>();

  private static getTimestamps(key: string): number[] | undefined {
    return this.timestampCache.get(key);
  }

  private static setTimestamps(key: string, timestamps: number[]): void {
    this.timestampCache.set(key, timestamps);
    
    // Cleanup old entries periodically
    if (this.timestampCache.size > 10000) {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      for (const [cacheKey, ts] of this.timestampCache.entries()) {
        if (ts.length === 0 || Math.max(...ts) < now - 3600000) { // 1 hour old
          keysToDelete.push(cacheKey);
        }
      }
      
      keysToDelete.forEach(key => this.timestampCache.delete(key));
    }
  }

  // Distributed rate limiting using database
  static async distributedCheck(key: string, identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    // This would integrate with Redis or database for distributed rate limiting
    // For now, fallback to local rate limiting
    return this.checkLimit(key, identifier);
  }
}

// Rate limiting decorator
export function rateLimit(config: RateLimitConfig, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const limitKey = `${target.constructor.name}.${propertyName}`;
    
    AdvancedRateLimiter.configure(limitKey, config);

    descriptor.value = async function (...args: any[]) {
      const identifier = keyGenerator ? keyGenerator(...args) : 'default';
      const result = AdvancedRateLimiter.checkLimit(limitKey, identifier);
      
      if (!result.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
      }

      return method.apply(this, args);
    };
  };
}
