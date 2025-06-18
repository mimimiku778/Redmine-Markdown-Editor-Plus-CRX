import type { ICommand } from '@uiw/react-markdown-editor'

export function createHeaderCommand(level: number, label: string): ICommand {
  const headerMark = '#'.repeat(level) + ' '

  return {
    name: `h${level}`,
    keyCommand: `h${level}`,
    button: { 'aria-label': `Add H${level} header` },
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
          {label}
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
        // Replace existing header with new level
        const headerLength = headerMatch[0].length
        const offsetDiff = headerMark.length - headerLength
        view.dispatch({
          changes: {
            from: line.from,
            to: line.from + headerLength,
            insert: headerMark,
          },
          selection: {
            anchor: selection.from + offsetDiff,
            head: selection.to + offsetDiff,
          },
        })
      } else {
        // Add header mark at the beginning of the line
        view.dispatch({
          changes: {
            from: line.from,
            to: line.from,
            insert: headerMark,
          },
          selection: {
            anchor: selection.from + headerMark.length,
            head: selection.to + headerMark.length,
          },
        })
      }
    },
  }
}