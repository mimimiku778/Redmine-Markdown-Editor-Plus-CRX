import React from 'react'
import { DOMUtils } from '../utils'

export function useTabState(textarea: HTMLTextAreaElement): boolean {
  const [isPreviewMode, setIsPreviewMode] = React.useState(false)

  React.useEffect(() => {
    const checkPreviewMode = () => {
      const tabState = DOMUtils.checkTabState(textarea)
      setIsPreviewMode(tabState.isPreviewMode)
    }

    // Check initially
    checkPreviewMode()

    // Watch for tab clicks
    const handleTabClick = (event: Event) => {
      const target = event.target as HTMLElement
      if (DOMUtils.isTabClick(target)) {
        setTimeout(checkPreviewMode, 100)
      }
    }

    document.addEventListener('click', handleTabClick)
    
    // Also watch for DOM changes in case tabs are dynamically updated
    const observer = new MutationObserver(checkPreviewMode)
    const tabState = DOMUtils.checkTabState(textarea)
    
    if (tabState.tabsContainer) {
      observer.observe(tabState.tabsContainer, { attributes: true, subtree: true })
    }

    return () => {
      document.removeEventListener('click', handleTabClick)
      observer.disconnect()
    }
  }, [textarea])

  return isPreviewMode
}