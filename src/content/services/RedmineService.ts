import { DOMUtils } from './domUtils'
import { REDMINE_SELECTORS } from '../constants'

/** Check if current page is a Redmine page */
export const isRedminePage = (): boolean =>
  !!(
    document.querySelector('#header') ||
    document.querySelector('.controller-issues') ||
    document.querySelector('.controller-wiki') ||
    document.querySelector('textarea.wiki-edit')
  )

/** Find all relevant Redmine textareas on the page */
export const findTextareas = (): HTMLTextAreaElement[] => {
  const selectors = [REDMINE_SELECTORS.wikiEdit, REDMINE_SELECTORS.jstBlock]
  return DOMUtils.findTextareas(selectors)
}

/** Hide Redmine toolbar/tab elements */
export const hideToolbars = (): void => {
  DOMUtils.hideElements(REDMINE_SELECTORS.tabElements)
}

/** Check if a textarea is within Redmine editing context */
export const isTextareaInContext = (
  textarea: HTMLTextAreaElement
): boolean =>
  textarea.classList.contains('wiki-edit') ||
  !!textarea.closest('.jstBlock') ||
  !!textarea.closest('form')?.querySelector('.jstTabs')