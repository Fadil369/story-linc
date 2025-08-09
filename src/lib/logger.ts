/**
 * Enhanced logging utility for Story Weaver
 * Provides structured logging with different levels and browser storage for debugging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private maxLogs = 1000;
  private logs: LogEntry[] = [];
  private logLevel: LogLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN;

  constructor() {
    // Load existing logs from sessionStorage for debugging
    this.loadLogs();
    
    // Set up error handlers
    this.setupErrorHandlers();
  }

  private loadLogs() {
    try {
      const stored = sessionStorage.getItem('story-weaver-logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load logs from storage:', error);
    }
  }

  private saveLogs() {
    try {
      // Keep only recent logs to prevent storage bloat
      const recentLogs = this.logs.slice(-this.maxLogs);
      sessionStorage.setItem('story-weaver-logs', JSON.stringify(recentLogs));
      this.logs = recentLogs;
    } catch (error) {
      console.warn('Failed to save logs to storage:', error);
    }
  }

  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString()
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason?.toString(),
        promise: 'Promise rejected'
      });
    });
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (level < this.logLevel) return;

    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      stack: level >= LogLevel.ERROR ? new Error().stack : undefined
    };

    this.logs.push(logEntry);
    this.saveLogs();

    // Console output with appropriate styling
    const style = this.getConsoleStyle(level);
    const prefix = this.getLevelPrefix(level);
    
    if (data) {
      console.log(`%c${prefix} ${message}`, style, data);
    } else {
      console.log(`%c${prefix} ${message}`, style);
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: #8B5CF6; font-weight: normal;';
      case LogLevel.INFO:
        return 'color: #06B6D4; font-weight: normal;';
      case LogLevel.WARN:
        return 'color: #F59E0B; font-weight: bold;';
      case LogLevel.ERROR:
        return 'color: #EF4444; font-weight: bold;';
      default:
        return '';
    }
  }

  private getLevelPrefix(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '[DEBUG]';
      case LogLevel.INFO:
        return '[INFO]';
      case LogLevel.WARN:
        return '[WARN]';
      case LogLevel.ERROR:
        return '[ERROR]';
      default:
        return '[LOG]';
    }
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data);
  }

  // Story-specific logging methods
  storyGenerated(storyId: string, language: string, prompt: string) {
    this.info('Story Generated', {
      storyId,
      language,
      promptLength: prompt.length,
      timestamp: new Date().toISOString()
    });
  }

  storyError(action: string, error: Error, context?: any) {
    this.error(`Story Error: ${action}`, {
      error: error.message,
      stack: error.stack,
      context
    });
  }

  userAction(action: string, details?: any) {
    this.debug(`User Action: ${action}`, details);
  }

  performance(action: string, duration: number, details?: any) {
    this.info(`Performance: ${action}`, {
      duration: `${duration}ms`,
      ...details
    });
  }

  // Get logs for debugging/support
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    try {
      sessionStorage.removeItem('story-weaver-logs');
    } catch (error) {
      console.warn('Failed to clear logs from storage:', error);
    }
  }

  // Set log level dynamically
  setLogLevel(level: LogLevel) {
    this.logLevel = level;
    this.info('Log level changed', { level: LogLevel[level] });
  }
}

// Create singleton instance
export const logger = new Logger();

// Export for debugging in console
if (import.meta.env.DEV) {
  (window as any).storyLogger = logger;
  logger.info('Story Weaver Logger initialized', {
    environment: 'development',
    logLevel: LogLevel[logger.logLevel]
  });
}