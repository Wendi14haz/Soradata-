import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  properties: Record<string, any>;
  value?: number;
}

export interface AnalyticsDashboard {
  activeUsers: number;
  totalEvents: number;
  conversionRate: number;
  averageSessionDuration: number;
  topEvents: Array<{ event: string; count: number }>;
  userFlow: Array<{ step: string; users: number; dropoffRate: number }>;
}

export class RealTimeAnalytics {
  private static instance: RealTimeAnalytics;
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStart: number;
  private subscribers: Array<(dashboard: AnalyticsDashboard) => void> = [];

  private constructor() {
    this.sessionId = crypto.randomUUID();
    this.sessionStart = Date.now();
    this.setupEventListeners();
  }

  static getInstance(): RealTimeAnalytics {
    if (!this.instance) {
      this.instance = new RealTimeAnalytics();
    }
    return this.instance;
  }

  track(eventType: string, properties: Record<string, any> = {}, value?: number): void {
    const event: AnalyticsEvent = {
      eventType,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 200),
        referrer: document.referrer
      },
      value
    };

    this.events.push(event);
    this.processEvent(event);
    this.updateDashboard();

    // Keep only recent events in memory
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000);
    }
  }

  identify(userId: string, traits: Record<string, any> = {}): void {
    this.track('user_identified', {
      userId,
      traits
    });
  }

  page(pageName: string, properties: Record<string, any> = {}): void {
    this.track('page_view', {
      pageName,
      ...properties
    });
  }

  conversion(eventType: string, value: number, properties: Record<string, any> = {}): void {
    this.track('conversion', {
      conversionType: eventType,
      ...properties
    }, value);
  }

  private async processEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Store in localStorage for persistence
      const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      stored.push(event);
      localStorage.setItem('analytics_events', JSON.stringify(stored.slice(-1000)));

      // Send to backend for processing (in real app, this would go to analytics service)
      console.log('Analytics Event:', event);
    } catch (error) {
      console.error('Error processing analytics event:', error);
    }
  }

  private setupEventListeners(): void {
    // Track page views
    window.addEventListener('popstate', () => {
      this.page(window.location.pathname);
    });

    // Track user engagement
    let engagementStart = Date.now();
    window.addEventListener('focus', () => {
      engagementStart = Date.now();
    });

    window.addEventListener('blur', () => {
      const engagementTime = Date.now() - engagementStart;
      if (engagementTime > 1000) { // Only track if engaged for more than 1 second
        this.track('user_engagement', { duration: engagementTime });
      }
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.track('javascript_error', {
        message: event.error?.message || 'Unknown error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track('unhandled_promise_rejection', {
        reason: event.reason?.toString() || 'Unknown rejection'
      });
    });
  }

  subscribe(callback: (dashboard: AnalyticsDashboard) => void): () => void {
    this.subscribers.push(callback);
    
    // Send initial dashboard
    callback(this.generateDashboard());

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private updateDashboard(): void {
    const dashboard = this.generateDashboard();
    this.subscribers.forEach(callback => {
      try {
        callback(dashboard);
      } catch (error) {
        console.error('Error in analytics subscriber:', error);
      }
    });
  }

  private generateDashboard(): AnalyticsDashboard {
    const now = Date.now();
    const hourAgo = now - 3600000; // 1 hour
    const recentEvents = this.events.filter(e => e.timestamp > hourAgo);

    // Calculate active users (unique sessions in last hour)
    const activeSessions = new Set(recentEvents.map(e => e.sessionId));
    const activeUsers = activeSessions.size;

    // Calculate total events
    const totalEvents = recentEvents.length;

    // Calculate conversion rate
    const conversionEvents = recentEvents.filter(e => e.eventType === 'conversion');
    const conversionRate = totalEvents > 0 ? (conversionEvents.length / totalEvents) * 100 : 0;

    // Calculate average session duration
    const sessionDurations = this.calculateSessionDurations();
    const averageSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length 
      : 0;

    // Get top events
    const eventCounts = new Map<string, number>();
    recentEvents.forEach(event => {
      eventCounts.set(event.eventType, (eventCounts.get(event.eventType) || 0) + 1);
    });

    const topEvents = Array.from(eventCounts.entries())
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Generate user flow (simplified)
    const userFlow = this.calculateUserFlow(recentEvents);

    return {
      activeUsers,
      totalEvents,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageSessionDuration: Math.round(averageSessionDuration),
      topEvents,
      userFlow
    };
  }

  private calculateSessionDurations(): number[] {
    const sessionGroups = new Map<string, AnalyticsEvent[]>();
    
    this.events.forEach(event => {
      if (!sessionGroups.has(event.sessionId)) {
        sessionGroups.set(event.sessionId, []);
      }
      sessionGroups.get(event.sessionId)!.push(event);
    });

    return Array.from(sessionGroups.values()).map(events => {
      if (events.length < 2) return 0;
      const sorted = events.sort((a, b) => a.timestamp - b.timestamp);
      return sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
    });
  }

  private calculateUserFlow(events: AnalyticsEvent[]): Array<{ step: string; users: number; dropoffRate: number }> {
    const pageViews = events.filter(e => e.eventType === 'page_view');
    const stepCounts = new Map<string, Set<string>>();

    pageViews.forEach(event => {
      const page = event.properties.pageName || 'unknown';
      if (!stepCounts.has(page)) {
        stepCounts.set(page, new Set());
      }
      stepCounts.get(page)!.add(event.sessionId);
    });

    const steps = Array.from(stepCounts.entries())
      .map(([step, sessions]) => ({ step, users: sessions.size }))
      .sort((a, b) => b.users - a.users);

    return steps.map((step, index) => ({
      ...step,
      dropoffRate: index > 0 ? Math.round(((steps[index - 1].users - step.users) / steps[index - 1].users) * 100) : 0
    }));
  }

  getEvents(filter?: { eventType?: string; timeRange?: number }): AnalyticsEvent[] {
    let filtered = [...this.events];

    if (filter?.eventType) {
      filtered = filtered.filter(e => e.eventType === filter.eventType);
    }

    if (filter?.timeRange) {
      const cutoff = Date.now() - filter.timeRange;
      filtered = filtered.filter(e => e.timestamp > cutoff);
    }

    return filtered;
  }

  exportData(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      sessionStart: this.sessionStart,
      events: this.events,
      dashboard: this.generateDashboard()
    }, null, 2);
  }
}

export const analytics = RealTimeAnalytics.getInstance();
