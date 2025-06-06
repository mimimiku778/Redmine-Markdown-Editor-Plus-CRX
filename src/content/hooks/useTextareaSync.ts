import { useState, useEffect, useCallback, useRef } from 'react'
import { CONFIG } from '../../config'
import { logger } from '../../utils/logger'

interface TextareaSyncResult {
  value: string
  updateValue: (newValue: string) => void
}

export function useTextareaSync(textarea: HTMLTextAreaElement): TextareaSyncResult {
  const [value, setValue] = useState(textarea.value)
  const lastValueRef = useRef(textarea.value)

  // Sync from textarea to state
  useEffect(() => {
    const handleTextareaChange = () => {
      const newValue = textarea.value
      if (newValue !== lastValueRef.current) {
        setValue(newValue)
        lastValueRef.current = newValue
        logger.debug('Textarea value changed via input event')
      }
    }
    
    const checkTextareaValue = () => {
      // Check if textarea value changed without input event (e.g., from drag & drop or programmatic changes)
      const currentValue = textarea.value
      if (currentValue !== lastValueRef.current) {
        setValue(currentValue)
        lastValueRef.current = currentValue
        logger.debug('Textarea value changed via polling')
      }
    }
    
    textarea.addEventListener('input', handleTextareaChange)
    
    // Poll for value changes (for cases where input event is not fired)
    const intervalId = setInterval(checkTextareaValue, CONFIG.syncInterval)
    
    return () => {
      textarea.removeEventListener('input', handleTextareaChange)
      clearInterval(intervalId)
    }
  }, [textarea])

  // Sync from state to textarea
  const updateValue = useCallback((newValue: string) => {
    try {
      setValue(newValue)
      lastValueRef.current = newValue
      textarea.value = newValue
      
      // Trigger input event on textarea for any listeners
      const event = new Event('input', { bubbles: true })
      textarea.dispatchEvent(event)
      
      logger.debug('Updated textarea value from editor')
    } catch (error) {
      logger.error('Failed to update textarea value', error)
    }
  }, [textarea])

  return { value, updateValue }
}