import { useState, useCallback } from 'react'

interface TextareaSyncResult {
  value: string
  updateValue: (newValue: string) => void
}

export function useTextareaSync(textarea: HTMLTextAreaElement): TextareaSyncResult {
  const [value, setValue] = useState(textarea.value)

  // Sync from state to textarea
  const updateValue = useCallback(
    (newValue: string) => {
      setValue(newValue)
      textarea.value = newValue
    },
    [textarea]
  )

  return { value, updateValue }
}
