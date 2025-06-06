import { 
  isRedminePage, 
  findTextareas, 
  hideToolbars, 
  processTextarea, 
  cleanupAll, 
  observeDOM 
} from './services'
import { logger } from '../utils/logger'
import { handleError } from '../utils/errors'
import { InitializationError } from '../types'

// Module-scoped state
let initialized = false
let stopObserver: (() => void) | null = null

// Configuration
const INITIALIZATION_DELAY = 100

/** Initialize the Redmine Markdown Extension */
export const initialize = async (): Promise<void> => {
  if (initialized) {
    logger.debug('Extension already initialized')
    return
  }
  
  if (!isRedminePage()) {
    logger.info('Not a Redmine page, skipping initialization')
    return
  }
  
  logger.info('Initializing Redmine Markdown Extension')
  
  try {
    // Process existing textareas
    const textareas = findTextareas()
    if (textareas.length === 0) {
      logger.warn('No textareas found to process')
    } else {
      textareas.forEach(processTextarea)
    }
    
    // Hide toolbars
    hideToolbars()
    
    // Observe future textareas
    stopObserver = observeDOM((nodes) => {
      // Delay processing to ensure DOM is stable
      setTimeout(() => handleNewNodes(nodes), INITIALIZATION_DELAY)
    })
    
    initialized = true
    logger.info('Redmine Markdown Extension initialized successfully')
  } catch (error) {
    initialized = false
    handleError(error, 'initialize')
    throw new InitializationError('Failed to initialize extension')
  }
}

/** Destroy the extension and cleanup overlays */
export const destroy = (): void => {
  if (!initialized) {
    logger.debug('Extension not initialized, nothing to destroy')
    return
  }
  
  logger.info('Destroying Redmine Markdown Extension')
  
  try {
    if (stopObserver) {
      stopObserver()
      stopObserver = null
    }
    
    cleanupAll()
    initialized = false
    
    logger.info('Extension destroyed successfully')
  } catch (error) {
    handleError(error, 'destroy')
  }
}

// Handle new DOM nodes by processing new textareas
const handleNewNodes = (addedNodes: Node[]): void => {
  try {
    const newTextareas = findNewTextareas(addedNodes)
    
    if (newTextareas.length > 0) {
      logger.info(`Processing ${newTextareas.length} new textareas`)
      newTextareas.forEach(processTextarea)
      hideToolbars()
    }
  } catch (error) {
    handleError(error, 'handleNewNodes')
  }
}

// Find textareas in newly added nodes
const findNewTextareas = (addedNodes: Node[]): HTMLTextAreaElement[] => {
  const textareas = new Set<HTMLTextAreaElement>()
  
  for (const node of addedNodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue
    
    const element = node as Element
    
    // Check if the node itself is a textarea
    if (element.matches('textarea.wiki-edit')) {
      textareas.add(element as HTMLTextAreaElement)
    }
    
    // Find textareas within the node
    const selectors = [
      'textarea.wiki-edit',
      '.jstBlock textarea'
    ]
    
    for (const selector of selectors) {
      const found = element.querySelectorAll<HTMLTextAreaElement>(selector)
      found.forEach(textarea => textareas.add(textarea))
    }
  }
  
  return Array.from(textareas)
}
