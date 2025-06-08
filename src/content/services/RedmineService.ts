import { findTextareas as findTextareasFromDom } from './domUtils'
import { REDMINE_SELECTORS } from '../../config'
import { logger } from '../../utils/logger'

/** Check if current page is a Redmine page */
export function isRedminePage(): boolean {
  const indicators = ['#header', '.controller-issues', '.controller-wiki', 'textarea.wiki-edit']

  const isRedmine = indicators.some((selector) => document.querySelector(selector) !== null)

  logger.debug(`Page is ${isRedmine ? '' : 'not '}a Redmine page`)
  return isRedmine
}

/** Find all relevant Redmine textareas on the page */
export function findTextareas(): HTMLTextAreaElement[] {
  const selectors = [REDMINE_SELECTORS.wikiEdit, REDMINE_SELECTORS.jstBlockTextarea]
  const textareas = findTextareasFromDom(selectors)
  logger.info(`Found ${textareas.length} Redmine textareas`)
  return textareas
}

/** Check if a textarea is within Redmine editing context */
export function isTextareaInContext(textarea: HTMLTextAreaElement): boolean {
  const checks = [
    () => textarea.classList.contains('wiki-edit'),
    () => !!textarea.closest('.jstBlock'),
    () => !!textarea.closest('form')?.querySelector('.jstTabs'),
  ]

  return checks.some((check) => check())
}
