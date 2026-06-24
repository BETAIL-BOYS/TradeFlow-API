import { ConsoleLogger, Injectable, Scope, LogLevel } from '@nestjs/common';
import { requestContextStorage } from '../storage/request-context.storage';

/**
 * Enhanced logger that automatically prepends the unique request ID to every log message.
 * Utilizes AsyncLocalStorage to retrieve the request ID without passing it through the call stack.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger {
  /**
   * Formats the log message by prepending the request ID if it exists in the current context.
   * 
   * @param logLevel - The level of the log (log, error, warn, etc.).
   * @param message - The actual log message or object.
   * @param pidMessage - The process ID message.
   * @param formattedLogLevel - The formatted log level string.
   * @param contextMessage - The context of the log (usually the class name).
   * @param timestampDiff - The time difference from the previous log.
   * @returns The fully formatted log string.
   */
  formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
    timestampDiff: string,
  ): string {
    const context = requestContextStorage.getStore();
    const requestId = context?.requestId ? `[${context.requestId}] ` : '';
    
    return super.formatMessage(
      logLevel,
      `${requestId}${message}`,
      pidMessage,
      formattedLogLevel,
      contextMessage,
      timestampDiff,
    );
  }
}
