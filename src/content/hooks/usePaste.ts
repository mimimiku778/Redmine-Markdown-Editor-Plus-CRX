import { EditorView } from '@codemirror/view'
import { useCallback } from 'react'
import { IMAGE_EXTENSIONS, REDMINE_SELECTORS } from '../../config'
import { logger } from '../../utils/logger'
import type { handleDrop } from './useDragAndDrop'

interface PasteHandlers {
  handlePaste: (
    event: React.ClipboardEvent,
    editorView: EditorView,
    handleDrop: handleDrop,
    updateValue: (value: string) => void
  ) => void
}

export function usePaste(): PasteHandlers {
  const handlePaste = useCallback(
    (event: React.ClipboardEvent, editorView: EditorView, handleDrop: handleDrop, updateValue: (value: string) => void) => {
      const clipboardData = event.clipboardData
      if (!clipboardData?.files?.length) {
        return
      }

      const files = Array.from(clipboardData.files)
      const imageFiles = files.filter((file) => {
        const fileName = file.name
        const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
        return IMAGE_EXTENSIONS.includes(fileExtension)
      })

      if (imageFiles.length === 0) {
        return
      }

      event.preventDefault()
      logger.info(`Paste detected: ${imageFiles.length} image files`)

      // Create a synthetic drag event
      const syntheticDragEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      })

      // Add files to the synthetic event's dataTransfer
      imageFiles.forEach((file) => {
        syntheticDragEvent.dataTransfer?.items.add(file)
      })
      ;(event.target as Element)
        .closest(REDMINE_SELECTORS.box + REDMINE_SELECTORS.filedroplistner)
        ?.dispatchEvent(syntheticDragEvent)

      handleDrop(syntheticDragEvent, editorView, updateValue)
    },
    []
  )

  return {
    handlePaste,
  }
}
