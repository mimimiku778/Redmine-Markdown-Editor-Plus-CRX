import { memo, useCallback } from 'react'
import MarkdownEditor from '@uiw/react-markdown-editor'
import type { Commands } from '@uiw/react-markdown-editor/esm/components/ToolBar'
import { usePaste } from '../hooks/usePaste'
import { logger } from '../../utils/logger'
import { ulist } from '../custom-commands/ulist'
import { olist } from '../custom-commands/olist'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { useExtensions } from '../hooks/useExtensions'
import { useHideTabElements } from '../hooks/useHideTabElements'
import { usePlugins } from '../hooks/usePlugins'
import { useStyles } from '../hooks/useStyles'
import { useTabState } from '../hooks/useTabState'
import { useTextareaSync } from '../hooks/useTextareaSync'

interface MarkdownOverlayProps {
  textarea: HTMLTextAreaElement
}

const DEFAULT_COMMANDS: Commands[] = [
  'undo',
  'redo',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'header',
  ulist,
  olist,
  'todo',
  'quote',
  'codeBlock',
  'link',
  'image',
]

const MarkdownOverlayComponent = ({ textarea }: MarkdownOverlayProps) => {
  const isPreviewMode = useTabState(textarea)
  const { value, updateValue } = useTextareaSync(textarea)
  const { handleDragOver, handleDrop } = useDragAndDrop()
  const { handlePaste } = usePaste()
  const { remarkPlugins } = usePlugins()
  const { extensions, editorViewRef } = useExtensions()
  const { wrapperStyles, editorStyles } = useStyles(isPreviewMode)
  useHideTabElements(textarea)

  // Handle drop event with editorView access
  const handleDropWithEditor = useCallback(
    (event: React.DragEvent) => {
      editorViewRef.current && handleDrop(event, editorViewRef.current, updateValue)
    },
    [handleDrop, updateValue, editorViewRef]
  )

  // Handle paste event with editorView access
  const handlePasteWithEditor = useCallback(
    (event: React.ClipboardEvent) => {
      editorViewRef.current && handlePaste(event, editorViewRef.current, updateValue)
    },
    [handlePaste, updateValue, editorViewRef]
  )

  return (
    <div
      data-color-mode="light"
      onDrop={handleDropWithEditor}
      onDragOver={handleDragOver}
      onPaste={handlePasteWithEditor}
      style={wrapperStyles}
    >
      <MarkdownEditor
        value={value}
        onChange={updateValue}
        toolbars={DEFAULT_COMMANDS}
        previewProps={{
          remarkPlugins,
        }}
        style={editorStyles}
        reExtensions={extensions}
      />
    </div>
  )
}

// Memoized to prevent unnecessary re-renders
export const MarkdownOverlay = memo(MarkdownOverlayComponent)
