// Types are imported in DOMObserver.ts when needed
import { REDMINE_SELECTORS } from '../../config'
import { logger } from '../../utils/logger'
import { DOMError } from '../../types'

export class DOMUtils {
  static findTextareas(selectors: string[]): HTMLTextAreaElement[] {
    try {
      const textareas = new Set<HTMLTextAreaElement>()
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll<HTMLTextAreaElement>(selector)
        elements.forEach(el => textareas.add(el))
      }
      
      logger.debug(`Found ${textareas.size} unique textareas`)
      return Array.from(textareas)
    } catch (error) {
      logger.error('Failed to find textareas', error)
      return []
    }
  }

  static hideElements(selector: string): void {
    try {
      const elements = document.querySelectorAll<HTMLElement>(selector)
      elements.forEach((el) => {
        el.style.display = 'none'
      })
      logger.debug(`Hid ${elements.length} elements matching '${selector}'`)
    } catch (error) {
      logger.error(`Failed to hide elements for selector '${selector}'`, error)
    }
  }

  static getComputedHeight(element: HTMLElement): number {
    try {
      const computedStyle = window.getComputedStyle(element)
      const height = parseInt(computedStyle.height)
      return isNaN(height) ? 200 : height
    } catch (error) {
      logger.warn('Failed to get computed height, using default', error)
      return 200
    }
  }

  static createWrapper(minHeight: number): HTMLDivElement {
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position: relative;
      display: inline-block;
      width: 100%;
      height: ${minHeight}px;
      min-height: ${minHeight}px;
    `
    return wrapper
  }

  static hideTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.cssText = `
      opacity: 0;
      position: absolute;
      z-index: 1;
      pointer-events: none;
    `
  }

  static insertWrapper(textarea: HTMLTextAreaElement, wrapper: HTMLDivElement): void {
    const parent = textarea.parentNode
    if (!parent) {
      throw new DOMError('Textarea has no parent node')
    }
    
    parent.insertBefore(wrapper, textarea)
    wrapper.appendChild(textarea)
  }

  static checkTabState(textarea: HTMLTextAreaElement): {
    isPreviewMode: boolean
    tabsContainer: Element | null
  } {
    const possibleContainers = [
      textarea.closest('.jstBlock')?.querySelector(REDMINE_SELECTORS.jstTabs),
      textarea.closest('form')?.querySelector(REDMINE_SELECTORS.jstTabs),
      textarea.closest('.box')?.querySelector(REDMINE_SELECTORS.jstTabs),
      document.querySelector('.jstTabs'),
    ].filter(Boolean) as Element[]

    for (const tabsContainer of possibleContainers) {
      const previewIndicators = this.findPreviewIndicators(tabsContainer)
      
      if (previewIndicators.length > 0) {
        const isPreviewActive = previewIndicators.some(indicator => 
          this.isElementActive(indicator as HTMLElement)
        )
        
        return { isPreviewMode: isPreviewActive, tabsContainer }
      }
    }

    return { isPreviewMode: false, tabsContainer: null }
  }

  private static findPreviewIndicators(container: Element): Element[] {
    const indicators: Element[] = []
    
    // Direct preview tab selector
    const previewTab = container.querySelector(REDMINE_SELECTORS.previewTab)
    if (previewTab) indicators.push(previewTab)
    
    // Selected preview tabs
    const selectedPreview = container.querySelector('li.selected a[onclick*="preview"]')
    if (selectedPreview) indicators.push(selectedPreview)
    
    // Any links containing preview
    const previewLinks = Array.from(container.querySelectorAll('a')).filter(
      (a) => {
        const text = a.textContent?.toLowerCase() || ''
        const onclick = a.getAttribute('onclick') || ''
        return text.includes('preview') || onclick.includes('preview')
      }
    )
    indicators.push(...previewLinks)
    
    return indicators
  }

  private static isElementActive(element: HTMLElement): boolean {
    const activeClasses = ['selected', 'current', 'active']
    
    // Check element itself
    if (activeClasses.some(cls => element.classList.contains(cls))) {
      return true
    }
    
    // Check parent element
    const parent = element.parentElement
    if (parent && activeClasses.some(cls => parent.classList.contains(cls))) {
      return true
    }
    
    return false
  }

  static isTabClick(target: HTMLElement): boolean {
    if (target.tagName !== 'A') return false
    
    const text = target.textContent?.toLowerCase() || ''
    const onclick = target.getAttribute('onclick') || ''
    
    return ['preview', 'edit'].some(keyword => 
      text.includes(keyword) || onclick.includes(keyword)
    )
  }

  static findEditorTextarea(element: HTMLElement): HTMLTextAreaElement | null {
    return element.closest('.w-md-editor')?.querySelector<HTMLTextAreaElement>('textarea') || null
  }

  static async waitForElement(selector: string, timeout = 5000): Promise<Element> {
    const existingElement = document.querySelector(selector)
    if (existingElement) {
      return existingElement
    }

    return new Promise((resolve, reject) => {
      let observer: MutationObserver | null = null
      let timeoutId: ReturnType<typeof setTimeout> | null = null

      const cleanup = () => {
        if (observer) {
          observer.disconnect()
          observer = null
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }

      observer = new MutationObserver(() => {
        const element = document.querySelector(selector)
        if (element) {
          cleanup()
          resolve(element)
        }
      })

      timeoutId = setTimeout(() => {
        cleanup()
        reject(new DOMError(`Timeout waiting for element: ${selector}`))
      }, timeout)

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    })
  }
}