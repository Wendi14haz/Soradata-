
// Enhanced error handling and logging system
export interface ErrorContext {
  userId?: string;
  action: string;
  timestamp: Date;
  errorCode?: string;
  metadata?: Record<string, any>;
}

export class ErrorHandler {
  private static logError(error: Error, context: ErrorContext) {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[SoraData Error]', errorLog);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with services like Sentry, LogRocket, etc.
      this.sendToMonitoring(errorLog);
    }
  }

  private static async sendToMonitoring(errorLog: any) {
    try {
      // Placeholder for monitoring service integration
      console.log('Sending to monitoring:', errorLog);
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError);
    }
  }

  static async handleApiError(error: any, context: ErrorContext): Promise<string> {
    this.logError(error, context);

    // Categorize errors and return user-friendly messages
    if (error.message?.includes('fetch')) {
      return 'Koneksi bermasalah. Silakan coba lagi dalam beberapa saat.';
    }
    
    if (error.message?.includes('auth')) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }
    
    if (error.message?.includes('file')) {
      return 'Ada masalah dengan file Anda. Pastikan format file didukung.';
    }
    
    if (error.message?.includes('timeout')) {
      return 'Operasi memakan waktu terlalu lama. Coba dengan file yang lebih kecil.';
    }

    return 'Terjadi kesalahan sistem. Tim kami telah diberitahu.';
  }

  static createErrorBoundary(component: string) {
    return (error: Error, errorInfo: any) => {
      this.logError(error, {
        action: `React Error Boundary - ${component}`,
        timestamp: new Date(),
        metadata: errorInfo
      });
    };
  }
}

// Rate limiting utility
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  static checkLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  static getRemainingRequests(key: string, maxRequests: number = 10): number {
    const record = this.requests.get(key);
    return record ? Math.max(0, maxRequests - record.count) : maxRequests;
  }
}
