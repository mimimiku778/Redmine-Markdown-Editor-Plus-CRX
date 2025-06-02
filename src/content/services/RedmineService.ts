import type { IRedmineService } from '../types'
import { DOMUtils } from '../utils/dom'
import { REDMINE_SELECTORS } from '../utils/constants'

export class RedmineService implements IRedmineService {
  findTextareas(): HTMLTextAreaElement[] {
    const selectors = [REDMINE_SELECTORS.wikiEdit, REDMINE_SELECTORS.jstBlock]
    return DOMUtils.findTextareas(selectors)
  }

  hideToolbars(): void {
    DOMUtils.hideElements(REDMINE_SELECTORS.tabElements)
  }

  isRedminePage(): boolean {
    // Check for common Redmine page elements
    return !!(
      document.querySelector('#header') ||
      document.querySelector('.controller-issues') ||
      document.querySelector('.controller-wiki') ||
      document.querySelector('textarea.wiki-edit')
    )
  }

  isTextareaInRedmineContext(textarea: HTMLTextAreaElement): boolean {
    return !!(
      textarea.classList.contains('wiki-edit') ||
      textarea.closest('.jstBlock') ||
      textarea.closest('form')?.querySelector('.jstTabs')
    )
  }
}