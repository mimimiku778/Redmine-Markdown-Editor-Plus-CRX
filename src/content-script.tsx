import { RedmineMarkdownExtension } from './content/RedmineMarkdownExtension'
import './index.css'

// Create and initialize the extension
const extension = new RedmineMarkdownExtension()

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    extension.initialize()
  })
} else {
  // DOM is already loaded
  extension.initialize()
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  extension.destroy()
})

// Handle navigation in SPAs
let currentUrl = window.location.href
const checkForNavigation = () => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href
    // Re-initialize after navigation
    setTimeout(() => {
      extension.initialize()
    }, 500)
  }
}

// Check for URL changes periodically (for SPAs without proper navigation events)
setInterval(checkForNavigation, 1000)