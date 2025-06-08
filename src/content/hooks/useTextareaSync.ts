import { useState, useCallback } from 'react'
import { logger } from '../../utils/logger'

interface TextareaSyncResult {
  value: string
  updateValue: (newValue: string) => void
}

export function useTextareaSync(textarea: HTMLTextAreaElement): TextareaSyncResult {
  const [value, setValue] = useState(textarea.value)

  // Sync from state to textarea
  const updateValue = useCallback(
    (newValue: string) => {
      try {
        setValue(newValue)
        textarea.value = newValue

        // Trigger input event on textarea for any listeners
        const event = new Event('input', { bubbles: true })
        textarea.dispatchEvent(event)

        logger.debug('Updated textarea value from editor')
      } catch (error) {
        logger.error('Failed to update textarea value', error)
      }
    },
    [textarea]
  )

  return { value, updateValue }
}
