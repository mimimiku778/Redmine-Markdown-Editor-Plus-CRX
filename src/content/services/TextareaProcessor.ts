import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MarkdownOverlay } from '../components/MarkdownOverlay'
import { MARKDOWN_OVERLAY_ATTRIBUTE } from '../utils/constants'
import { isTextareaInContext } from './RedmineService'

// Module-scoped processed state for overlays
const processedMap = new Map<HTMLTextAreaElement, { wrapper: HTMLDivElement; root: Root }>()

const isAlreadyProcessed = (textarea: HTMLTextAreaElement): boolean =>
  textarea.getAttribute(MARKDOWN_OVERLAY_ATTRIBUTE) === 'true'

/** Determine if this textarea should get a markdown overlay */
export const canProcess = (textarea: HTMLTextAreaElement): boolean =>
  !isAlreadyProcessed(textarea) && isTextareaInContext(textarea)

/** Process a textarea by hiding it and rendering a MarkdownOverlay */
export const processTextarea = (textarea: HTMLTextAreaElement): void => {
  if (!canProcess(textarea)) return
  // Create wrapper
  const wrapper = document.createElement('div')
  textarea.style.display = 'none'
  textarea.parentNode?.insertBefore(wrapper, textarea.nextSibling)
  // Render overlay
  const root = createRoot(wrapper)
  root.render(React.createElement(MarkdownOverlay, { textarea }))
  // Track processed
  processedMap.set(textarea, { wrapper, root })
  textarea.setAttribute(MARKDOWN_OVERLAY_ATTRIBUTE, 'true')
}

/** Cleanup an overlay for a given textarea */
export const cleanupTextarea = (textarea: HTMLTextAreaElement): void => {
  const entry = processedMap.get(textarea)
  if (!entry) return
  entry.root.unmount()
  entry.wrapper.remove()
  processedMap.delete(textarea)
  textarea.removeAttribute(MARKDOWN_OVERLAY_ATTRIBUTE)
}

/** Cleanup all overlays (optional) */
export const cleanupAll = (): void => {
  processedMap.forEach((_, textarea) => cleanupTextarea(textarea))
}
