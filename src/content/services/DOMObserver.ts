import type { DOMObserverCallback, DOMObserverOptions } from '../../types'
import { logger } from '../../utils/logger'
import { DOMError } from '../../types'

const DEFAULT_OPTIONS: DOMObserverOptions = {
  childList: true,
  subtree: true,
  attributes: false,
}

export class DOMObserverService {
  private static observers = new Map<string, MutationObserver>()

  static observe(
    callback: DOMObserverCallback,
    options: DOMObserverOptions = {}
  ): () => void {
    const observerId = this.generateId()
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    try {
      const observer = new MutationObserver((mutations) => {
        const addedNodes: Node[] = []
        
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            addedNodes.push(...Array.from(mutation.addedNodes))
          }
        }
        
        if (addedNodes.length > 0) {
          logger.debug(`DOM Observer detected ${addedNodes.length} new nodes`)
          callback(addedNodes)
        }
      })

      const target = options.selector 
        ? document.querySelector(options.selector) 
        : document.body

      if (!target) {
        throw new DOMError(`Target element not found for selector: ${options.selector}`)
      }

      observer.observe(target, {
        childList: mergedOptions.childList,
        subtree: mergedOptions.subtree,
        attributes: mergedOptions.attributes,
        attributeFilter: mergedOptions.attributeFilter,
      })

      this.observers.set(observerId, observer)
      logger.debug(`Started DOM observer with id: ${observerId}`)

      // Return cleanup function
      return () => this.disconnect(observerId)
    } catch (error) {
      logger.error('Failed to start DOM observer', error)
      return () => {} // Return no-op cleanup function
    }
  }

  static disconnect(observerId: string): void {
    const observer = this.observers.get(observerId)
    if (observer) {
      observer.disconnect()
      this.observers.delete(observerId)
      logger.debug(`Disconnected DOM observer with id: ${observerId}`)
    }
  }

  static disconnectAll(): void {
    this.observers.forEach((observer, id) => {
      observer.disconnect()
      logger.debug(`Disconnected DOM observer with id: ${id}`)
    })
    this.observers.clear()
    logger.info('All DOM observers disconnected')
  }

  private static generateId(): string {
    return `observer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Convenience function for backwards compatibility
export const observeDOM = (
  callback: DOMObserverCallback,
  options?: DOMObserverOptions
): (() => void) => {
  return DOMObserverService.observe(callback, options)
}