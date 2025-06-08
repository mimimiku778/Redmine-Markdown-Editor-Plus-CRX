import type { Logger, LogLevel } from '../types'

class ConsoleLogger implements Logger {
  private readonly prefix = '[Redmine Markdown]'

  private shouldLog(level: LogLevel): boolean {
    if (!__DEV__) {
      return level === 'error' || level === 'warn'
    }
    return true
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(`${this.prefix} ${message}`, ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`${this.prefix} ${message}`, ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`${this.prefix} ${message}`, ...args)
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(`${this.prefix} ${message}`, error)

      // Log stack trace if available
      if (error instanceof Error && error.stack) {
        console.error(error.stack)
      }
    }
  }
}

export const logger: Logger = new ConsoleLogger()
