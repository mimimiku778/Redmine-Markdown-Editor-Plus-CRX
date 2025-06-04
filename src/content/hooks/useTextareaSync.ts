import React from 'react'
import { SYNC_INTERVAL_MS } from '../utils'

export function useTextareaSync(textarea: HTMLTextAreaElement) {
  const [value, setValue] = React.useState(textarea.value)

  // Sync from textarea to state
  React.useEffect(() => {
    const handleTextareaChange = () => {
      setValue(textarea.value)
    }
    
    const handleTextareaValueChange = () => {
      // Check if textarea value changed without input event (e.g., from drag & drop)
      if (textarea.value !== value) {
        setValue(textarea.value)
      }
    }
    
    textarea.addEventListener('input', handleTextareaChange)
    
    // Poll for value changes (for cases where input event is not fired)
    const intervalId = setInterval(handleTextareaValueChange, SYNC_INTERVAL_MS)
    
    return () => {
      textarea.removeEventListener('input', handleTextareaChange)
      clearInterval(intervalId)
    }
  }, [textarea, value])

  // Sync from state to textarea
  const updateValue = React.useCallback((newValue: string) => {
    setValue(newValue)
    textarea.value = newValue
    
    // Trigger input event on textarea for any listeners
    const event = new Event('input', { bubbles: true })
    textarea.dispatchEvent(event)
  }, [textarea])

  return { value, updateValue }
}