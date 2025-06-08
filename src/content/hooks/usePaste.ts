import { useCallback } from 'react'
import type { EditorView } from '@codemirror/view'
import { logger } from '../../utils/logger'
import { useDragAndDrop } from './useDragAndDrop'

interface PasteHandlers {
  handlePaste: (
    event: React.ClipboardEvent,
    editorView: EditorView,
    updateValue: (value: string) => void
  ) => void
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']

export function usePaste(): PasteHandlers {
  const { handleDrop } = useDragAndDrop()

  const handlePaste = useCallback(
    (event: React.ClipboardEvent, editorView: EditorView, updateValue: (value: string) => void) => {
      const clipboardData = event.clipboardData
      if (!clipboardData?.files?.length) {
        return
      }

      const files = Array.from(clipboardData.files)
      const imageFiles = files.filter(file => {
        const fileName = file.name
        const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
        return IMAGE_EXTENSIONS.includes(fileExtension)
      })

      if (imageFiles.length === 0) {
        return
      }

      event.preventDefault()
      logger.info(`Paste detected: ${imageFiles.length} image files`)

      // Create a synthetic React.DragEvent to use with useDragAndDrop's handleDrop
      const syntheticDragEvent = {
        preventDefault: () => {},
        dataTransfer: {
          types: ['Files'],
          files: imageFiles,
        }
      } as unknown as React.DragEvent

      // Use the handleDrop function from useDragAndDrop
      handleDrop(syntheticDragEvent, editorView, updateValue)
    },
    [handleDrop]
  )

  return {
    handlePaste,
  }
}