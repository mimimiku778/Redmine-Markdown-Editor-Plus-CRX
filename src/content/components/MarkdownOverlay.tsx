import { memo, useMemo } from 'react'
import MarkdownEditor from '@uiw/react-markdown-editor'
import type { Commands } from '@uiw/react-markdown-editor/cjs/components/ToolBar'
import remarkBreaks from 'remark-breaks'
import { remarkCollapse } from '../remark-plugins'
import { ulist, olist } from '../custom-commands'
import { useTabState, useTextareaSync, useDragAndDrop } from '../hooks'
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
  const { handleDragOver, handleDrop } = useDragAndDrop(textarea)

  const wrapperStyles = useMemo<WrapperStyles>(() => ({
    width: '100%',
    height: '100%',
    minHeight: `${CONFIG.overlay.minHeight}px`,
    display: isPreviewMode ? 'none' : 'block',
  }), [isPreviewMode])

  const editorStyles = useMemo<EditorStyles>(() => ({
    fontSize: '16px',
    height: '100%',
    minHeight: `${CONFIG.overlay.minHeight}px`,
  }), [])

  const remarkPlugins = useMemo(() => [remarkBreaks, remarkCollapse], [])
  const extensions = useMemo(() => [customKeymap], [])

  logger.debug(`Overlay render - Preview mode: ${isPreviewMode}`)

  return (
    <div
      data-color-mode="light"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
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
