import { memo, useMemo, useRef, useCallback } from 'react'
import MarkdownEditor from '@uiw/react-markdown-editor'
import type { Commands } from '@uiw/react-markdown-editor/esm/components/ToolBar'
import type { EditorView } from '@codemirror/view'
import { ViewPlugin } from '@codemirror/view'
import remarkBreaks from 'remark-breaks'
import { remarkCollapse } from '../remark-plugins'
import { ulist, olist } from '../custom-commands'
import { useTabState, useTextareaSync, useDragAndDrop } from '../hooks'
import { usePaste } from '../hooks/usePaste'
import { CONFIG } from '../../config'
import { customKeymap } from '../extensions'
import { logger } from '../../utils/logger'

interface MarkdownOverlayProps {
  textarea: HTMLTextAreaElement
}

interface EditorStyles {
  fontSize: string
  height: string
  minHeight: string
}

interface WrapperStyles {
  width: string
  height: string
  minHeight: string
  display: string
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
  const editorViewRef = useRef<EditorView | null>(null)

  const wrapperStyles = useMemo<WrapperStyles>(
    () => ({
      width: '100%',
      height: '100%',
      minHeight: `${CONFIG.overlay.minHeight}px`,
      display: isPreviewMode ? 'none' : 'block',
    }),
    [isPreviewMode]
  )

  const editorStyles = useMemo<EditorStyles>(
    () => ({
      fontSize: '16px',
      height: '100%',
      minHeight: `${CONFIG.overlay.minHeight}px`,
    }),
    []
  )

  const remarkPlugins = useMemo(() => [remarkBreaks, remarkCollapse], [])

  // Create a view plugin to capture the editor view
  const viewCapturePlugin = useMemo(
    () =>
      ViewPlugin.fromClass(
        class {
          constructor(view: EditorView) {
            editorViewRef.current = view
            logger.debug('EditorView captured via ViewPlugin')
          }
          destroy() {
            editorViewRef.current = null
          }
        }
      ),
    []
  )

  const extensions = useMemo(() => [customKeymap, viewCapturePlugin], [viewCapturePlugin])

  // Handle drop event with editorView access
  const handleDropWithEditor = useCallback(
    (event: React.DragEvent) => {
      if (editorViewRef.current) {
        handleDrop(event, editorViewRef.current, updateValue)
      } else {
        logger.warn('EditorView not available for drag and drop')
      }
    },
    [handleDrop, updateValue]
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
    [handlePaste, updateValue]
  )

  isPreviewMode && logger.debug(`Overlay render - Preview mode: ${isPreviewMode}`)

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
