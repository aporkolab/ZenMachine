import { Injectable, ErrorHandler, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface ErrorInfo {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  buildVersion: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  url: string;
  sessionId: string;
}

export interface UserAnalytics {
  event: string;
  properties: Record<string, unknown>;
  userId?: string;
  sessionId: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  private readonly sessionId = this.generateSessionId();
  private readonly buildVersion = '1.0.0'; // This should come from environment

  private errorQueue: ErrorInfo[] = [];
  private metricsQueue: PerformanceMetric[] = [];
  private analyticsQueue: UserAnalytics[] = [];

  constructor() {
    if (this.isBrowser) {
      this.initializeMonitoring();
      this.setupRouterTracking();
      this.setupPerformanceMonitoring();
    }
  }

  private initializeMonitoring() {
    // Set up global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        sessionId: this.sessionId,
        buildVersion: this.buildVersion,
      });
    });

    // Set up unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        sessionId: this.sessionId,
        buildVersion: this.buildVersion,
      });
    });

    // Flush queues periodically
    setInterval(() => this.flushQueues(), 30000); // Every 30 seconds

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flushQueues());
  }

  private setupRouterTracking() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  private setupPerformanceMonitoring() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.trackMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          this.trackMetric(
            'dom_content_loaded',
            navigation.domContentLoadedEventEnd - navigation.fetchStart,
          );
          this.trackMetric('first_contentful_paint', this.getFirstContentfulPaint());
        }
      }, 0);
    });

    // Track Web Vitals
    this.trackWebVitals();
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    return fcpEntry?.startTime || 0;
  }

  private trackWebVitals() {
    // This would integrate with web-vitals library in a real implementation
    // For now, we'll track basic metrics

    // Track Largest Contentful Paint (LCP)
    if ('LargestContentfulPaint' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackMetric('largest_contentful_paint', lastEntry.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    }

    // Track Cumulative Layout Shift (CLS)
    if ('LayoutShift' in window) {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value: number;
          };
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
        this.trackMetric('cumulative_layout_shift', clsValue);
      }).observe({ type: 'layout-shift', buffered: true });
    }
  }

  logError(error: Partial<ErrorInfo>) {
    const errorInfo: ErrorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: error.userAgent || navigator.userAgent,
      timestamp: error.timestamp || new Date(),
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      ...error,
    };

    this.errorQueue.push(errorInfo);
    console.error('Error logged:', errorInfo);

    // Send immediately for critical errors
    if (errorInfo.message.toLowerCase().includes('critical')) {
      this.flushErrors();
    }
  }

  trackMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      url: window.location.href,
      sessionId: this.sessionId,
    };

    this.metricsQueue.push(metric);
  }

  trackEvent(event: string, properties: Record<string, unknown> = {}) {
    const analytics: UserAnalytics = {
      event,
      properties,
      sessionId: this.sessionId,
      timestamp: new Date(),
    };

    this.analyticsQueue.push(analytics);
  }

  trackPageView(url: string) {
    this.trackEvent('page_view', {
      url,
      referrer: document.referrer,
      title: document.title,
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async flushQueues() {
    await Promise.all([this.flushErrors(), this.flushMetrics(), this.flushAnalytics()]);
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In a real implementation, this would send to your monitoring service
      // e.g., Sentry, LogRocket, DataDog, etc.
      await this.sendToMonitoringService('/api/errors', errors);
    } catch (error) {
      console.error('Failed to send errors:', error);
      // Put errors back in queue for retry
      this.errorQueue.unshift(...errors);
    }
  }

  private async flushMetrics() {
    if (this.metricsQueue.length === 0) return;

    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      await this.sendToMonitoringService('/api/metrics', metrics);
    } catch (error) {
      console.error('Failed to send metrics:', error);
      this.metricsQueue.unshift(...metrics);
    }
  }

  private async flushAnalytics() {
    if (this.analyticsQueue.length === 0) return;

    const analytics = [...this.analyticsQueue];
    this.analyticsQueue = [];

    try {
      await this.sendToMonitoringService('/api/analytics', analytics);
    } catch (error) {
      console.error('Failed to send analytics:', error);
      this.analyticsQueue.unshift(...analytics);
    }
  }

  private async sendToMonitoringService(endpoint: string, data: unknown[]) {
    // In a real implementation, you would send to your actual monitoring service
    console.log(`Sending ${data.length} items to ${endpoint}:`, data);

    // Example implementation:
    /*
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    */
  }

  // Public methods for manual tracking
  setUserId(userId: string) {
    this.trackEvent('user_identified', { userId });
  }

  timeStart(name: string) {
    if (this.isBrowser) {
      performance.mark(`${name}-start`);
    }
  }

  timeEnd(name: string) {
    if (this.isBrowser) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measure = performance.getEntriesByName(name, 'measure')[0];
      this.trackMetric(name, measure.duration);
    }
  }
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private monitoringService = inject(MonitoringService);

  handleError(error: Error): void {
    console.error('Global error:', error);

    this.monitoringService.logError({
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      url: window.location?.href,
      userAgent: navigator?.userAgent,
      timestamp: new Date(),
    });
  }
}
