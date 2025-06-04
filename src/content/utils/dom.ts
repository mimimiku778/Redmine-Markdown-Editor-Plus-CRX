import type { TabState } from '../types'
import { REDMINE_SELECTORS } from './constants'

export class DOMUtils {
  static findTextareas(selectors: string[]): HTMLTextAreaElement[] {
    const textareas: HTMLTextAreaElement[] = []

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLTextAreaElement>
      textareas.push(...Array.from(elements))
    })

    return textareas
  }

  static hideElements(selector: string): void {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement
      htmlElement.style.display = 'none'
    })
  }

  static getComputedHeight(element: HTMLElement): number {
    const computedStyle = window.getComputedStyle(element)
    return parseInt(computedStyle.height) || 200
  }

  static createWrapper(minHeight: number): HTMLDivElement {
    const wrapper = document.createElement('div')
    wrapper.style.position = 'relative'
    wrapper.style.display = 'inline-block'
    wrapper.style.width = '100%'
    wrapper.style.height = `${minHeight}px`
    wrapper.style.minHeight = `${minHeight}px`

    return wrapper
  }

  static hideTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.opacity = '0'
    textarea.style.position = 'absolute'
    textarea.style.zIndex = '1'
    textarea.style.pointerEvents = 'none'
  }

  static insertWrapper(textarea: HTMLTextAreaElement, wrapper: HTMLDivElement): void {
    textarea.parentNode?.insertBefore(wrapper, textarea)
    wrapper.appendChild(textarea)
  }

  static checkTabState(textarea: HTMLTextAreaElement): TabState {
    // Look for tab containers in multiple ways
    const possibleContainers = [
      textarea.closest('.jstBlock')?.querySelector(REDMINE_SELECTORS.jstTabs),
      textarea.closest('form')?.querySelector(REDMINE_SELECTORS.jstTabs),
      textarea.closest('.box')?.querySelector(REDMINE_SELECTORS.jstTabs),
      document.querySelector('.jstTabs'), // Fallback for dynamically loaded content
    ].filter(Boolean)

    for (const tabsContainer of possibleContainers) {
      if (!tabsContainer) continue

      // Look for preview indicators in multiple ways
      const previewIndicators = [
        tabsContainer.querySelector(REDMINE_SELECTORS.previewTab),
        tabsContainer.querySelector('li.selected a[onclick*="preview"]'),
        tabsContainer.querySelector('.selected[onclick*="preview"]'),
        ...Array.from(tabsContainer.querySelectorAll('a')).filter(
          (a) =>
            a.textContent?.toLowerCase().includes('preview') ||
            a.getAttribute('onclick')?.includes('preview')
        ),
      ].filter(Boolean)

      if (previewIndicators.length > 0) {
        // Check if any preview indicator is active
        const isPreviewActive = previewIndicators.some((indicator) => {
          const element = indicator as HTMLElement
          return (
            element.classList.contains('selected') ||
            element.parentElement?.classList.contains('selected') ||
            element.parentElement?.classList.contains('current') ||
            element.classList.contains('current')
          )
        })

        return { isPreviewMode: isPreviewActive, tabsContainer }
      }
    }

    return { isPreviewMode: false, tabsContainer: null }
  }

  static isTabClick(target: HTMLElement): boolean {
    if (target.tagName === 'A') {
      const text = target.textContent?.toLowerCase() || ''
      const onclick = target.getAttribute('onclick') || ''
      return (
        text.includes('preview') ||
        text.includes('edit') ||
        onclick.includes('preview') ||
        onclick.includes('edit')
      )
    }
    return false
  }

  static findEditorTextarea(element: HTMLElement): HTMLTextAreaElement | null {
    return (
      (element.closest('.w-md-editor')?.querySelector('textarea') as HTMLTextAreaElement) || null
    )
  }
}
