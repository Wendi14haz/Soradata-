import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useAdvancedSystem } from './useAdvancedSystem';
import { AdvancedRateLimiter } from '@/utils/advancedRateLimiter';
import { EnhancedMonitor, monitored } from '@/utils/enhancedMonitor';
import { EnhancedCache, apiCache, fileCache } from '@/utils/enhancedCache';
import { jobManager } from '@/utils/enhancedJobManager';
import { supabase } from '@/integrations/supabase/client';

export const useAdvancedBackend = () => {
  const { user } = useAuth();
  const { 
    systemStatus, 
    trackEvent, 
    validateRequest, 
    recordPerformanceMetrics,
    getDetailedAnalytics,
    exportSystemReport
  } = useAdvancedSystem();
  
  const [loading, setLoading] = useState(false);

  const rateLimiters = useMemo(() => ({
    fileUpload: AdvancedRateLimiter.getInstance('file_upload', {
      maxRequests: 15,
      windowMs: 60000,
      skipSuccessfulRequests: false
    }),
    apiCalls: AdvancedRateLimiter.getInstance('api_calls', {
      maxRequests: 200,
      windowMs: 60000,
      skipFailedRequests: true
    }),
    chatMessages: AdvancedRateLimiter.getInstance('chat_messages', {
      maxRequests: 50,
      windowMs: 60000,
      skipSuccessfulRequests: false
    })
  }), []);

  const recordMetric = useCallback((name: string, value: number, category: any = 'performance', tags?: Record<string, string>) => {
    EnhancedMonitor.recordMetric({ name, value, category, tags });
    
    // Also track in analytics
    trackEvent('system_metric', {
      metricName: name,
      metricValue: value.toString(),
      category,
      ...tags
    });
  }, [trackEvent]);

  const checkRateLimit = useCallback((action: string): { allowed: boolean; remaining: number; retryAfter: number } => {
    if (!user) return { allowed: false, remaining: 0, retryAfter: 60 };
    
    const limiter = rateLimiters[action as keyof typeof rateLimiters];
    if (!limiter) return { allowed: true, remaining: 100, retryAfter: 0 };
    
    const result = limiter.checkLimit(user.id);
    
    if (!result.allowed) {
      recordMetric('rate_limit_exceeded', 1, 'security', { action, userId: user.id });
      trackEvent('rate_limit_exceeded', { action, userId: user.id });
    }
    
    return result;
  }, [user, rateLimiters, recordMetric, trackEvent]);

  const enqueueBackgroundJob = useCallback(async (
    type: string, 
    payload: any, 
    options: { 
      priority?: 'low' | 'normal' | 'high' | 'critical';
      maxRetries?: number;
      timeout?: number;
      scheduledAt?: Date;
    } = {}
  ): Promise<string> => {
    const jobId = await jobManager.enqueue({
      type,
      payload: { ...payload, userId: user?.id },
      priority: options.priority || 'normal',
      maxRetries: options.maxRetries || 3,
      retryDelay: 1000,
      timeout: options.timeout || 30000,
      scheduledAt: options.scheduledAt
    });

    recordMetric('background_job_enqueued', 1, 'business', { type, priority: options.priority || 'normal' });
    trackEvent('background_job_enqueued', { type, priority: options.priority || 'normal' });
    return jobId;
  }, [user, recordMetric, trackEvent]);

  const getJobStatus = useCallback((jobId: string) => {
    return jobManager.getJobStatus(jobId);
  }, []);

  const fetchSystemHealth = useCallback(async () => {
    setLoading(true);
    try {
      const startTime = performance.now();
      
      const cacheStats = {
        api: apiCache.getStats(),
        file: fileCache.getStats(),
        user: apiCache.getStats()
      };

      const rateLimitStats = Object.entries(rateLimiters).reduce((acc, [key, limiter]) => {
        acc[key] = limiter.getStats();
        return acc;
      }, {} as Record<string, any>);

      const jobStats = jobManager.getQueueStats();
      const recentMetrics = EnhancedMonitor.getMetrics('performance', 3600000);
      const recentAlerts = EnhancedMonitor.getAlerts().slice(-10);

      const avgResponseTime = recentMetrics.length > 0 
        ? recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length 
        : 0;

      const errorRate = recentMetrics.filter(m => m.name.includes('_error')).length;
      const responseTime = performance.now() - startTime;

      // Record performance metrics
      await recordPerformanceMetrics({
        responseTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize ? 
          Math.round(((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100) : 0,
        cacheHitRate: cacheStats.api.hitRate,
        errorRate
      });

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime,
        cache: cacheStats,
        rateLimiting: rateLimitStats,
        jobs: jobStats,
        performance: {
          avgResponseTime: Math.round(avgResponseTime),
          errorRate,
          totalMetrics: recentMetrics.length
        },
        alerts: recentAlerts,
        memory: {
          used: (performance as any).memory?.usedJSHeapSize || 0,
          total: (performance as any).memory?.totalJSHeapSize || 0
        },
        // Add advanced system status
        advancedStatus: systemStatus
      };

      recordMetric('system_health_check', responseTime, 'performance');
      trackEvent('system_health_check', { responseTime: responseTime.toString() });

      return health;

    } catch (error: any) {
      console.error('Failed to fetch system health:', error);
      recordMetric('system_health_error', 1, 'error', { error: error.message });
      trackEvent('system_health_error', { error: error.message });
      
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, [rateLimiters, recordMetric, trackEvent, recordPerformanceMetrics, systemStatus]);

  // Enhanced file processing with security validation
  const processFileWithMonitoring = useCallback(async (file: File) => {
    if (!user) throw new Error('User not authenticated');

    const startTime = performance.now();
    const fileHash = btoa(file.name + file.size + file.lastModified).substring(0, 32);
    
    // Security validation
    const securityResult = await validateRequest({
      requestPath: '/file/upload',
      payload: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    });

    if (!securityResult.passed) {
      throw new Error(`Security validation failed: ${securityResult.message}`);
    }

    const cached = fileCache.get(`processed_${fileHash}`);
    if (cached) {
      recordMetric('file_cache_hit', 1, 'performance', { fileName: file.name });
      trackEvent('file_cache_hit', { fileName: file.name });
      return cached;
    }

    try {
      recordMetric('file_processing_started', 1, 'business', { 
        fileName: file.name, 
        fileSize: file.size.toString(),
        fileType: file.type 
      });

      trackEvent('file_processing_started', {
        fileName: file.name,
        fileSize: file.size.toString(),
        fileType: file.type
      });

      const jobId = await enqueueBackgroundJob('file_processing', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileHash
      }, { priority: 'high', timeout: 60000 });

      const processingTime = performance.now() - startTime;
      const result = { jobId, processingTime, fileHash };
      
      fileCache.set(`processed_${fileHash}`, result, 3600000);

      recordMetric('file_processing_completed', 1, 'business', { 
        fileName: file.name,
        processingTime: Math.round(processingTime).toString()
      });

      trackEvent('file_processing_completed', {
        fileName: file.name,
        processingTime: Math.round(processingTime).toString()
      });

      return result;
    } catch (error: any) {
      recordMetric('file_processing_error', 1, 'error', { 
        fileName: file.name, 
        error: error.message 
      });
      trackEvent('file_processing_error', { 
        fileName: file.name, 
        error: error.message 
      });
      throw error;
    }
  }, [user, validateRequest, checkRateLimit, enqueueBackgroundJob, recordMetric, trackEvent]);

  // Enhanced chat with security and monitoring
  const sendChatMessageWithMonitoring = useCallback(async (message: string, context?: any) => {
    if (!user) throw new Error('User not authenticated');

    const startTime = performance.now();
    const messageHash = btoa(message + JSON.stringify(context || {})).substring(0, 32);

    // Security validation
    const securityResult = await validateRequest({
      requestPath: '/chat/message',
      payload: { message, context }
    });

    if (!securityResult.passed) {
      throw new Error(`Security validation failed: ${securityResult.message}`);
    }

    const rateLimit = checkRateLimit('chatMessages');
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
    }

    const cached = apiCache.get(`chat_${messageHash}`);
    if (cached) {
      recordMetric('chat_cache_hit', 1, 'performance', { messageLength: message.length.toString() });
      trackEvent('chat_cache_hit', { messageLength: message.length.toString() });
      return cached;
    }

    try {
      recordMetric('chat_message_sent', 1, 'business', { 
        messageLength: message.length.toString(),
        hasContext: (!!context).toString()
      });

      trackEvent('chat_message_sent', {
        messageLength: message.length.toString(),
        hasContext: (!!context).toString()
      });

      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

      const responseTime = performance.now() - startTime;
      const result = { 
        success: true, 
        responseTime: Math.round(responseTime),
        messageId: crypto.randomUUID(),
        cached: false
      };

      apiCache.set(`chat_${messageHash}`, result, 300000);

      recordMetric('chat_response_time', responseTime, 'performance');
      recordMetric('chat_message_completed', 1, 'business');
      
      trackEvent('chat_message_completed', {
        responseTime: Math.round(responseTime).toString()
      });

      return result;
    } catch (error: any) {
      recordMetric('chat_error', 1, 'error', { error: error.message });
      trackEvent('chat_error', { error: error.message });
      throw error;
    }
  }, [user, validateRequest, checkRateLimit, recordMetric, trackEvent]);

  const clearAllCaches = useCallback(() => {
    apiCache.clear();
    fileCache.clear();
    EnhancedMonitor.clearMetrics();
    recordMetric('caches_cleared', 1, 'business');
    trackEvent('caches_cleared');
  }, [recordMetric, trackEvent]);

  const getSystemStats = useCallback(() => {
    return {
      cache: {
        api: apiCache.getStats(),
        file: fileCache.getStats()
      },
      rateLimiting: Object.entries(rateLimiters).reduce((acc, [key, limiter]) => {
        acc[key] = limiter.getStats();
        return acc;
      }, {} as Record<string, any>),
      jobs: jobManager.getQueueStats(),
      metrics: {
        recent: EnhancedMonitor.getMetrics('performance', 3600000).length,
        alerts: EnhancedMonitor.getAlerts().length
      },
      // Add advanced system stats
      advanced: {
        systemStatus,
        detailedAnalytics: getDetailedAnalytics()
      }
    };
  }, [rateLimiters, systemStatus, getDetailedAnalytics]);

  return {
    // Core functionality
    recordMetric,
    checkRateLimit,
    systemStatus,
    fetchSystemHealth,
    loading,

    // Background jobs
    enqueueBackgroundJob,
    getJobStatus,

    // Enhanced operations
    processFileWithMonitoring,
    sendChatMessageWithMonitoring,

    // Cache management
    clearAllCaches,
    cacheStats: {
      api: apiCache.getStats(),
      file: fileCache.getStats()
    },

    // System statistics
    getSystemStats,

    // Advanced features
    getDetailedAnalytics,
    exportSystemReport,

    // Direct access to managers
    jobManager,
    EnhancedMonitor,
    rateLimiters
  };
};
