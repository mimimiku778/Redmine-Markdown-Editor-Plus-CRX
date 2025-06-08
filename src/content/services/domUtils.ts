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
  const possibleContainers = [
    textarea.closest('.jstBlock')?.querySelector(REDMINE_SELECTORS.jstTabs),
    textarea.closest('form')?.querySelector(REDMINE_SELECTORS.jstTabs),
    textarea.closest('.box')?.querySelector(REDMINE_SELECTORS.jstTabs),
    document.querySelector('.jstTabs'),
  ].filter(Boolean) as Element[]

  for (const tabsContainer of possibleContainers) {
    // Check for any active preview indicator in one simple check
    const isPreviewActive = !!(
      tabsContainer.querySelector(REDMINE_SELECTORS.previewTab + '.selected') ||
      tabsContainer.querySelector('li.selected a[onclick*="preview"]') ||
      tabsContainer.querySelector('.selected') ||
      tabsContainer.querySelector('.current') ||
      tabsContainer.querySelector('.active')
    )

    if (isPreviewActive) {
      return { isPreviewMode: true, tabsContainer }
    }
  }

  return { isPreviewMode: false, tabsContainer: null }
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
