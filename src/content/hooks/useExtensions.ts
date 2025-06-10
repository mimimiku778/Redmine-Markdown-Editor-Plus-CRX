import { useMemo, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { keymap, ViewPlugin } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import type { EditorView } from '@codemirror/view'
import { logger } from '../../utils/logger'
import { customKeymap } from '../extensions/customKeymap'

export const useExtensions = () => {
  const editorViewRef = useRef<EditorView | null>(null)

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

  const extensions = useMemo(
    () => [basicSetup, keymap.of([indentWithTab]), markdown(), customKeymap, viewCapturePlugin],
    [viewCapturePlugin]
  )

  return { extensions, editorViewRef }
}
