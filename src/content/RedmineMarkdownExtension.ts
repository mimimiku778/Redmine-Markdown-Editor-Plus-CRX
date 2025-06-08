import { isRedminePage, findTextareas, processTextarea, cleanupAll } from './services'
import { logger } from '../utils/logger'
import { handleError } from '../utils/errors'
import { InitializationError } from '../types'

// Module-scoped state
let initialized = false
let noteObservers: MutationObserver[] = []

/** Initialize the Redmine Markdown Extension */
export async function initialize(): Promise<void> {
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

    // Start observing .note elements for dynamic textarea insertion
    startNoteObservers()

    initialized = true
    logger.info('Redmine Markdown Extension initialized successfully')
  } catch (error) {
    initialized = false
    handleError(error, 'initialize')
    throw new InitializationError('Failed to initialize extension')
  }
}

/** Destroy the extension and cleanup overlays */
export function destroy(): void {
  if (!initialized) {
    logger.debug('Extension not initialized, nothing to destroy')
    return
  }

  logger.info('Destroying Redmine Markdown Extension')

  try {
    stopNoteObservers()
    cleanupAll()
    initialized = false

    logger.info('Extension destroyed successfully')
  } catch (error) {
    handleError(error, 'destroy')
  }
}

function startNoteObservers(): void {
  const noteElements = document.querySelectorAll('.note')

  if (noteElements.length === 0) {
    logger.debug('No .note elements found to observe')
    return
  }

  noteElements.forEach((noteElement) => {
    const observer = new MutationObserver((mutations) => {
      handleNoteChanges(mutations)
    })

    observer.observe(noteElement, {
      childList: true,
      subtree: true,
    })

    noteObservers.push(observer)
    logger.debug('Started observing .note element for textarea insertion')
  })
}

function stopNoteObservers(): void {
  noteObservers.forEach((observer) => {
    observer.disconnect()
    logger.debug('Disconnected .note observer')
  })
  noteObservers = []
}

function handleNoteChanges(mutations: MutationRecord[]): void {
  try {
    const addedNodes: Node[] = []

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        addedNodes.push(...Array.from(mutation.addedNodes))
      }
    }

    if (addedNodes.length === 0) return

    // Find new textareas in added nodes
    const newTextareas = new Set<HTMLTextAreaElement>()

    for (const node of addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue

      const element = node as Element

      // Check if the node itself is a textarea
      if (element.matches('textarea.wiki-edit')) {
        newTextareas.add(element as HTMLTextAreaElement)
      }

      // Find textareas within the node
      const found = element.querySelectorAll<HTMLTextAreaElement>(
        'textarea.wiki-edit, .jstBlock textarea'
      )
      found.forEach((textarea) => newTextareas.add(textarea))
    }

    if (newTextareas.size > 0) {
      logger.info(`Processing ${newTextareas.size} new textareas in .note`)
      Array.from(newTextareas).forEach(processTextarea)
    }
  } catch (error) {
    handleError(error, 'handleNoteChanges')
  }
}
