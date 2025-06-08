import { REDMINE_SELECTORS } from '../../config'
import { logger } from '../../utils/logger'

export function findTextareas(selectors: string[]): HTMLTextAreaElement[] {
  try {
    const textareas = new Set<HTMLTextAreaElement>()

    for (const selector of selectors) {
      const elements = document.querySelectorAll<HTMLTextAreaElement>(selector)
      elements.forEach((el) => textareas.add(el))
    }

    logger.debug(`Found ${textareas.size} unique textareas`)
    return Array.from(textareas)
  } catch (error) {
    logger.error('Failed to find textareas', error)
    return []
  }
}

export function checkTabState(textarea: HTMLTextAreaElement): {
  isPreviewMode: boolean
  tabsContainer: Element | null
} {
  const tabsContainer = textarea.closest(REDMINE_SELECTORS.jstBlock)
  console.log('Tabs container:', tabsContainer)
  return tabsContainer && tabsContainer.querySelector('.tab-preview.selected')
    ? { isPreviewMode: true, tabsContainer }
    : { isPreviewMode: false, tabsContainer: null }
}

export function isTabClick(target: HTMLElement): boolean {
  return (
    target.tagName === 'A' &&
    (target.textContent?.toLowerCase().includes('preview') ||
      target.textContent?.toLowerCase().includes('edit') ||
      !!target.getAttribute('onclick')?.includes('preview') ||
      !!target.getAttribute('onclick')?.includes('edit'))
  )
}
