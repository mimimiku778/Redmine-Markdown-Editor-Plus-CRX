import type { ICommand } from '@uiw/react-markdown-editor'

export const unquote: ICommand = {
  name: 'unquote',
  keyCommand: 'unquote',
  button: { 'aria-label': 'Remove quote' },
  icon: (
    <svg viewBox="0 0 24 24" height="21" width="21">
      <path
        fill="currentColor"
        d="M3 17v2h18v-2H3zm0-4v2h18v-2H3z"
      />
      <path
        fill="currentColor"
        d="M7.5 5.2l-4.6 2.8 4.6 2.8V5.2zm1.5 1.8v2h8.3V7H9z"
      />
    </svg>
  ),
  execute: (editor) => {
    const { state, view } = editor
    if (!state || !view) return

    const selection = view.state.selection.main
    const doc = view.state.doc

    // Get all lines in the selection
    const startLine = doc.lineAt(selection.from)
    const endLine = doc.lineAt(selection.to)

    const changes = []
    let totalOffset = 0

    // Process each line in the selection
    for (let lineNum = startLine.number; lineNum <= endLine.number; lineNum++) {
      const lineInfo = doc.line(lineNum)
      
      // Check if line starts with quote mark (with optional spaces before >)
      const match = lineInfo.text.match(/^(\s*)> /)
      
      if (match) {
        // Remove one level of quote (preserving leading spaces)
        changes.push({
          from: lineInfo.from + match[1].length,
          to: lineInfo.from + match[0].length,
          insert: '',
        })
        totalOffset -= 2
      }
    }

    if (changes.length > 0) {
      view.dispatch({
        changes: changes,
        selection: {
          anchor: Math.max(selection.from + (startLine.text.match(/^(\s*)> /) ? -2 : 0), startLine.from),
          head: selection.to + totalOffset,
        },
      })
    }
  },
}