import { initialize, destroy } from './content/RedmineMarkdownExtension'
import { logger } from './utils/logger'
import './index.css'

// Initialize the extension when ready
async function initExtension(): Promise<void> {
  try {
    await initialize()
  } catch (error) {
    logger.error('Failed to initialize extension', error)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension)
} else {
  // DOM is already loaded
  initExtension()
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  try {
    destroy()
  } catch (error) {
    logger.error('Error during cleanup', error)
  }
})

// Handle navigation in SPAs
let currentUrl = window.location.href
const NAVIGATION_CHECK_INTERVAL = 1000
const REINIT_DELAY = 500

async function checkForNavigation(): Promise<void> {
  if (window.location.href !== currentUrl) {
    const oldUrl = currentUrl
    currentUrl = window.location.href

    logger.info(`Navigation detected: ${oldUrl} -> ${currentUrl}`)

    // Clean up and re-initialize after navigation
    try {
      destroy()
      setTimeout(async () => {
        await initExtension()
      }, REINIT_DELAY)
    } catch (error) {
      logger.error('Error handling navigation', error)
    }
  }
}

// Check for URL changes periodically (for SPAs without proper navigation events)
setInterval(checkForNavigation, NAVIGATION_CHECK_INTERVAL)

// Also listen for popstate events
window.addEventListener('popstate', checkForNavigation)
