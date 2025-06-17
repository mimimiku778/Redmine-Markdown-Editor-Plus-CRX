import { REDMINE_SELECTORS } from '../../config'
import { logger } from '../../utils/logger'

/** Check if current page is a Redmine page */
export function isRedminePage(): boolean {
  const indicators = [
    REDMINE_SELECTORS.jstBlockTextarea,
  ]

  const isRedmine = indicators.some((selector) => document.querySelector(selector) !== null)

  logger.debug(`Page is ${isRedmine ? '' : 'not '}a Redmine page`)
  return isRedmine
}

/** Find all relevant Redmine textareas on the page */
export function findTextareas(): HTMLTextAreaElement[] {
  const selectors = [REDMINE_SELECTORS.wikiEdit, REDMINE_SELECTORS.jstBlockTextarea]

  try {
    const textareas = new Set<HTMLTextAreaElement>()

    for (const selector of selectors) {
      const elements = document.querySelectorAll<HTMLTextAreaElement>(selector)
      elements.forEach((el) => textareas.add(el))
    }

    logger.debug(`Found ${textareas.size} Redmine textareas`)
    return Array.from(textareas)
  } catch (error) {
    logger.error('Failed to find textareas', error)
    return []
  }
}

/** Check if a textarea is within Redmine editing context */
export function isTextareaInContext(textarea: HTMLTextAreaElement): boolean {
  const checks = [
    () => textarea.classList.contains(REDMINE_SELECTORS.wikiEditClass),
    () => !!textarea.closest(REDMINE_SELECTORS.jstBlock),
    () => !!textarea.closest('form')?.querySelector(REDMINE_SELECTORS.jstTabs),
  ]

  return checks.some((check) => check())
}
