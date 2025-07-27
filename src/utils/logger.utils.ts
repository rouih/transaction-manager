/**
 * Simple logger utility for application logging
 */
export class Logger {
    private static formatMessage(level: string, message: string, context?: string): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` [${context}]` : '';
        return `${timestamp} [${level}]${contextStr}: ${message}`;
    }

    /**
 * Log debug messages - useful for development and troubleshooting
 */
    static debug(message: string, context?: string): void {
        // Always log in development, or when LOG_LEVEL is debug, or when NODE_ENV is not set (default to dev)
        const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
        const isDebugLevel = process.env.LOG_LEVEL === 'debug';

        if (isDev || isDebugLevel) {
            console.log(this.formatMessage('DEBUG', message, context));
        }
    }

    /**
     * Log error messages - always logged regardless of environment
     */
    static error(message: string, error?: Error, context?: string): void {
        const errorMessage = error ? `${message} - ${error.message}` : message;
        console.error(this.formatMessage('ERROR', errorMessage, context));

        // Log stack trace in development or debug mode
        const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
        const isDebugLevel = process.env.LOG_LEVEL === 'debug';

        if (error && (isDev || isDebugLevel)) {
            console.error(error.stack);
        }
    }
}

// Export for backward compatibility
export const logger = Logger; 