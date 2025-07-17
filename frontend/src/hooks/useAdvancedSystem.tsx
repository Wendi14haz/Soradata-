
import { useState, useEffect, useCallback } from 'react';
import { performanceOptimizer, PerformanceMetrics } from '@/utils/performanceOptimizer';
import { analytics, AnalyticsDashboard } from '@/utils/realTimeAnalytics';
import { security, SecurityResult } from '@/utils/advancedSecurity';
import { useAuth } from './useAuth';

interface SystemStatus {
  performance: PerformanceMetrics | null;
  analytics: AnalyticsDashboard;
  security: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    activeThreats: number;
    recentViolations: number;
  };
  system: {
    uptime: number;
    status: 'healthy' | 'degraded' | 'critical';
    lastUpdate: string;
  };
}

export const useAdvancedSystem = () => {
  const { user } = useAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    performance: null,
    analytics: {
      activeUsers: 0,
      totalEvents: 0,
      conversionRate: 0,
      averageSessionDuration: 0,
      topEvents: [],
      userFlow: []
    },
    security: {
      riskLevel: 'low',
      activeThreats: 0,
      recentViolations: 0
    },
    system: {
      uptime: 0,
      status: 'healthy',
      lastUpdate: new Date().toISOString()
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Analytics tracking
  const trackEvent = useCallback((eventType: string, properties?: Record<string, any>, value?: number) => {
    analytics.track(eventType, {
      ...properties,
      userId: user?.id
    }, value);
  }, [user?.id]);

  const trackPageView = useCallback((pageName: string, properties?: Record<string, any>) => {
    analytics.page(pageName, properties);
  }, []);

  const trackConversion = useCallback((eventType: string, value: number, properties?: Record<string, any>) => {
    analytics.conversion(eventType, value, properties);
  }, []);

  // Security validation
  const validateRequest = useCallback(async (context: any): Promise<SecurityResult> => {
    return await security.validateRequest({
      ...context,
      userId: user?.id
    });
  }, [user?.id]);

  // Performance optimization
  const recordPerformanceMetrics = useCallback(async (metrics: Partial<PerformanceMetrics>) => {
    const fullMetrics: PerformanceMetrics = {
      responseTime: metrics.responseTime || 0,
      memoryUsage: metrics.memoryUsage || 0,
      cpuUsage: metrics.cpuUsage || 0,
      cacheHitRate: metrics.cacheHitRate || 0,
      errorRate: metrics.errorRate || 0
    };

    await performanceOptimizer.recordMetrics(fullMetrics);
  }, []);

  // System health monitoring
  const updateSystemStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const performance = performanceOptimizer.getCurrentMetrics();
      const securityReport = security.getSecurityReport();
      
      // Calculate security risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (securityReport.riskDistribution.critical > 0) riskLevel = 'critical';
      else if (securityReport.riskDistribution.high > 0) riskLevel = 'high';
      else if (securityReport.riskDistribution.medium > 0) riskLevel = 'medium';

      // Calculate system status
      let systemStatusLevel: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (performance) {
        if (performance.errorRate > 10 || performance.responseTime > 5000) {
          systemStatusLevel = 'critical';
        } else if (performance.errorRate > 5 || performance.responseTime > 3000) {
          systemStatusLevel = 'degraded';
        }
      }

      setSystemStatus(prev => ({
        ...prev,
        performance,
        security: {
          riskLevel,
          activeThreats: securityReport.threats,
          recentViolations: securityReport.violations
        },
        system: {
          uptime: Date.now() - (performance as any)?.timestamp || 0,
          status: systemStatusLevel,
          lastUpdate: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error updating system status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Advanced monitoring features
  const getDetailedAnalytics = useCallback(() => {
    return {
      events: analytics.getEvents(),
      performance: performanceOptimizer.getMetricsHistory(),
      security: security.getSecurityEvents()
    };
  }, []);

  const exportSystemReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      systemStatus,
      analytics: analytics.exportData(),
      performance: performanceOptimizer.getMetricsHistory(),
      security: security.getSecurityReport()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [systemStatus]);

  // Set up real-time subscriptions
  useEffect(() => {
    const unsubscribeAnalytics = analytics.subscribe((dashboard) => {
      setSystemStatus(prev => ({
        ...prev,
        analytics: dashboard
      }));
    });

    // Update system status every 30 seconds
    const interval = setInterval(updateSystemStatus, 30000);
    
    // Initial status update
    updateSystemStatus();

    return () => {
      unsubscribeAnalytics();
      clearInterval(interval);
    };
  }, [updateSystemStatus]);

  // Identify user for analytics
  useEffect(() => {
    if (user) {
      analytics.identify(user.id, {
        email: user.email
      });
    }
  }, [user]);

  return {
    // System status
    systemStatus,
    isLoading,
    updateSystemStatus,

    // Analytics
    trackEvent,
    trackPageView,
    trackConversion,

    // Security
    validateRequest,

    // Performance
    recordPerformanceMetrics,

    // Advanced features
    getDetailedAnalytics,
    exportSystemReport
  };
};
