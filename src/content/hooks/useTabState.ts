import { useEffect, useState } from 'react'

export function useTabState(textarea: HTMLTextAreaElement): boolean {
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    const tabsContainer = textarea.closest('.jstBlock')
    if (!tabsContainer) return

    const checkPreviewMode = () => {
      const isPreview = !!tabsContainer.querySelector('.tab-preview.selected')
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
