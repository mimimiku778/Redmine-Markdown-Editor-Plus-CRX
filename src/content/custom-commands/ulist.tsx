import type { ICommand } from '@uiw/react-markdown-editor';

export const ulist: ICommand = {
  name: 'ulist',
  keyCommand: 'ulist',
  button: { 'aria-label': 'Add ulist text' },
  icon: (
    <svg viewBox="0 0 512 512" height="14" width="14">
      <path
        fill="currentColor"
        d="M88 48c13.3 0 24 10.75 24 24v48c0 13.3-10.7 24-24 24H40c-13.25 0-24-10.7-24-24V72c0-13.25 10.75-24 24-24h48zm392 16c17.7 0 32 14.33 32 32 0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32 0-17.67 14.3-32 32-32h288zm0 160c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-17.7 0-32-14.3-32-32s14.3-32 32-32h288zm0 160c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-17.7 0-32-14.3-32-32s14.3-32 32-32h288zM16 232c0-13.3 10.75-24 24-24h48c13.3 0 24 10.7 24 24v48c0 13.3-10.7 24-24 24H40c-13.25 0-24-10.7-24-24v-48zm72 136c13.3 0 24 10.7 24 24v48c0 13.3-10.7 24-24 24H40c-13.25 0-24-10.7-24-24v-48c0-13.3 10.75-24 24-24h48z"
      />
    </svg>
  ),
  execute: (editor) => {
    const { state, view } = editor;
    if (!state || !view) return;
    
    const selection = view.state.selection.main;
    const doc = view.state.doc;
    
    // Get all lines in the selection
    const startLine = doc.lineAt(selection.from);
    const endLine = doc.lineAt(selection.to);
    
    const changes = [];
    let totalOffset = 0;
    
    // Process each line in the selection
    for (let lineNum = startLine.number; lineNum <= endLine.number; lineNum++) {
      const lineInfo = doc.line(lineNum);
      const hasListMark = lineInfo.text.match(/^- /);
      
      if (hasListMark) {
        // Remove the list mark
        changes.push({
          from: lineInfo.from,
          to: lineInfo.from + 2,
          insert: ''
        });
        totalOffset -= 2;
      } else {
        // Add the list mark
        changes.push({
          from: lineInfo.from,
          to: lineInfo.from,
          insert: '- '
        });
        totalOffset += 2;
      }
    }
    
    view.dispatch({
      changes: changes,
      selection: { 
        anchor: selection.from + (startLine.text.match(/^- /) ? -2 : 2),
        head: selection.to + totalOffset
      }
    });
  },
};