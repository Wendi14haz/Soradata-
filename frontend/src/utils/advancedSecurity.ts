export interface SecurityRule {
  name: string;
  check: (context: SecurityContext) => Promise<SecurityResult>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
  headers?: Record<string, string>;
  payload?: any;
}

export interface SecurityResult {
  passed: boolean;
  message: string;
  riskScore: number; // 0-100
  recommendedAction?: 'block' | 'challenge' | 'monitor' | 'allow';
}

export interface SecurityEvent {
  timestamp: number;
  eventType: 'violation' | 'threat' | 'anomaly' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: SecurityContext;
  result: SecurityResult;
  actionTaken?: string;
}

export class AdvancedSecurity {
  private static instance: AdvancedSecurity;
  private rules: SecurityRule[] = [];
  private events: SecurityEvent[] = [];
  private rateLimiters = new Map<string, { count: number; resetTime: number }>();
  private blockedIPs = new Set<string>();
  private suspiciousPatterns = new Map<string, number>();

  private constructor() {
    this.setupDefaultRules();
  }

  static getInstance(): AdvancedSecurity {
    if (!this.instance) {
      this.instance = new AdvancedSecurity();
    }
    return this.instance;
  }

  async validateRequest(context: SecurityContext): Promise<SecurityResult> {
    const results: SecurityResult[] = [];

    // Run all security checks
    for (const rule of this.rules) {
      try {
        const result = await rule.check(context);
        results.push(result);

        // Log security event
        this.logSecurityEvent({
          timestamp: Date.now(),
          eventType: result.passed ? 'success' : 'violation',
          severity: rule.severity,
          context,
          result
        });

        // If any critical rule fails, return immediately
        if (!result.passed && rule.severity === 'critical') {
          return result;
        }
      } catch (error) {
        console.error(`Security rule ${rule.name} failed:`, error);
      }
    }

    // Calculate overall risk score
    const failedResults = results.filter(r => !r.passed);
    const overallRiskScore = failedResults.length > 0 
      ? Math.max(...failedResults.map(r => r.riskScore))
      : 0;

    // Determine overall result
    const overallPassed = failedResults.length === 0;
    
    return {
      passed: overallPassed,
      message: overallPassed 
        ? 'Request passed all security checks'
        : `Failed ${failedResults.length} security checks`,
      riskScore: overallRiskScore,
      recommendedAction: this.getRecommendedAction(overallRiskScore)
    };
  }

  private setupDefaultRules(): void {
    // Rate limiting rule
    this.addRule({
      name: 'Rate Limiting',
      check: async (context) => {
        const key = context.userId || context.ipAddress || 'anonymous';
        const now = Date.now();
        const windowMs = 60000; // 1 minute
        const maxRequests = 100;

        const limiter = this.rateLimiters.get(key);
        if (!limiter || limiter.resetTime <= now) {
          this.rateLimiters.set(key, { count: 1, resetTime: now + windowMs });
          return { passed: true, message: 'Rate limit OK', riskScore: 0 };
        }

        limiter.count++;
        if (limiter.count > maxRequests) {
          return {
            passed: false,
            message: 'Rate limit exceeded',
            riskScore: 80,
            recommendedAction: 'block' as const
          };
        }

        return { passed: true, message: 'Rate limit OK', riskScore: 0 };
      },
      severity: 'high'
    });

    // SQL Injection detection
    this.addRule({
      name: 'SQL Injection Detection',
      check: async (context) => {
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
          /(UNION\s+SELECT)/i,
          /(\'\s*OR\s*\'\s*=\s*\')/i,
          /(\'\s*OR\s*1\s*=\s*1)/i,
          /(--|\#)/,
          /(\bOR\b.*\bAND\b)/i
        ];

        const payloadStr = JSON.stringify(context.payload || {});
        const pathStr = context.requestPath || '';
        
        const testString = payloadStr + ' ' + pathStr;
        
        for (const pattern of sqlPatterns) {
          if (pattern.test(testString)) {
            return {
              passed: false,
              message: 'Potential SQL injection detected',
              riskScore: 95,
              recommendedAction: 'block' as const
            };
          }
        }

        return { passed: true, message: 'No SQL injection patterns detected', riskScore: 0 };
      },
      severity: 'critical'
    });

    // XSS detection
    this.addRule({
      name: 'XSS Detection',
      check: async (context) => {
        const xssPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe/gi,
          /<object/gi,
          /<embed/gi
        ];

        const payloadStr = JSON.stringify(context.payload || {});
        
        for (const pattern of xssPatterns) {
          if (pattern.test(payloadStr)) {
            return {
              passed: false,
              message: 'Potential XSS attack detected',
              riskScore: 90,
              recommendedAction: 'block' as const
            };
          }
        }

        return { passed: true, message: 'No XSS patterns detected', riskScore: 0 };
      },
      severity: 'critical'
    });

    // Suspicious behavior detection
    this.addRule({
      name: 'Suspicious Behavior Detection',
      check: async (context) => {
        const key = context.userId || context.ipAddress || 'anonymous';
        const suspiciousScore = this.suspiciousPatterns.get(key) || 0;

        // Check for rapid successive requests
        const recentEvents = this.events.filter(e => 
          e.timestamp > Date.now() - 60000 && // Last minute
          (e.context.userId === context.userId || e.context.ipAddress === context.ipAddress)
        );

        if (recentEvents.length > 50) {
          this.suspiciousPatterns.set(key, suspiciousScore + 10);
          return {
            passed: false,
            message: 'Suspicious rapid requests detected',
            riskScore: 70,
            recommendedAction: 'challenge' as const
          };
        }

        return { passed: true, message: 'Behavior appears normal', riskScore: suspiciousScore };
      },
      severity: 'medium'
    });

    // File upload validation
    this.addRule({
      name: 'File Upload Validation',
      check: async (context) => {
        if (context.requestPath?.includes('/upload') && context.payload) {
          const allowedTypes = ['image/', 'text/', 'application/pdf', 'application/json'];
          const maxSize = 10 * 1024 * 1024; // 10MB

          if (context.payload.fileType && !allowedTypes.some(type => 
            context.payload.fileType.startsWith(type)
          )) {
            return {
              passed: false,
              message: 'File type not allowed',
              riskScore: 60,
              recommendedAction: 'block' as const
            };
          }

          if (context.payload.fileSize && context.payload.fileSize > maxSize) {
            return {
              passed: false,
              message: 'File size exceeds limit',
              riskScore: 40,
              recommendedAction: 'block' as const
            };
          }
        }

        return { passed: true, message: 'File upload validation passed', riskScore: 0 };
      },
      severity: 'medium'
    });
  }

  addRule(rule: SecurityRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => {
      const priorities = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorities[a.severity] - priorities[b.severity];
    });
  }

  private getRecommendedAction(riskScore: number): 'block' | 'challenge' | 'monitor' | 'allow' {
    if (riskScore >= 80) return 'block';
    if (riskScore >= 60) return 'challenge';
    if (riskScore >= 30) return 'monitor';
    return 'allow';
  }

  private logSecurityEvent(event: SecurityEvent): void {
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000);
    }

    // Log critical events
    if (event.severity === 'critical' || event.eventType === 'threat') {
      console.error('SECURITY ALERT:', event);
    }
  }

  getSecurityEvents(filter?: { 
    eventType?: string; 
    severity?: string; 
    timeRange?: number 
  }): SecurityEvent[] {
    let filtered = [...this.events];

    if (filter?.eventType) {
      filtered = filtered.filter(e => e.eventType === filter.eventType);
    }

    if (filter?.severity) {
      filtered = filtered.filter(e => e.severity === filter.severity);
    }

    if (filter?.timeRange) {
      const cutoff = Date.now() - filter.timeRange;
      filtered = filtered.filter(e => e.timestamp > cutoff);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  getSecurityReport(): {
    totalEvents: number;
    violations: number;
    threats: number;
    riskDistribution: Record<string, number>;
    topViolations: Array<{ rule: string; count: number }>;
  } {
    const totalEvents = this.events.length;
    const violations = this.events.filter(e => e.eventType === 'violation').length;
    const threats = this.events.filter(e => e.eventType === 'threat').length;

    const riskDistribution = {
      low: this.events.filter(e => e.result.riskScore < 30).length,
      medium: this.events.filter(e => e.result.riskScore >= 30 && e.result.riskScore < 60).length,
      high: this.events.filter(e => e.result.riskScore >= 60 && e.result.riskScore < 80).length,
      critical: this.events.filter(e => e.result.riskScore >= 80).length
    };

    const violationCounts = new Map<string, number>();
    this.events.filter(e => e.eventType === 'violation').forEach(event => {
      const rule = event.result.message;
      violationCounts.set(rule, (violationCounts.get(rule) || 0) + 1);
    });

    const topViolations = Array.from(violationCounts.entries())
      .map(([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents,
      violations,
      threats,
      riskDistribution,
      topViolations
    };
  }
}

export const security = AdvancedSecurity.getInstance();
