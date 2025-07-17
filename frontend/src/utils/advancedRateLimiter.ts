
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}

export class AdvancedRateLimiter {
  private static instances = new Map<string, AdvancedRateLimiter>();
  private requests = new Map<string, { count: number; windowStart: number; blocked: boolean }>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  static getInstance(key: string, config: RateLimitConfig): AdvancedRateLimiter {
    if (!this.instances.has(key)) {
      this.instances.set(key, new AdvancedRateLimiter(config));
    }
    return this.instances.get(key)!;
  }

  checkLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    
    let record = this.requests.get(identifier);
    
    if (!record || record.windowStart !== windowStart) {
      record = { count: 0, windowStart, blocked: false };
      this.requests.set(identifier, record);
    }

    const remaining = Math.max(0, this.config.maxRequests - record.count);
    const resetTime = windowStart + this.config.windowMs;
    const retryAfter = Math.max(0, resetTime - now);

    if (record.count >= this.config.maxRequests) {
      record.blocked = true;
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil(retryAfter / 1000)
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: remaining - 1,
      resetTime,
      retryAfter: 0
    };
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  getStats(): { totalRequests: number; blockedRequests: number; activeWindows: number } {
    let totalRequests = 0;
    let blockedRequests = 0;
    
    for (const record of this.requests.values()) {
      totalRequests += record.count;
      if (record.blocked) blockedRequests++;
    }

    return {
      totalRequests,
      blockedRequests,
      activeWindows: this.requests.size
    };
  }
}
