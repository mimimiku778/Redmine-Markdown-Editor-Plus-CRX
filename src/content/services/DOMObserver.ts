import type { IDOMObserver } from '../types'

export class DOMObserver implements IDOMObserver {
  constructor(
    private onNodesAdded: (addedNodes: Node[]) => void,
    private observer: MutationObserver | null = null
  ) {}

  start(): void {
    if (this.observer) {
      this.stop()
    }

    this.observer = new MutationObserver((mutations) => {
      const addedNodes: Node[] = []

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            addedNodes.push(node)
          }
        })
      })

      if (addedNodes.length > 0) {
        this.onNodesAdded(addedNodes)
      }
    })

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}
