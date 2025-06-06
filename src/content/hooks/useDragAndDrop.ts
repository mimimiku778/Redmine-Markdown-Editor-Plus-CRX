import { useCallback } from 'react'
import { logger } from '../../utils/logger'
import { DOMUtils } from '../services'

interface DragAndDropHandlers {
  handleDragOver: (event: React.DragEvent) => void
  handleDrop: (event: React.DragEvent) => void
}

const POSITION_CALCULATION_DELAY = 10
const RESTORE_STYLE_DELAY = 50

export function useDragAndDrop(textarea: HTMLTextAreaElement): DragAndDropHandlers {
  // Calculate text position from mouse coordinates
  const getTextPositionFromMouseEvent = useCallback((event: React.DragEvent): number => {
    const editorTextarea = DOMUtils.findEditorTextarea(textarea)
    if (!editorTextarea) {
      logger.warn('Editor textarea not found')
      return 0
    }

    const rect = editorTextarea.getBoundingClientRect()
    const relativeX = event.clientX - rect.left
    const relativeY = event.clientY - rect.top

    // Check if mouse is within bounds
    if (relativeX < 0 || relativeX > rect.width || relativeY < 0 || relativeY > rect.height) {
      logger.debug('Mouse outside editor bounds')
      return editorTextarea.selectionStart || 0
    }

    try {
      // Try to use modern API for accurate position
      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(event.clientX, event.clientY)
        if (range && editorTextarea.contains(range.startContainer)) {
          const textNode = range.startContainer
          const offset = range.startOffset
          
          if (textNode.nodeType === Node.TEXT_NODE) {
            logger.debug(`Calculated position: ${offset}`)
            return offset
          }
        }
      }

      // Fallback: line-based calculation
      const lineHeight = parseInt(getComputedStyle(editorTextarea).lineHeight) || 20
      const lines = editorTextarea.value.split('\n')
      const targetLine = Math.floor(relativeY / lineHeight)
      
      if (targetLine >= 0 && targetLine < lines.length) {
        let position = 0
        for (let i = 0; i < targetLine; i++) {
          position += lines[i].length + 1 // +1 for newline
        }
        
        // Estimate position within line
        const avgCharWidth = 8 // Average character width estimation
        const charInLine = Math.floor(relativeX / avgCharWidth)
        position += Math.min(charInLine, lines[targetLine].length)
        
        logger.debug(`Line-based position: line ${targetLine}, position ${position}`)
        return position
      }
    } catch (error) {
      logger.error('Error calculating position', error)
    }
    
    // Final fallback
    return editorTextarea.selectionStart || 0
  }, [textarea])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (event.dataTransfer?.types.includes('Files')) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      
      // Update cursor position in real-time
      const editorTextarea = DOMUtils.findEditorTextarea(textarea)
      if (editorTextarea) {
        const textPosition = getTextPositionFromMouseEvent(event)
        
        // Focus and update cursor position
        editorTextarea.focus()
        editorTextarea.setSelectionRange(textPosition, textPosition)
        
        logger.debug(`Updated cursor position to: ${textPosition}`)
      }
    }
  }, [textarea, getTextPositionFromMouseEvent])

  const handleDrop = useCallback((event: React.DragEvent) => {
    if (!event.dataTransfer?.types.includes('Files')) {
      return
    }

    event.preventDefault()
    
    const files = Array.from(event.dataTransfer.files)
    logger.info(`Drop detected: ${files.length} files`)
    
    const dropPosition = getTextPositionFromMouseEvent(event)
    
    // Update cursor position in editor
    const editorTextarea = DOMUtils.findEditorTextarea(textarea)
    if (editorTextarea) {
      editorTextarea.focus()
      editorTextarea.setSelectionRange(dropPosition, dropPosition)
    }
    
    // Sync cursor position to original textarea
    textarea.focus()
    textarea.setSelectionRange(dropPosition, dropPosition)
    
    // Store current value for later comparison
    const originalValue = textarea.value
    
    // Temporarily show original textarea to handle native Redmine drop
    const originalStyles = {
      display: textarea.style.display,
      position: textarea.style.position,
      opacity: textarea.style.opacity,
      pointerEvents: textarea.style.pointerEvents,
      width: textarea.style.width,
      height: textarea.style.height
    }
    
    // Make textarea visible but transparent for drop handling
    Object.assign(textarea.style, {
      display: 'block',
      position: 'absolute',
      opacity: '0.01',
      pointerEvents: 'auto',
      width: '100%',
      height: '100%'
    })
    
    // Create and dispatch cloned drop event
    const clonedEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: event.dataTransfer,
      clientX: event.clientX,
      clientY: event.clientY,
      view: window
    })
    
    // Forward event to original textarea
    setTimeout(() => {
      textarea.dispatchEvent(clonedEvent)
      
      // Watch for changes in textarea value (Redmine inserts attachment markdown)
      const checkInterval = setInterval(() => {
        if (textarea.value !== originalValue) {
          logger.info('Redmine inserted attachment markdown')
          clearInterval(checkInterval)
          
          // Trigger input event to sync with editor
          textarea.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }, 100)
      
      // Stop checking after 3 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
      }, 3000)
      
      // Restore original styles
      setTimeout(() => {
        Object.assign(textarea.style, originalStyles)
      }, RESTORE_STYLE_DELAY)
    }, POSITION_CALCULATION_DELAY)
    
    logger.debug(`Forwarded drop event to position ${dropPosition}`)
  }, [textarea, getTextPositionFromMouseEvent])

  return {
    handleDragOver,
    handleDrop
  }
}