import { initialize, destroy } from './content/RedmineMarkdownExtension'
import './index.css'

// Initialize the extension when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initialize())
} else {
  // DOM is already loaded
  initialize()
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => destroy())

// Handle navigation in SPAs
let currentUrl = window.location.href
const checkForNavigation = () => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href
    // Re-initialize after navigation
    setTimeout(() => {
      initialize()
    }, 500)
  }
}

// Check for URL changes periodically (for SPAs without proper navigation events)
setInterval(checkForNavigation, 1000)