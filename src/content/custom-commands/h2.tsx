import type { ICommand } from '@uiw/react-markdown-editor'

export const h2: ICommand = {
  name: 'h2',
  keyCommand: 'h2',
  button: { 'aria-label': 'Add H2 header' },
  icon: (
    <svg viewBox="0 0 24 24" height="21" width="21">
      <text
        x="12"
        y="16"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        H2
      </text>
    </svg>
  ),
  execute: (editor) => {
    const { state, view } = editor
    if (!state || !view) return

    const selection = view.state.selection.main
    const doc = view.state.doc
    const line = doc.lineAt(selection.from)

    // Check if line starts with any header pattern
    const headerMatch = line.text.match(/^(#+)\s/)
    
    if (headerMatch) {
      // Replace existing header with H2
      const headerLength = headerMatch[0].length
      view.dispatch({
        changes: {
          from: line.from,
          to: line.from + headerLength,
          insert: '## ',
        },
        selection: {
          anchor: selection.from - headerLength + 3,
          head: selection.to - headerLength + 3,
        },
      })
    } else {
      // Add '## ' at the beginning of the line
      view.dispatch({
        changes: {
          from: line.from,
          to: line.from,
          insert: '## ',
        },
        selection: {
          anchor: selection.from + 3,
          head: selection.to + 3,
        },
      })
    }
  },
}