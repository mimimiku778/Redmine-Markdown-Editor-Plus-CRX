import { useEffect, useState, useCallback } from 'react'
import { DOMUtils } from '../services'
import { logger } from '../../utils/logger'

const TAB_CHECK_DELAY = 100

export function useTabState(textarea: HTMLTextAreaElement): boolean {
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const checkPreviewMode = useCallback(() => {
    try {
      const tabState = DOMUtils.checkTabState(textarea)
      setIsPreviewMode(tabState.isPreviewMode)
      logger.debug(`Tab state updated - Preview: ${tabState.isPreviewMode}`)
      return tabState
    } catch (error) {
      logger.error('Failed to check tab state', error)
      return { isPreviewMode: false, tabsContainer: null }
    }
  }, [textarea])

  useEffect(() => {
    // Initial check
    const initialState = checkPreviewMode()

    // Watch for tab clicks
    const handleTabClick = (event: Event) => {
      const target = event.target as HTMLElement
      if (DOMUtils.isTabClick(target)) {
        // Delay to ensure DOM has updated
        setTimeout(checkPreviewMode, TAB_CHECK_DELAY)
      }
    }

    // Setup mutation observer for dynamic tab updates
    let observer: MutationObserver | null = null
    
    if (initialState.tabsContainer) {
      observer = new MutationObserver(() => {
        checkPreviewMode()
      })
      
      observer.observe(initialState.tabsContainer, { 
        attributes: true, 
        subtree: true,
        attributeFilter: ['class']
      })
    }

    // Use capture phase to catch events earlier
    document.addEventListener('click', handleTabClick, true)
    
    return () => {
      document.removeEventListener('click', handleTabClick, true)
      observer?.disconnect()
    }
  }, [textarea, checkPreviewMode])

  return isPreviewMode
}