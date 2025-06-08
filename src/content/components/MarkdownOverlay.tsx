import { memo, useCallback } from 'react'
import MarkdownEditor from '@uiw/react-markdown-editor'
import type { Commands } from '@uiw/react-markdown-editor/esm/components/ToolBar'
import { ulist, olist } from '../custom-commands'
import {
  useTabState,
  useTextareaSync,
  useDragAndDrop,
  useHideTabElements,
  usePlugins,
  useExtensions,
  useStyles,
} from '../hooks'
import { usePaste } from '../hooks/usePaste'
import { logger } from '../../utils/logger'

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
      if (editorViewRef.current) {
        handleDrop(event, editorViewRef.current, updateValue)
      } else {
        logger.warn('EditorView not available for drag and drop')
      }
    },
    [handleDrop, updateValue, editorViewRef]
  )

  // Handle paste event with editorView access
  const handlePasteWithEditor = useCallback(
    (event: React.ClipboardEvent) => {
      if (editorViewRef.current) {
        handlePaste(event, editorViewRef.current, updateValue)
      } else {
        logger.warn('EditorView not available for paste')
      }
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
