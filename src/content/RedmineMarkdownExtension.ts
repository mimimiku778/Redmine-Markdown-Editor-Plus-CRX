import { isRedminePage, findTextareas, hideToolbars, processTextarea, cleanupAll, observeDOM } from './services'

// Module-scoped state
let initialized = false
let stopObserver: (() => void) | null = null

/** Initialize the Redmine Markdown Extension */
export const initialize = async (): Promise<void> => {
  if (initialized) return
  if (!isRedminePage()) {
    console.log('Not a Redmine page, skipping initialization')
    return
  }
  console.log('Initializing Redmine Markdown Extension')
  try {
    // Process existing textareas
    const textareas = findTextareas()
    console.log(`Found ${textareas.length} textareas to process`)
    textareas.forEach(processTextarea)
    // Hide toolbars
    hideToolbars()
    // Observe future textareas
    stopObserver = observeDOM((nodes) => {
      setTimeout(() => handleNewNodes(nodes), 100)
    })
    initialized = true
    console.log('Redmine Markdown Extension initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Redmine Markdown Extension:', error)
  }
}

/** Destroy the extension and cleanup overlays */
export const destroy = (): void => {
  if (!initialized) return
  console.log('Destroying Redmine Markdown Extension')
  stopObserver?.()
  cleanupAll()
  initialized = false
}

// Handle new DOM nodes by processing new textareas
const handleNewNodes = (addedNodes: Node[]): void => {
  const newTextareas: HTMLTextAreaElement[] = []
  addedNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as Element
    // jstBlock textareas
    if (el.classList.contains('jstBlock') || el.querySelector('.jstBlock')) {
      newTextareas.push(
        ...Array.from(
          el.querySelectorAll<HTMLTextAreaElement>('.jstBlock textarea')
        )
      )
    }
    // wiki-edit textareas
    if (el.matches('textarea.wiki-edit')) {
      newTextareas.push(el as HTMLTextAreaElement)
    } else {
      newTextareas.push(
        ...Array.from(
          el.querySelectorAll<HTMLTextAreaElement>('textarea.wiki-edit')
        )
      )
    }
  })
  if (newTextareas.length > 0) {
    console.log(`Processing ${newTextareas.length} new textareas`)
    newTextareas.forEach(processTextarea)
    hideToolbars()
  }
}
