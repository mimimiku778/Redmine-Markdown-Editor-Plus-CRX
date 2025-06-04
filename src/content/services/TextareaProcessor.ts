import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ITextareaProcessor } from '../types'
import { MarkdownOverlay } from '../components/MarkdownOverlay'
import { MARKDOWN_OVERLAY_ATTRIBUTE } from '../utils/constants'
import { RedmineService } from './RedmineService'

export class TextareaProcessor implements ITextareaProcessor {
  constructor(
    private redmineService: RedmineService = new RedmineService(),
    private processedTextareas: Map<
      HTMLTextAreaElement,
      { wrapper: HTMLDivElement; root: Root }
    > = new Map()
  ) {}

  canProcess(textarea: HTMLTextAreaElement): boolean {
    return (
      !this.isAlreadyProcessed(textarea) && this.redmineService.isTextareaInRedmineContext(textarea)
    )
  }

  process(textarea: HTMLTextAreaElement): void {
    if (!this.canProcess(textarea)) {
      return
    }

    const { wrapper, root } = this.createMarkdownOverlay(textarea)
    this.processedTextareas.set(textarea, { wrapper, root })

    // Mark as processed
    textarea.setAttribute(MARKDOWN_OVERLAY_ATTRIBUTE, 'true')
  }

  cleanup(textarea: HTMLTextAreaElement): void {
    const processed = this.processedTextareas.get(textarea)
    if (processed) {
      processed.root.unmount()
      processed.wrapper.remove()
      this.processedTextareas.delete(textarea)
      textarea.removeAttribute(MARKDOWN_OVERLAY_ATTRIBUTE)
    }
  }

  private isAlreadyProcessed(textarea: HTMLTextAreaElement): boolean {
    return textarea.getAttribute(MARKDOWN_OVERLAY_ATTRIBUTE) === 'true'
  }

  private createMarkdownOverlay(textarea: HTMLTextAreaElement): {
    wrapper: HTMLDivElement
    root: Root
  } {
    // Create wrapper that will completely replace the textarea visually
    const wrapper = document.createElement('div')

    // Hide original textarea but keep it in DOM for form functionality
    textarea.style.display = 'none'

    // Insert wrapper after textarea
    textarea.parentNode?.insertBefore(wrapper, textarea.nextSibling)

    // Render React component directly in wrapper
    const root = createRoot(wrapper)
    root.render(React.createElement(MarkdownOverlay, { textarea }))

    return { wrapper, root }
  }
}
