import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Image, Parent, HTML } from 'mdast'

/**
 * Remark plugin to hide relative path images in preview
 * Prevents broken image displays until proper attachment URLs are resolved
 */
const remarkHideRelativeImages: Plugin = () => {
  return (tree) => {
    visit(tree, 'image', (node: Image, index, parent) => {
      if (!node.url) return

      // Check if the image URL is a relative path
      const isRelativePath =
        !node.url.startsWith('http') && !node.url.startsWith('/') && !node.url.startsWith('data:')

      if (isRelativePath) {

        // Replace image node with a visual placeholder
        if (parent && typeof index === 'number' && 'children' in parent) {
          const placeholder: HTML = {
            type: 'html',
            value: `<div style="
              border: 2px dashed #ccc;
              border-radius: 4px;
              padding: 20px;
              margin: 10px 0;
              text-align: center;
              background-color: #f9f9f9;
              color: #666;
              font-family: monospace;
              display: inline-block;
              min-width: 200px;
            ">
              <div style="font-size: 24px; margin-bottom: 8px;">🖼️</div>
              <div style="font-weight: bold;">Image: ${node.alt || node.url}</div>
              <div style="font-size: 12px; margin-top: 4px; opacity: 0.7;">
                (Attachment not yet available in preview)
              </div>
            </div>`,
          }

          // Replace the image node with placeholder
          ;(parent as Parent).children[index] = placeholder
        }
      }
    })
  }
}

export default remarkHideRelativeImages
