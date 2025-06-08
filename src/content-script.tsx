import { initialize } from './content/RedmineMarkdownExtension'
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
