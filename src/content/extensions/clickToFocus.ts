import { EditorView, ViewPlugin } from '@codemirror/view'
import type { Extension } from '@codemirror/state'

/**
 * CodeMirror extension that makes the entire editor area clickable
 * when there is only one line or empty content, automatically focusing
 * on the last position of the document.
 */
export const clickToFocusExtension: Extension = [
  ViewPlugin.fromClass(
    class {
      constructor(private view: EditorView) {
        this.addClickListener()
      }

      private addClickListener() {
        // Get the editor DOM element container
        const editorElement = this.view.dom.closest('.md-editor-inner') as HTMLElement
        // Add click event listener to the editor element
        editorElement?.addEventListener('click', this.handleClick)
      }

      private handleClick = (event: MouseEvent) => {
        // Ignore clicks on child elements, only handle direct clicks on editor element
        if (event.target !== event.currentTarget) {
          return
        }

        // Focus the editor
        this.view.focus()

        // Set cursor to the end of the document
        const doc = this.view.state.doc
        const lastLineEnd = doc.length
        this.view.dispatch({
          selection: { anchor: lastLineEnd, head: lastLineEnd },
          scrollIntoView: true,
        })

        // Prevent event propagation
        event.preventDefault()
        event.stopPropagation()
      }

      destroy() {
        // Clean up event listener
        const editorElement = this.view.dom
        editorElement.removeEventListener('click', this.handleClick)
      }
    }
  ),
]
