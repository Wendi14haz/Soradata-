
// Secure navigation utilities
export class NavigationUtils {
  // Secure redirect function
  static secureRedirect(url: string, replace: boolean = false): void {
    // Validate URL to prevent open redirect vulnerabilities
    if (!this.isValidRedirectUrl(url)) {
      console.error('Invalid redirect URL blocked:', url);
      return;
    }

    if (replace) {
      window.location.replace(url);
    } else {
      window.location.href = url;
    }
  }

  // Validate redirect URLs to prevent open redirect attacks
  private static isValidRedirectUrl(url: string): boolean {
    try {
      // Allow relative URLs
      if (url.startsWith('/')) {
        return true;
      }

      // Allow same-origin URLs
      const urlObj = new URL(url);
      const currentOrigin = window.location.origin;
      
      // Allow current origin and localhost for development
      const allowedOrigins = [
        currentOrigin,
        'http://localhost:3000',
        'https://localhost:3000'
      ];

      return allowedOrigins.includes(urlObj.origin);
    } catch {
      return false;
    }
  }

  // Safe external link opener
  static openExternalLink(url: string): void {
    if (this.isValidExternalUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  private static isValidExternalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  }
}
