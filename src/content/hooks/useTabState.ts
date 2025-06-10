import { useEffect, useState } from 'react'
import { REDMINE_SELECTORS } from '../../config'

export function useTabState(textarea: HTMLTextAreaElement): boolean {
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    const tabsContainer = textarea.closest(REDMINE_SELECTORS.jstBlock)
    if (!tabsContainer) return

    const checkPreviewMode = () => {
      const isPreview = !!tabsContainer.querySelector(REDMINE_SELECTORS.tabPreviewSelected)
      setIsPreviewMode(isPreview)
    }

    checkPreviewMode()

    const observer = new MutationObserver(checkPreviewMode)
    observer.observe(tabsContainer, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [textarea])

  return isPreviewMode
}
