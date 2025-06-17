import { memo, useCallback } from 'react'
import MarkdownEditor from '@uiw/react-markdown-editor'
import { EditorView } from '@codemirror/view'
import type { Commands } from '@uiw/react-markdown-editor/esm/components/ToolBar'
import { usePaste } from '../hooks/usePaste'
import { ulist } from '../custom-commands/ulist'
import { olist } from '../custom-commands/olist'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { useExtensions } from '../hooks/useExtensions'
import { useHideTabElements } from '../hooks/useHideTabElements'
import { usePlugins } from '../hooks/usePlugins'
import { useStyles } from '../hooks/useStyles'
import { useTabState } from '../hooks/useTabState'
import { useTextareaSync } from '../hooks/useTextareaSync'
import { logger } from '../../utils/logger'
import { fullscreen } from '../custom-commands/fullscreen'
import { zoom } from '../custom-commands/zoom'

// Issue with Google Japanese IME Cursor Position in v6
// https://discuss.codemirror.net/t/issue-with-google-japanese-ime-cursor-position-in-v6/8810
;(EditorView as unknown as { EDIT_CONTEXT: boolean }).EDIT_CONTEXT = false

interface MarkdownOverlayProps {
  textarea: HTMLTextAreaElement
}

const toolbars: Commands[] = [
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

const toolbarsMode: Commands[] = ['preview', zoom, fullscreen]

const MarkdownOverlayComponent = ({ textarea }: MarkdownOverlayProps) => {
  const isPreviewMode = useTabState(textarea)
  const { extensions, editorViewRef } = useExtensions()
  const { value, updateValue } = useTextareaSync(textarea, editorViewRef)
  const { handleDragOver, handleDrop } = useDragAndDrop()
  const { handlePaste } = usePaste()
  const { remarkPlugins } = usePlugins()
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
      editorViewRef.current && handlePaste(event, editorViewRef.current, handleDrop, updateValue)
    },
    [handlePaste, handleDrop, updateValue, editorViewRef]
  )

  // Update textarea value on change
  const onChange = useCallback(
    (newValue: string) => {
      textarea.value = newValue
    },
    [textarea]
  )

  logger.debug('Rendering MarkdownOverlayComponent')

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
        onChange={onChange}
        toolbars={toolbars}
        toolbarsMode={toolbarsMode}
        previewProps={{
          remarkPlugins,
          className: 'wiki',
        }}
        style={editorStyles}
        reExtensions={extensions}
      />
    </div>
  )
}

// Memoized to prevent unnecessary re-renders
export const MarkdownOverlay = memo(MarkdownOverlayComponent)
