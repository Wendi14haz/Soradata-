export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  errorRate: number;
}

export interface OptimizationRule {
  name: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  action: (metrics: PerformanceMetrics) => Promise<void>;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private rules: OptimizationRule[] = [];
  private isOptimizing = false;
  private metrics: PerformanceMetrics[] = [];
  private maxMetricsHistory = 1000;

  private constructor() {
    this.setupDefaultRules();
    this.startPerformanceMonitoring();
  }

  static getInstance(): PerformanceOptimizer {
    if (!this.instance) {
      this.instance = new PerformanceOptimizer();
    }
    return this.instance;
  }

  addRule(rule: OptimizationRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => {
      const priorities = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorities[a.priority] - priorities[b.priority];
    });
  }

  async recordMetrics(metrics: PerformanceMetrics): Promise<void> {
    this.metrics.push({
      ...metrics,
      timestamp: Date.now()
    } as any);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Trigger optimization if needed
    if (!this.isOptimizing) {
      this.optimize(metrics);
    }
  }

  private async optimize(currentMetrics: PerformanceMetrics): Promise<void> {
    this.isOptimizing = true;

    try {
      for (const rule of this.rules) {
        if (rule.condition(currentMetrics)) {
          console.log(`Triggering optimization rule: ${rule.name}`);
          await rule.action(currentMetrics);
        }
      }
    } catch (error) {
      console.error('Error during optimization:', error);
    } finally {
      this.isOptimizing = false;
    }
  }

  private setupDefaultRules(): void {
    // High response time optimization
    this.addRule({
      name: 'High Response Time Alert',
      condition: (metrics) => metrics.responseTime > 3000,
      action: async (metrics) => {
        console.warn(`High response time detected: ${metrics.responseTime}ms`);
        // Could trigger cache warming, resource scaling, etc.
      },
      priority: 'high'
    });

    // Low cache hit rate optimization
    this.addRule({
      name: 'Cache Hit Rate Optimization',
      condition: (metrics) => metrics.cacheHitRate < 50,
      action: async (metrics) => {
        console.warn(`Low cache hit rate: ${metrics.cacheHitRate}%`);
        // Could trigger cache preloading
      },
      priority: 'medium'
    });

    // High error rate alert
    this.addRule({
      name: 'High Error Rate Alert',
      condition: (metrics) => metrics.errorRate > 5,
      action: async (metrics) => {
        console.error(`High error rate detected: ${metrics.errorRate}%`);
        // Could trigger fallback mechanisms
      },
      priority: 'critical'
    });

    // Memory usage optimization
    this.addRule({
      name: 'Memory Usage Optimization',
      condition: (metrics) => metrics.memoryUsage > 80,
      action: async (metrics) => {
        console.warn(`High memory usage: ${metrics.memoryUsage}%`);
        // Could trigger garbage collection or cache cleanup
        if (typeof window !== 'undefined' && (window as any).gc) {
          (window as any).gc();
        }
      },
      priority: 'high'
    });
  }

  private startPerformanceMonitoring(): void {
    // Monitor performance every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      const metrics: PerformanceMetrics = {
        responseTime: this.calculateAverageResponseTime(),
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.getCPUUsage(),
        cacheHitRate: this.calculateCacheHitRate(),
        errorRate: this.calculateErrorRate()
      };

      await this.recordMetrics(metrics);
    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }

  private calculateAverageResponseTime(): number {
    const recentMetrics = this.metrics.slice(-10);
    if (recentMetrics.length === 0) return 0;
    return recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
    }
    return 0;
  }

  private getCPUUsage(): number {
    // Simplified CPU usage estimation
    const start = performance.now();
    let iterations = 0;
    const maxTime = 10; // 10ms test

    while (performance.now() - start < maxTime) {
      iterations++;
    }

    // Normalize to percentage (higher iterations = lower CPU usage)
    return Math.max(0, Math.min(100, 100 - (iterations / 10000)));
  }

  private calculateCacheHitRate(): number {
    // This would typically come from cache statistics
    return Math.random() * 100; // Placeholder
  }

  private calculateErrorRate(): number {
    const recentMetrics = this.metrics.slice(-100);
    if (recentMetrics.length === 0) return 0;
    return recentMetrics.filter(m => m.errorRate > 0).length;
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();
