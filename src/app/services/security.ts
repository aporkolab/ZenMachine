import { Injectable, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { MonitoringService } from './monitoring';

export interface SecurityConfig {
  enableCSP: boolean;
  enableSecurityHeaders: boolean;
  enableInputValidation: boolean;
  enableXSSProtection: boolean;
  enableIntegrityCheck: boolean;
  maxInputLength: number;
  allowedDomains: string[];
}

export interface SecurityViolation {
  type: 'csp' | 'xss' | 'input' | 'integrity' | 'suspicious-activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data?: any;
  timestamp: Date;
  userAgent: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly monitoring = inject(MonitoringService);

  private readonly config: SecurityConfig = {
    enableCSP: true,
    enableSecurityHeaders: true,
    enableInputValidation: true,
    enableXSSProtection: true,
    enableIntegrityCheck: true,
    maxInputLength: 10000,
    allowedDomains: [
      'localhost:4200',
      'api.picsum.photos',
      'api.jamendo.com',
      // Add your production domains here
    ],
  };

  constructor() {
    if (this.isBrowser) {
      this.initializeSecurity();
    }
  }

  private initializeSecurity() {
    this.setupCSPViolationReporting();
    this.setupIntegrityMonitoring();
    this.setupSuspiciousActivityDetection();
    this.validateSecurityHeaders();
  }

  private setupCSPViolationReporting() {
    if (!this.config.enableCSP) return;

    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      this.reportSecurityViolation({
        type: 'csp',
        severity: 'medium',
        message: `CSP violation: ${event.violatedDirective}`,
        data: {
          blockedURI: event.blockedURI,
          violatedDirective: event.violatedDirective,
          originalPolicy: event.originalPolicy,
        },
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });
  }

  private setupIntegrityMonitoring() {
    if (!this.config.enableIntegrityCheck) return;

    // Monitor for script injections
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function <T extends Node>(node: T): T {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as unknown as Element;
        if (element.tagName === 'SCRIPT') {
          const src = element.getAttribute('src');
          if (src && !this.isAllowedSource(src)) {
            this.reportSecurityViolation({
              type: 'integrity',
              severity: 'high',
              message: `Suspicious script injection attempt: ${src}`,
              data: { src, element: element.outerHTML },
              timestamp: new Date(),
              userAgent: navigator.userAgent,
              url: window.location.href,
            });
          }
        }
      }
      return originalAppendChild.call(this, node);
    }.bind(this);
  }

  private setupSuspiciousActivityDetection() {
    let consecutiveFailures = 0;
    let rapidRequests = 0;
    const requestTimeWindow = 60000; // 1 minute
    let requestTimes: number[] = [];

    // Monitor for suspicious patterns
    window.addEventListener('error', () => {
      consecutiveFailures++;
      if (consecutiveFailures > 10) {
        this.reportSecurityViolation({
          type: 'suspicious-activity',
          severity: 'medium',
          message: `High error rate detected: ${consecutiveFailures} consecutive failures`,
          data: { consecutiveFailures },
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
        consecutiveFailures = 0; // Reset counter
      }
    });

    // Monitor for rapid requests (potential DDoS or bot activity)
    const originalFetch = window.fetch;
    window.fetch = async (...args): Promise<Response> => {
      const now = Date.now();
      requestTimes.push(now);
      
      // Clean old requests outside the time window
      requestTimes = requestTimes.filter(time => now - time < requestTimeWindow);
      
      if (requestTimes.length > 100) { // More than 100 requests per minute
        this.reportSecurityViolation({
          type: 'suspicious-activity',
          severity: 'high',
          message: `Rapid request rate detected: ${requestTimes.length} requests in ${requestTimeWindow}ms`,
          data: { requestCount: requestTimes.length, timeWindow: requestTimeWindow },
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
      }
      
      return originalFetch.apply(this, args);
    };
  }

  private validateSecurityHeaders() {
    if (!this.config.enableSecurityHeaders) return;

    // Check if security headers are present (this would be done server-side in production)
    const expectedHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy',
    ];

    // In a real implementation, you'd check these via a test request
    // For now, we'll just log that they should be present
    console.log('Security headers should be validated:', expectedHeaders);
  }

  // Input validation and sanitization
  sanitizeInput(input: string): string {
    if (!this.config.enableInputValidation) return input;

    if (input.length > this.config.maxInputLength) {
      this.reportSecurityViolation({
        type: 'input',
        severity: 'medium',
        message: `Input length exceeds maximum: ${input.length} > ${this.config.maxInputLength}`,
        data: { inputLength: input.length, maxLength: this.config.maxInputLength },
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      return input.substring(0, this.config.maxInputLength);
    }

    // Basic XSS protection
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  validateInput(input: string, pattern?: RegExp): boolean {
    if (!this.config.enableInputValidation) return true;

    // Check for potential XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ];

    for (const xssPattern of xssPatterns) {
      if (xssPattern.test(input)) {
        this.reportSecurityViolation({
          type: 'xss',
          severity: 'high',
          message: `Potential XSS attempt detected in input`,
          data: { input: input.substring(0, 100), pattern: xssPattern.toString() },
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
        return false;
      }
    }

    // Custom pattern validation
    if (pattern && !pattern.test(input)) {
      return false;
    }

    return true;
  }

  private isAllowedSource(src: string): boolean {
    try {
      const url = new URL(src, window.location.origin);
      const domain = url.hostname + (url.port ? `:${url.port}` : '');
      
      return this.config.allowedDomains.some(allowedDomain => 
        domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
      );
    } catch {
      return false;
    }
  }

  private reportSecurityViolation(violation: SecurityViolation) {
    console.warn('Security violation detected:', violation);
    
    // Report to monitoring service
    this.monitoring.logError({
      message: `[SECURITY] ${violation.message}`,
      stack: JSON.stringify(violation.data),
      url: violation.url,
      userAgent: violation.userAgent,
      timestamp: violation.timestamp,
    });

    // Track security metrics
    this.monitoring.trackEvent('security_violation', {
      type: violation.type,
      severity: violation.severity,
      message: violation.message,
    });

    // For critical violations, you might want to take immediate action
    if (violation.severity === 'critical') {
      this.handleCriticalViolation(violation);
    }
  }

  private handleCriticalViolation(violation: SecurityViolation) {
    console.error('CRITICAL SECURITY VIOLATION:', violation);
    
    // In a real application, you might:
    // 1. Lock the user session
    // 2. Redirect to a safe page
    // 3. Clear sensitive data
    // 4. Send immediate alert to security team
    
    this.monitoring.trackEvent('critical_security_event', {
      type: violation.type,
      message: violation.message,
      immediate_action_required: true,
    });
  }

  // Public methods for manual security checks
  checkURLSafety(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Block dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
      if (dangerousProtocols.includes(parsedUrl.protocol)) {
        this.reportSecurityViolation({
          type: 'suspicious-activity',
          severity: 'high',
          message: `Dangerous protocol detected: ${parsedUrl.protocol}`,
          data: { url, protocol: parsedUrl.protocol },
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
        return false;
      }

      // Check against allowed domains for external resources
      if (parsedUrl.origin !== window.location.origin) {
        return this.isAllowedSource(url);
      }

      return true;
    } catch {
      return false;
    }
  }

  // Generate Content Security Policy
  generateCSP(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-* should be avoided in production
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: api.picsum.photos",
      "media-src 'self' blob:",
      "connect-src 'self' api.jamendo.com api.picsum.photos",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ];

    return directives.join('; ');
  }

  // Rate limiting check
  checkRateLimit(action: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    
    let attempts = JSON.parse(localStorage.getItem(key) || '[]') as number[];
    attempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    if (attempts.length >= maxAttempts) {
      this.reportSecurityViolation({
        type: 'suspicious-activity',
        severity: 'medium',
        message: `Rate limit exceeded for action: ${action}`,
        data: { action, attempts: attempts.length, maxAttempts },
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      return false;
    }

    attempts.push(now);
    localStorage.setItem(key, JSON.stringify(attempts));
    return true;
  }
}