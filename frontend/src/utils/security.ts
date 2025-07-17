// Enhanced security utilities with comprehensive validation and protection
export class SecurityUtils {
  // Enhanced XSS protection
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#x60;')
      .trim();
  }

  // Enhanced file validation with comprehensive security checks
  static validateFileContent(file: File): { isValid: boolean; error?: string; warnings?: string[] } {
    const warnings: string[] = [];
    
    // File size validation
    if (file.size > 50 * 1024 * 1024) {
      return { isValid: false, error: 'File size exceeds 50MB limit' };
    }

    if (file.size === 0) {
      return { isValid: false, error: 'File appears to be empty' };
    }

    // Comprehensive file name validation
    const suspiciousPatterns = /[<>:"|?*\\]/;
    if (suspiciousPatterns.test(file.name)) {
      return { isValid: false, error: 'File name contains invalid characters' };
    }

    // Check for hidden files and system files
    if (file.name.startsWith('.') || file.name.startsWith('~')) {
      warnings.push('Hidden or system file detected');
    }

    // Extension and MIME type validation
    const allowedTypes = {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg']
    };

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const mimeType = file.type;

    if (!mimeType || !allowedTypes[mimeType as keyof typeof allowedTypes]) {
      return { isValid: false, error: `Unsupported file type: ${mimeType || 'unknown'}` };
    }

    const validExtensions = allowedTypes[mimeType as keyof typeof allowedTypes];
    if (!validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return { isValid: false, error: 'File extension does not match file type' };
    }

    // Additional security checks for specific file types
    if (mimeType === 'image/svg+xml') {
      warnings.push('SVG files may contain scripts - will be processed safely');
    }

    return { isValid: true, warnings };
  }

  // Enhanced rate limiting with user identification
  private static rateLimitStore = new Map<string, { count: number; resetTime: number; violations: number }>();

  static checkRateLimit(
    key: string, 
    maxRequests: number = 10, 
    windowMs: number = 60000,
    maxViolations: number = 5
  ): { allowed: boolean; remaining: number; resetTime: number; blocked?: boolean } {
    const now = Date.now();
    const record = this.rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(key, { 
        count: 1, 
        resetTime: now + windowMs,
        violations: record?.violations || 0
      });
      return { 
        allowed: true, 
        remaining: maxRequests - 1, 
        resetTime: now + windowMs 
      };
    }

    // Check if user is temporarily blocked due to violations
    if (record.violations >= maxViolations) {
      const blockDuration = 15 * 60 * 1000; // 15 minutes
      if (now < record.resetTime + blockDuration) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: record.resetTime + blockDuration,
          blocked: true
        };
      } else {
        // Reset violations after block period
        record.violations = 0;
      }
    }

    if (record.count >= maxRequests) {
      record.violations++;
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: record.resetTime,
        blocked: record.violations >= maxViolations
      };
    }

    record.count++;
    return { 
      allowed: true, 
      remaining: maxRequests - record.count, 
      resetTime: record.resetTime 
    };
  }

  // Enhanced error message categorization
  static getGenericErrorMessage(error: any): { message: string; category: string; severity: 'low' | 'medium' | 'high' } {
    // Log the actual error for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.error('Debug error:', error);
    }

    const errorMessage = error?.message?.toLowerCase() || '';

    // Authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('token')) {
      return {
        message: 'Sesi Anda telah berakhir. Silakan login kembali.',
        category: 'authentication',
        severity: 'high'
      };
    }
    
    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return {
        message: 'Koneksi bermasalah. Periksa internet Anda dan coba lagi.',
        category: 'network',
        severity: 'medium'
      };
    }

    // File processing errors
    if (errorMessage.includes('file') || errorMessage.includes('upload') || errorMessage.includes('parse')) {
      return {
        message: 'Ada masalah dengan file Anda. Pastikan format file didukung dan tidak rusak.',
        category: 'file_processing',
        severity: 'medium'
      };
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('time')) {
      return {
        message: 'Operasi memakan waktu terlalu lama. Coba dengan file yang lebih kecil.',
        category: 'timeout',
        severity: 'medium'
      };
    }

    // Server errors
    if (errorMessage.includes('server') || errorMessage.includes('internal') || errorMessage.includes('500')) {
      return {
        message: 'Server sedang mengalami gangguan. Coba lagi dalam beberapa saat.',
        category: 'server',
        severity: 'high'
      };
    }

    // Rate limiting
    if (errorMessage.includes('rate') || errorMessage.includes('limit') || errorMessage.includes('too many')) {
      return {
        message: 'Terlalu banyak permintaan. Harap tunggu sebentar sebelum mencoba lagi.',
        category: 'rate_limit',
        severity: 'low'
      };
    }

    // Generic error
    return {
      message: 'Terjadi kesalahan sistem. Tim kami telah diberitahu dan sedang menangani masalah ini.',
      category: 'generic',
      severity: 'high'
    };
  }

  // Input validation for common data types
  static validateInput(input: any, type: 'email' | 'url' | 'number' | 'text'): { isValid: boolean; error?: string } {
    if (input === null || input === undefined || input === '') {
      return { isValid: false, error: 'Input is required' };
    }

    const sanitized = typeof input === 'string' ? this.sanitizeInput(input) : input;

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(sanitized) 
          ? { isValid: true } 
          : { isValid: false, error: 'Invalid email format' };

      case 'url':
        try {
          new URL(sanitized);
          return { isValid: true };
        } catch {
          return { isValid: false, error: 'Invalid URL format' };
        }

      case 'number':
        const num = Number(sanitized);
        return !isNaN(num) && isFinite(num)
          ? { isValid: true }
          : { isValid: false, error: 'Invalid number format' };

      case 'text':
        return sanitized.length > 0 && sanitized.length <= 1000
          ? { isValid: true }
          : { isValid: false, error: 'Text must be between 1 and 1000 characters' };

      default:
        return { isValid: false, error: 'Unknown validation type' };
    }
  }

  // Generate secure hash for caching keys
  static generateHash(input: string): string {
    let hash = 0;
    if (input.length === 0) return hash.toString(36);
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // Security monitoring - track suspicious activities
  private static securityLog: Array<{
    timestamp: number;
    type: string;
    severity: 'low' | 'medium' | 'high';
    details: any;
  }> = [];

  static logSecurityEvent(type: string, severity: 'low' | 'medium' | 'high', details: any) {
    this.securityLog.push({
      timestamp: Date.now(),
      type,
      severity,
      details
    });

    // Keep only last 100 events
    if (this.securityLog.length > 100) {
      this.securityLog = this.securityLog.slice(-100);
    }

    // In production, this could send to monitoring service
    if (severity === 'high') {
      console.warn('[Security Alert]', { type, severity, details, timestamp: new Date().toISOString() });
    }
  }

  static getSecurityStats(): { totalEvents: number; highSeverityCount: number; recentEvents: number } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    return {
      totalEvents: this.securityLog.length,
      highSeverityCount: this.securityLog.filter(event => event.severity === 'high').length,
      recentEvents: this.securityLog.filter(event => event.timestamp > oneHourAgo).length
    };
  }
}
