import MarkdownEditor from '@uiw/react-markdown-editor'
import { useState } from 'react'
import { ulist } from './commands/ulist'
import { olist } from './commands/olist'
import type { Commands } from '@uiw/react-markdown-editor/cjs/components/ToolBar'
import remarkBreaks from 'remark-breaks'
import './App.css'

const code = `# title\n\nHello World!\n\n`

export default function App() {
  const [markdownVal, setMarkdownVal] = useState(code)
  console.log('markdownVal:', markdownVal)

  const customCommands: Commands[] = [
    'bold',
    'italic',
    'underline',
    'strike',
    'code',
    'header',
    ulist,
    olist,
    'todo',
    'quote',
    'codeBlock',
    'link',
    'image',
  ]

  return (
    <div className="App">
      <MarkdownEditor
        value={markdownVal}
        onChange={(value) => {
          setMarkdownVal(value)
        }}
        toolbars={customCommands}
        previewProps={{
          remarkPlugins: [remarkBreaks],
        }}
        style={{
          fontSize: '16px',
        }}
      />
    </div>
  )
}
