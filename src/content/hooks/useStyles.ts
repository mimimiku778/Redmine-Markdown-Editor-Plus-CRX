import { useMemo } from 'react'
import { CONFIG } from '../../config'
import { logger } from '../../utils/logger'

export const useStyles = (isPreviewMode: boolean) => {
  const wrapperStyles = useMemo(
    () => ({
      width: '100%',
      height: '100%',
      minHeight: `${CONFIG.overlay.minHeight}px`,
      display: isPreviewMode ? 'none' : 'block',
    }),
    [isPreviewMode]
  )

  const editorStyles = useMemo(
    () => ({
      fontSize: 'inherit',
      height: '100%',
      minHeight: `${CONFIG.overlay.minHeight}px`,
    }),
    []
  )

  isPreviewMode && logger.debug(`Overlay render - Preview mode: ${isPreviewMode}`)

  return { wrapperStyles, editorStyles }
}
