import { DOMUtils } from './domUtils'
import { REDMINE_SELECTORS } from '../../config'
import { logger } from '../../utils/logger'

/** Check if current page is a Redmine page */
export const isRedminePage = (): boolean => {
  const indicators = [
    '#header',
    '.controller-issues',
    '.controller-wiki',
    'textarea.wiki-edit'
  ]
  
  const isRedmine = indicators.some(selector => 
    document.querySelector(selector) !== null
  )
  
  logger.debug(`Page is ${isRedmine ? '' : 'not '}a Redmine page`)
  return isRedmine
}

/** Find all relevant Redmine textareas on the page */
export const findTextareas = (): HTMLTextAreaElement[] => {
  const selectors = [REDMINE_SELECTORS.wikiEdit, REDMINE_SELECTORS.jstBlock]
  const textareas = DOMUtils.findTextareas(selectors)
  logger.info(`Found ${textareas.length} Redmine textareas`)
  return textareas
}

/** Hide Redmine toolbar/tab elements */
export const hideToolbars = (): void => {
  try {
    DOMUtils.hideElements(REDMINE_SELECTORS.tabElements)
    logger.debug('Redmine toolbars hidden')
  } catch (error) {
    logger.error('Failed to hide Redmine toolbars', error)
  }
}

/** Check if a textarea is within Redmine editing context */
export const isTextareaInContext = (
  textarea: HTMLTextAreaElement
): boolean => {
  const checks = [
    () => textarea.classList.contains('wiki-edit'),
    () => !!textarea.closest('.jstBlock'),
    () => !!textarea.closest('form')?.querySelector('.jstTabs')
  ]
  
  return checks.some(check => check())
}