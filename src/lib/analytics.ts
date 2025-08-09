/**
 * Analytics and user feedback collection for Story Weaver
 * Provides insights into user behavior and application performance
 */

import { logger } from './logger';

interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

interface UserFeedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'rating';
  rating?: number;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private startTime: number;
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.isProduction = import.meta.env.PROD;
    this.userId = this.getUserId();
    
    // Initialize session
    this.track('session_start', {
      category: 'session',
      properties: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });

    // Track page visibility changes
    this.setupVisibilityTracking();
    
    // Track performance metrics
    this.setupPerformanceTracking();
    
    // Setup beforeunload tracking
    this.setupUnloadTracking();
  }

  /**
   * Track a custom event
   */
  track(event: string, data?: Partial<AnalyticsEvent>): void {
    const eventData: AnalyticsEvent = {
      event,
      category: data?.category || 'general',
      action: data?.action,
      label: data?.label,
      value: data?.value,
      properties: {
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        url: window.location.href,
        ...data?.properties
      }
    };

    // Log for debugging
    logger.debug('Analytics Event', eventData);

    // Send to analytics service
    this.sendEvent(eventData);
  }

  /**
   * Track story-related events
   */
  trackStory(action: string, storyData: any): void {
    this.track(`story_${action}`, {
      category: 'story',
      action,
      properties: {
        storyId: storyData.id,
        language: storyData.language,
        wordCount: storyData.content?.split(' ').length || 0,
        hasThemes: storyData.themes?.length > 0,
        hasCharacters: storyData.characters?.length > 0,
        categoryId: storyData.categoryId,
        collectionId: storyData.collectionId
      }
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, details?: Record<string, any>): void {
    this.track(`engagement_${action}`, {
      category: 'engagement',
      action,
      properties: details
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      category: 'error',
      action: 'runtime_error',
      label: error.message,
      properties: {
        error: error.message,
        stack: error.stack,
        context
      }
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, context?: Record<string, any>): void {
    this.track('performance', {
      category: 'performance',
      action: metric,
      value,
      properties: context
    });
  }

  /**
   * Collect and submit user feedback
   */
  async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'sessionId'>): Promise<void> {
    const feedbackData: UserFeedback = {
      id: this.generateId(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...feedback
    };

    try {
      // Store locally first
      this.storeFeedback(feedbackData);
      
      // Track feedback submission
      this.track('feedback_submitted', {
        category: 'feedback',
        action: feedback.type,
        properties: {
          rating: feedback.rating,
          hasMessage: !!feedback.message
        }
      });

      // Send to backend (if available)
      await this.sendFeedback(feedbackData);
      
      logger.info('Feedback submitted', feedbackData);
    } catch (error) {
      logger.error('Failed to submit feedback', error);
      throw error;
    }
  }

  /**
   * Get user session data for support
   */
  getSessionData(): Record<string, any> {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      sessionDuration: Date.now() - this.startTime,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      logs: logger.getLogs()
    };
  }

  /**
   * Export analytics data for debugging
   */
  exportData(): string {
    return JSON.stringify({
      session: this.getSessionData(),
      feedback: this.getStoredFeedback(),
      logs: logger.exportLogs()
    }, null, 2);
  }

  // Private methods

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getUserId(): string | undefined {
    try {
      let userId = localStorage.getItem('story-weaver-user-id');
      if (!userId) {
        userId = this.generateId();
        localStorage.setItem('story-weaver-user-id', userId);
      }
      return userId;
    } catch (error) {
      logger.warn('Failed to get/set user ID', error);
      return undefined;
    }
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.isProduction) {
      // In development, just log
      console.log('📊 Analytics:', event);
      return;
    }

    try {
      // Send to Cloudflare Analytics Engine
      if (this.hasCloudflareAnalytics()) {
        await this.sendToCloudflareAnalytics(event);
      }

      // Send to other analytics services
      await this.sendToGoogleAnalytics(event);
      
    } catch (error) {
      logger.warn('Analytics send failed', error);
    }
  }

  private hasCloudflareAnalytics(): boolean {
    return !!(window as any).__CF_ANALYTICS_TOKEN;
  }

  private async sendToCloudflareAnalytics(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Cloudflare Analytics failed:', error);
    }
  }

  private async sendToGoogleAnalytics(event: AnalyticsEvent): Promise<void> {
    // Google Analytics 4 integration
    if (typeof gtag !== 'undefined') {
      (window as any).gtag('event', event.event, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_parameters: event.properties
      });
    }
  }

  private setupVisibilityTracking(): void {
    let visibilityStart = Date.now();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const visibleTime = Date.now() - visibilityStart;
        this.trackEngagement('page_hidden', { visibleTime });
      } else {
        visibilityStart = Date.now();
        this.trackEngagement('page_visible');
      }
    });
  }

  private setupPerformanceTracking(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.trackPerformance('page_load', perfData.loadEventEnd - perfData.loadEventStart);
        this.trackPerformance('dom_content_loaded', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
        this.trackPerformance('first_contentful_paint', this.getFirstContentfulPaint());
        
      }, 0);
    });

    // Track Core Web Vitals
    this.trackWebVitals();
  }

  private getFirstContentfulPaint(): number {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : 0;
  }

  private trackWebVitals(): void {
    // This would typically use web-vitals library
    // For now, we'll track basic metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.trackPerformance('lcp', entry.startTime);
        }
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  private setupUnloadTracking(): void {
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.startTime;
      this.track('session_end', {
        category: 'session',
        value: sessionDuration,
        properties: { sessionDuration }
      });
    });
  }

  private storeFeedback(feedback: UserFeedback): void {
    try {
      const stored = JSON.parse(localStorage.getItem('story-weaver-feedback') || '[]');
      stored.push(feedback);
      localStorage.setItem('story-weaver-feedback', JSON.stringify(stored.slice(-50))); // Keep last 50
    } catch (error) {
      logger.warn('Failed to store feedback locally', error);
    }
  }

  private getStoredFeedback(): UserFeedback[] {
    try {
      return JSON.parse(localStorage.getItem('story-weaver-feedback') || '[]');
    } catch (error) {
      logger.warn('Failed to get stored feedback', error);
      return [];
    }
  }

  private async sendFeedback(feedback: UserFeedback): Promise<void> {
    if (!this.isProduction) {
      console.log('📝 Feedback:', feedback);
      return;
    }

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
    } catch (error) {
      // Store for later sync
      logger.warn('Feedback send failed, stored locally', error);
    }
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Export for debugging in development
if (import.meta.env.DEV) {
  (window as any).storyAnalytics = analytics;
}

// Common tracking functions for easy use
export const trackStoryGenerated = (story: any) => analytics.trackStory('generated', story);
export const trackStorySaved = (story: any) => analytics.trackStory('saved', story);
export const trackStoryShared = (story: any) => analytics.trackStory('shared', story);
export const trackStoryExported = (story: any, format: string) => 
  analytics.trackStory('exported', { ...story, format });

export const trackUserAction = (action: string, details?: Record<string, any>) => 
  analytics.trackEngagement(action, details);

export const trackError = (error: Error, context?: Record<string, any>) => 
  analytics.trackError(error, context);

export const submitFeedback = (feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'sessionId'>) => 
  analytics.submitFeedback(feedback);