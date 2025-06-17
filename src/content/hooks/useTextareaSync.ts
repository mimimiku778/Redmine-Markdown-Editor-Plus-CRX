import { useState, useCallback, useEffect } from 'react'
import type { EditorView } from '@codemirror/view'
import type { RefObject } from 'react'

interface TextareaSyncResult {
  value: string
  updateValue: (newValue: string) => void
}

export function useTextareaSync(
  textarea: HTMLTextAreaElement,
  editorViewRef: RefObject<EditorView | null>
): TextareaSyncResult {
  const [value, setValue] = useState(textarea.value)

  // Sync from state to textarea
  const updateValue = useCallback(
    (newValue: string) => {
      setValue(newValue)
      textarea.value = newValue
    },
    [textarea]
  )

  // Monitor textarea.value changes and sync to state
  useEffect(() => {
    let animationFrameId: number
    let isRunning = true

    const checkTextareaValue = () => {
      if (!isRunning) return
      
      const currentTextareaValue = textarea.value
      
      // Compare with EditorState.doc content if available, otherwise use current state value
      const currentEditorValue = editorViewRef.current?.state.doc.toString()
      
      // Skip if textarea.value is the same as current editor state
      if (currentTextareaValue !== currentEditorValue) {
        setValue(currentTextareaValue)
      }
      
      animationFrameId = requestAnimationFrame(checkTextareaValue)
    }

    // Start monitoring
    animationFrameId = requestAnimationFrame(checkTextareaValue)

    return () => {
      isRunning = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [textarea, editorViewRef])

  return { value, updateValue }
}
