import MarkdownEditor from "@uiw/react-markdown-editor";
import { useState } from "react";

const code = `# title\n\nHello World!\n\n`;

export default function App() {
  const [markdownVal, setMarkdownVal] = useState(code);
  console.log("markdownVal:", markdownVal);
  return (
    <div>
      <h3>Auto</h3>
      <div className="App">
        <MarkdownEditor
          value={markdownVal}
          onChange={(value) => {
            setMarkdownVal(value);
          }}
        />
      </div>
      <h3>Light</h3>
      <div className="App" data-color-mode="light">
        <MarkdownEditor
          value={markdownVal}
          onChange={(value) => {
            setMarkdownVal(value);
          }}
        />
      </div>
      <h3>Dark</h3>
      <div className="App" data-color-mode="dark">
        <MarkdownEditor
          value={markdownVal}
          onChange={(value) => {
            setMarkdownVal(value);
          }}
        />
      </div>
    </div>
  );
}
