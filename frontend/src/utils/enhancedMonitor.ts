
import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'performance' | 'error' | 'business' | 'security';
  tags?: Record<string, string>;
}

export interface AlertRule {
  metricName: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  windowMinutes: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class EnhancedMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static alerts: AlertRule[] = [];
  private static batchSize = 50;
  private static flushInterval = 15000; // 15 seconds

  static {
    // Auto-flush metrics
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);

    // Setup default alerts
    this.setupDefaultAlerts();
  }

  static recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    });

    // Check for alerts
    this.checkAlerts(metric.name, metric.value);

    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  static async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      // Store metrics in localStorage for persistence
      const existingMetrics = JSON.parse(localStorage.getItem('app_metrics') || '[]');
      const allMetrics = [...existingMetrics, ...metricsToFlush].slice(-1000); // Keep last 1000 metrics
      localStorage.setItem('app_metrics', JSON.stringify(allMetrics));

      // Log important metrics
      const errorMetrics = metricsToFlush.filter(m => m.category === 'error');
      const performanceMetrics = metricsToFlush.filter(m => m.category === 'performance');
      
      if (errorMetrics.length > 0) {
        console.error('Error metrics recorded:', errorMetrics);
      }
      
      if (performanceMetrics.some(m => m.value > 5000)) { // Slow operations > 5s
        console.warn('Slow operations detected:', performanceMetrics.filter(m => m.value > 5000));
      }

    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Re-add failed metrics back to queue
      this.metrics.unshift(...metricsToFlush);
    }
  }

  static addAlert(rule: AlertRule) {
    this.alerts.push(rule);
  }

  private static checkAlerts(metricName: string, value: number) {
    const relevantAlerts = this.alerts.filter(alert => alert.metricName === metricName);
    
    for (const alert of relevantAlerts) {
      let triggered = false;
      
      switch (alert.condition) {
        case 'greater_than':
          triggered = value > alert.threshold;
          break;
        case 'less_than':
          triggered = value < alert.threshold;
          break;
        case 'equals':
          triggered = value === alert.threshold;
          break;
      }

      if (triggered) {
        this.triggerAlert(alert, value);
      }
    }
  }

  private static triggerAlert(rule: AlertRule, value: number) {
    const alertMessage = `Alert: ${rule.metricName} ${rule.condition} ${rule.threshold} (current: ${value})`;
    
    console.warn(`[${rule.severity.toUpperCase()}] ${alertMessage}`);
    
    // Store alert in localStorage
    const alerts = JSON.parse(localStorage.getItem('app_alerts') || '[]');
    alerts.push({
      ...rule,
      triggeredAt: Date.now(),
      currentValue: value,
      message: alertMessage
    });
    localStorage.setItem('app_alerts', JSON.stringify(alerts.slice(-100))); // Keep last 100 alerts
  }

  private static setupDefaultAlerts() {
    this.addAlert({
      metricName: 'api_response_time',
      condition: 'greater_than',
      threshold: 5000,
      windowMinutes: 5,
      severity: 'high'
    });

    this.addAlert({
      metricName: 'error_rate',
      condition: 'greater_than',
      threshold: 10,
      windowMinutes: 5,
      severity: 'critical'
    });

    this.addAlert({
      metricName: 'file_processing_errors',
      condition: 'greater_than',
      threshold: 3,
      windowMinutes: 10,
      severity: 'medium'
    });
  }

  static getMetrics(category?: string, timeRange?: number): PerformanceMetric[] {
    try {
      const stored = JSON.parse(localStorage.getItem('app_metrics') || '[]');
      let metrics = stored;

      if (category) {
        metrics = metrics.filter((m: PerformanceMetric) => m.category === category);
      }

      if (timeRange) {
        const cutoff = Date.now() - timeRange;
        metrics = metrics.filter((m: PerformanceMetric) => m.timestamp >= cutoff);
      }

      return metrics;
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return [];
    }
  }

  static getAlerts(): any[] {
    try {
      return JSON.parse(localStorage.getItem('app_alerts') || '[]');
    } catch (error) {
      console.error('Failed to get alerts:', error);
      return [];
    }
  }

  static clearMetrics() {
    localStorage.removeItem('app_metrics');
    localStorage.removeItem('app_alerts');
    this.metrics = [];
  }
}

// Performance monitoring decorator
export function monitored(category: PerformanceMetric['category'] = 'performance') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      const methodName = `${target.constructor.name}.${propertyName}`;

      try {
        const result = await method.apply(this, args);
        const duration = performance.now() - startTime;
        
        EnhancedMonitor.recordMetric({
          name: `${methodName}_duration`,
          value: duration,
          category,
          tags: { status: 'success', method: methodName }
        });

        return result;
      } catch (error: any) {
        const duration = performance.now() - startTime;
        
        EnhancedMonitor.recordMetric({
          name: `${methodName}_error`,
          value: 1,
          category: 'error',
          tags: { method: methodName, error: error.message }
        });

        EnhancedMonitor.recordMetric({
          name: `${methodName}_duration`,
          value: duration,
          category,
          tags: { status: 'error', method: methodName }
        });

        throw error;
      }
    };
  };
}
