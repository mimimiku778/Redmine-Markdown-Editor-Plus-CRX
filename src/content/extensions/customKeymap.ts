import { keymap } from '@codemirror/view'
import { redo } from '@codemirror/commands'

/**
 * CodeMirror extension that adds Shift+Mod+Z keybinding for redo
 * Mod key is Cmd on Mac, Ctrl on other platforms
 */
export const customKeymap = keymap.of([
  {
    key: 'Shift-Mod-z',
    run: redo,
  },
])
