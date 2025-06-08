import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import type { Root, Paragraph, Parent, Html } from 'mdast'
import type { Plugin } from 'unified'

const remarkCollapse: Plugin<[], Root> = () => {
  return (tree: Root) => {
    console.log('remarkCollapse:', tree)
    visit(tree, 'paragraph', (node: Paragraph, index?: number, parent?: Parent) => {
      if (!parent || typeof index !== 'number' || !('children' in parent)) return

      const text = toString(node).trim()
      const match = text.match(/^{{collapse(?:\((.*?)\))?$/)
      if (!match) return

      const title = match[1] || 'Show'
      const startIndex = index

      const bodyNodes = []
      let endIndex = -1

      for (let i = startIndex + 1; i < parent.children.length; i++) {
        const current = parent.children[i]
        const curText = toString(current).trim()
        if (curText === '}}') {
          endIndex = i
          break
        }
        bodyNodes.push(current)
      }

      if (endIndex === -1) return

      const bodyHtml = bodyNodes.map((n) => `<p>${toString(n)}</p>`).join('\n')

      const htmlNode: Html = {
        type: 'html',
        value: `<details><summary>${title}</summary>\n${bodyHtml}\n</details>`,
      }

      parent.children.splice(startIndex, endIndex - startIndex + 1, htmlNode)
    })
  }
}

export default remarkCollapse
