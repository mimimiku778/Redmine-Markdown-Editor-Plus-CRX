import { keymap, Prec } from '@codemirror/view'
import { redo } from '@codemirror/commands'

/**
 * CodeMirror extension that adds Shift+Mod+Z keybinding for redo
 * Mod key is Cmd on Mac, Ctrl on other platforms
 * Using lowest precedence to avoid overriding existing keymaps
 */
export const customKeymap = Prec.lowest(keymap.of([
  {
    key: 'Shift-Mod-z',
    run: redo,
  },
]))
