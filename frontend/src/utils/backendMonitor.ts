
import { supabase } from '@/integrations/supabase/client';
import { ErrorHandler } from './errorHandler';

export interface SystemMetric {
  name: string;
  value: number;
  type: 'counter' | 'gauge' | 'histogram';
  tags?: Record<string, any>;
}

export interface APIUsageLog {
  endpoint: string;
  method: string;
  statusCode?: number;
  responseTime?: number;
  requestSize?: number;
  responseSize?: number;
  errorMessage?: string;
}

export class BackendMonitor {
  private static metrics: SystemMetric[] = [];
  private static batchSize = 100;
  private static flushInterval = 30000; // 30 seconds

  static {
    // Auto-flush metrics periodically
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  static async recordMetric(metric: SystemMetric) {
    this.metrics.push({
      ...metric,
      tags: { 
        timestamp: Date.now(),
        userAgent: navigator.userAgent.substring(0, 200),
        ...metric.tags 
      }
    });

    if (this.metrics.length >= this.batchSize) {
      await this.flushMetrics();
    }
  }

  static async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      for (const metric of metricsToFlush) {
        // Use a more flexible approach for RPC calls
        const { error } = await (supabase as any).rpc('record_metric', {
          p_name: metric.name,
          p_value: metric.value,
          p_type: metric.type,
          p_tags: metric.tags || {}
        });
        
        if (error) {
          console.error('Failed to record metric:', error);
        }
      }
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Re-add failed metrics back to queue
      this.metrics.unshift(...metricsToFlush);
    }
  }

  static async logAPIUsage(userId: string, usage: APIUsageLog) {
    try {
      const { error } = await (supabase as any).rpc('log_api_usage', {
        p_user_id: userId,
        p_endpoint: usage.endpoint,
        p_method: usage.method,
        p_status_code: usage.statusCode,
        p_response_time_ms: usage.responseTime,
        p_request_size_bytes: usage.requestSize,
        p_response_size_bytes: usage.responseSize,
        p_ip_address: null, // Will be set by backend
        p_user_agent: navigator.userAgent.substring(0, 500),
        p_error_message: usage.errorMessage
      });
      
      if (error) {
        console.error('Failed to log API usage:', error);
      }
    } catch (error) {
      console.error('Failed to log API usage:', error);
    }
  }

  static async checkUsageQuota(userId: string, amount: number = 1): Promise<boolean> {
    try {
      const { data, error } = await (supabase as any).rpc('increment_usage', {
        p_user_id: userId,
        p_amount: amount
      });

      if (error) {
        console.error('Failed to check usage quota:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Failed to check usage quota:', error);
      return false;
    }
  }

  static async getSystemHealth(): Promise<Record<string, any>> {
    try {
      // Since we can't access system_metrics table directly due to type restrictions,
      // we'll return basic health metrics from available tables
      const { data: files, error: filesError } = await supabase
        .from('user_files')
        .select('id, created_at')
        .gte('upload_date', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('upload_date', { ascending: false })
        .limit(100);

      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id, created_at')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('created_at', { ascending: false })
        .limit(100);

      if (filesError) console.error('Files query error:', filesError);
      if (sessionsError) console.error('Sessions query error:', sessionsError);

      return {
        totalFiles: files?.length || 0,
        totalSessions: sessions?.length || 0,
        activeUsers: Math.max(files?.length || 0, sessions?.length || 0),
        lastUpdated: new Date().toISOString(),
        status: 'healthy'
      };
    } catch (error) {
      console.error('Failed to get system health:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / values.length);
  }

  private static calculateErrorRate(total: number, errors: number): number {
    return total > 0 ? Math.round((errors / total) * 100) : 0;
  }
}

// Performance monitoring decorator
export function monitored(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = performance.now();
    const methodName = `${target.constructor.name}.${propertyName}`;

    try {
      const result = await method.apply(this, args);
      const endTime = performance.now();
      
      BackendMonitor.recordMetric({
        name: 'method_execution_time',
        value: endTime - startTime,
        type: 'histogram',
        tags: { method: methodName, status: 'success' }
      });

      return result;
    } catch (error: any) {
      const endTime = performance.now();
      
      BackendMonitor.recordMetric({
        name: 'method_execution_time',
        value: endTime - startTime,
        type: 'histogram',
        tags: { method: methodName, status: 'error' }
      });

      BackendMonitor.recordMetric({
        name: 'method_errors',
        value: 1,
        type: 'counter',
        tags: { method: methodName, error: error.message }
      });

      throw error;
    }
  };
}
