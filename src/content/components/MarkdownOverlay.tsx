import React from 'react'
import MarkdownEditor from '@uiw/react-markdown-editor'
import type { Commands } from '@uiw/react-markdown-editor/cjs/components/ToolBar'
import remarkBreaks from 'remark-breaks'
import remarkCollapse from '../remark-plugins/remark-collapse'
import { ulist } from '../custom-commands/ulist'
import { olist } from '../custom-commands/olist'
import { useTabState } from '../hooks/useTabState'
import { useTextareaSync } from '../hooks/useTextareaSync'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { OVERLAY_CONFIG } from '../utils/constants'
import { customKeymap } from '../extensions/customKeymap'

interface MarkdownOverlayProps {
  textarea: HTMLTextAreaElement
}

const customCommands: Commands[] = [
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

export function MarkdownOverlay({ textarea }: MarkdownOverlayProps) {
  const isPreviewMode = useTabState(textarea)
  const { value, updateValue } = useTextareaSync(textarea)
  const { handleDragOver, handleDrop } = useDragAndDrop(textarea)

  return (
    <div
      data-color-mode="light"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        width: '100%',
        height: '100%',
        minHeight: `${OVERLAY_CONFIG.minHeight}px`,
        display: isPreviewMode ? 'none' : 'block',
      }}
    >
      <MarkdownEditor
        value={value}
        onChange={updateValue}
        toolbars={customCommands}
        previewProps={{
          remarkPlugins: [remarkBreaks, remarkCollapse],
        }}
        style={{
          fontSize: '16px',
          height: '100%',
          minHeight: `${OVERLAY_CONFIG.minHeight}px`,
        }}
        reExtensions={[customKeymap]}
      />
    </div>
  )
}
