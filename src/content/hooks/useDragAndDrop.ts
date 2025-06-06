import { useCallback } from 'react'
import type { EditorView } from '@codemirror/view'
import { logger } from '../../utils/logger'

interface DragAndDropHandlers {
  handleDragOver: (event: React.DragEvent) => void
  handleDrop: (event: React.DragEvent, editorView: EditorView, updateValue: (value: string) => void) => void
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']

export function useDragAndDrop(): DragAndDropHandlers {
  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (event.dataTransfer?.types.includes('Files')) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleDrop = useCallback((event: React.DragEvent, editorView: EditorView, updateValue: (value: string) => void) => {
    if (!event.dataTransfer?.types.includes('Files')) {
      return
    }

    event.preventDefault()
    
    const files = Array.from(event.dataTransfer.files)
    logger.info(`Drop detected: ${files.length} files`)
    
    // Get current editor state and cursor position
    const state = editorView.state
    const from = state.selection.main.from
    const to = state.selection.main.to
    
    // Process dropped files
    const insertTexts: string[] = []
    
    files.forEach((file) => {
      const fileName = file.name
      const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      
      if (IMAGE_EXTENSIONS.includes(fileExtension)) {
        // Insert markdown image syntax for image files
        insertTexts.push(`![](${fileName})`)
        logger.debug(`Inserting image markdown for: ${fileName}`)
      } else {
        // For non-image files, just insert the filename
        insertTexts.push(fileName)
        logger.debug(`Inserting filename: ${fileName}`)
      }
    })
    
    if (insertTexts.length > 0) {
      // Get current content
      const currentContent = state.doc.toString()
      
      // Insert at cursor position
      const insertText = insertTexts.join('\n')
      const newContent = 
        currentContent.slice(0, from) + 
        insertText + 
        currentContent.slice(to)
      
      // Update the editor value
      updateValue(newContent)
      
      // Set cursor position after inserted text
      setTimeout(() => {
        const newCursorPos = from + insertText.length
        editorView.dispatch({
          selection: { anchor: newCursorPos, head: newCursorPos }
        })
      }, 0)
    }
  }, [])

  return {
    handleDragOver,
    handleDrop
  }
}