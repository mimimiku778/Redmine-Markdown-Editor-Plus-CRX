import type { ICommand } from '@uiw/react-markdown-editor'

export const quote: ICommand = {
  name: 'quote',
  keyCommand: 'quote',
  button: { 'aria-label': 'Add quote' },
  icon: (
    <svg viewBox="0 0 24 24" height="21" width="21">
      <path
        fill="currentColor"
        d="M3 17v2h18v-2H3zm0-4v2h18v-2H3z"
      />
      <path
        fill="currentColor"
        d="M3 5.2l4.6 2.8L3 10.8V5.2zm5.5 1.8v2h8.3V7h-8.3z"
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
      
      // Add quote mark at the beginning of each line
      changes.push({
        from: lineInfo.from,
        to: lineInfo.from,
        insert: '> ',
      })
      totalOffset += 2
    }

    view.dispatch({
      changes: changes,
      selection: {
        anchor: selection.from + 2,
        head: selection.to + totalOffset,
      },
    })
  },
}