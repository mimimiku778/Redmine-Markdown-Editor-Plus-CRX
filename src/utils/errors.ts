import { ExtensionError } from '../types'
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
