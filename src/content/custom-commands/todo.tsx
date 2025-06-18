import type { ICommand } from '@uiw/react-markdown-editor'

export const todo: ICommand = {
  name: 'todo',
  keyCommand: 'todo',
  button: { 'aria-label': 'Add todo checkbox' },
  icon: (
    <svg viewBox="0 0 48 48" fill="none" height="15" width="15">
      <path
        d="m5 10 3 3 6-6M5 24l3 3 6-6M5 38l3 3 6-6m7-11h22M21 38h22M21 10h22"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
      const hasTodoMark = lineInfo.text.match(/^- \[ \] /)

      if (hasTodoMark) {
        // Remove the todo mark
        changes.push({
          from: lineInfo.from,
          to: lineInfo.from + 6,
          insert: '',
        })
        totalOffset -= 6
      } else {
        // Add the todo mark
        changes.push({
          from: lineInfo.from,
          to: lineInfo.from,
          insert: '- [ ] ',
        })
        totalOffset += 6
      }
    }

    view.dispatch({
      changes: changes,
      selection: {
        anchor: selection.from + (startLine.text.match(/^- \[ \] /) ? -6 : 6),
        head: selection.to + totalOffset,
      },
    })
  },
}