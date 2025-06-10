import { useEffect } from 'react'
import { REDMINE_SELECTORS } from '../../config'
import { logger } from '../../utils/logger'

export const useHideTabElements = (textarea: HTMLTextAreaElement) => {
  useEffect(() => {
    const tabElements = textarea
      .closest(REDMINE_SELECTORS.jstBlock)
      ?.querySelector(REDMINE_SELECTORS.tabElements) as HTMLElement | null

    tabElements && (tabElements.style.display = 'none')
    logger.debug('Setting tab elements display to none')

    return () => {
      if (tabElements) {
        tabElements.style.display = ''
        logger.debug('Restoring tab elements display')
      }
    }
  }, [textarea])
}
