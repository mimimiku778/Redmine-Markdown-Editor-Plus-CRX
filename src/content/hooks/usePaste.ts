import { useCallback } from 'react'
import type { EditorView } from '@codemirror/view'
import { logger } from '../../utils/logger'

interface PasteHandlers {
  handlePaste: (
    event: React.ClipboardEvent,
    editorView: EditorView,
    updateValue: (value: string) => void
  ) => void
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']

export function usePaste(): PasteHandlers {
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

      // Create a synthetic drag event
      const syntheticDragEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      })

      // Add files to the synthetic event's dataTransfer
      imageFiles.forEach(file => {
        syntheticDragEvent.dataTransfer?.items.add(file)
      })

      // Find the target element with .box .filedroplistner selector
      let currentElement = event.target as Element
      let targetElement: Element | null = null

      while (currentElement && currentElement !== document.body) {
        const boxElement = currentElement.closest('.box')
        if (boxElement) {
          targetElement = boxElement.querySelector('.filedroplistner')
          if (targetElement) {
            break
          }
        }
        currentElement = currentElement.parentElement as Element
      }

      if (targetElement) {
        // Dispatch the synthetic drag event to the target element
        targetElement.dispatchEvent(syntheticDragEvent)
        logger.debug(`Synthetic drop event dispatched to .box .filedroplistner element`)
      } else {
        // Fallback: process the files directly using the same logic as useDragAndDrop
        const state = editorView.state
        const from = state.selection.main.from
        const to = state.selection.main.to

        const insertTexts: string[] = []

        imageFiles.forEach((file) => {
          const fileName = file.name
          insertTexts.push(`![](${fileName})`)
          logger.debug(`Inserting image markdown for: ${fileName}`)
        })

        if (insertTexts.length > 0) {
          const currentContent = state.doc.toString()
          const insertText = insertTexts.join('\n')
          const newContent = currentContent.slice(0, from) + insertText + currentContent.slice(to)

          updateValue(newContent)

          setTimeout(() => {
            const newCursorPos = from + insertText.length
            editorView.dispatch({
              selection: { anchor: newCursorPos, head: newCursorPos },
            })
          }, 0)
        }
      }
    },
    []
  )

  return {
    handlePaste,
  }
}