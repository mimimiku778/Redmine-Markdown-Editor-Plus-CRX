import { ExtensionError, InitializationError, DOMError } from '../types'
import { logger } from './logger'

export function handleError(error: unknown, context: string): void {
  if (error instanceof ExtensionError) {
    logger.error(`[${context}] ${error.code}: ${error.message}`)
  } else if (error instanceof Error) {
    logger.error(`[${context}] ${error.message}`, error)
  } else {
    logger.error(`[${context}] Unknown error`, error)
  }
}

export function assertElement<T extends Element>(
  element: T | null | undefined,
  message: string
): asserts element is T {
  if (!element) {
    throw new DOMError(message)
  }
}

export function assertNotNull<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new InitializationError(message)
  }
}