import React from 'react'
import { createRoot } from 'react-dom/client'
import type { ProcessedTextarea } from '../../types'
import { MarkdownOverlay } from '../components/MarkdownOverlay'
import { MARKDOWN_OVERLAY_ATTRIBUTE, PROCESSED_ATTRIBUTE_VALUE } from '../../config'
import { isTextareaInContext } from './RedmineService'
import { logger } from '../../utils/logger'
import { DOMError } from '../../types'
import { handleError } from '../../utils/errors'

// Module-scoped processed state for overlays
const processedMap = new Map<HTMLTextAreaElement, ProcessedTextarea>()

const isAlreadyProcessed = (textarea: HTMLTextAreaElement): boolean =>
  textarea.getAttribute(MARKDOWN_OVERLAY_ATTRIBUTE) === PROCESSED_ATTRIBUTE_VALUE

/** Determine if this textarea should get a markdown overlay */
export function canProcess(textarea: HTMLTextAreaElement): boolean {
  return !isAlreadyProcessed(textarea) && isTextareaInContext(textarea)
}

/** Process a textarea by hiding it and rendering a MarkdownOverlay */
export function processTextarea(textarea: HTMLTextAreaElement): void {
  try {
    if (!canProcess(textarea)) {
      logger.debug('Textarea cannot be processed, skipping')
      return
    }

    const parent = textarea.parentNode
    if (!parent) {
      throw new DOMError('Textarea has no parent node')
    }

    // Create wrapper
    const wrapper = document.createElement('div')
    textarea.style.display = 'none'
    parent.insertBefore(wrapper, textarea.nextSibling)

    // Render overlay
    const root = createRoot(wrapper)
    root.render(React.createElement(MarkdownOverlay, { textarea }))

    // Track processed
    const processedData: ProcessedTextarea = { textarea, wrapper, root }
    processedMap.set(textarea, processedData)
    textarea.setAttribute(MARKDOWN_OVERLAY_ATTRIBUTE, PROCESSED_ATTRIBUTE_VALUE)

    logger.debug('Textarea processed successfully')
  } catch (error) {
    handleError(error, 'processTextarea')
  }
}

/** Cleanup an overlay for a given textarea */
export function cleanupTextarea(textarea: HTMLTextAreaElement): void {
  try {
    const entry = processedMap.get(textarea)
    if (!entry) {
      logger.debug('No processed entry found for textarea')
      return
    }

    entry.root.unmount()
    entry.wrapper.remove()
    processedMap.delete(textarea)
    textarea.removeAttribute(MARKDOWN_OVERLAY_ATTRIBUTE)
    textarea.style.display = '' // Restore original display

    logger.debug('Textarea cleanup completed')
  } catch (error) {
    handleError(error, 'cleanupTextarea')
  }
}

/** Cleanup all overlays */
export function cleanupAll(): void {
  logger.info(`Cleaning up ${processedMap.size} overlays`)
  processedMap.forEach((_, textarea) => cleanupTextarea(textarea))
  processedMap.clear()
}
