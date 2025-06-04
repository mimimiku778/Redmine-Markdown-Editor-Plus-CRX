/**
 * Observe additions to the DOM subtree and invoke callback with added elements.
 * Returns a function to stop observing.
 */
export const observeDOM = (
  onNodesAdded: (addedNodes: Node[]) => void
): (() => void) => {
  const observer = new MutationObserver((mutations) => {
    const addedNodes: Node[] = []
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          addedNodes.push(node)
        }
      })
    })
    if (addedNodes.length > 0) {
      onNodesAdded(addedNodes)
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
  return () => observer.disconnect()
}
