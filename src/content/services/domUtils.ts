import { logger } from '../../utils/logger'

export function findTextareas(selectors: string[]): HTMLTextAreaElement[] {
  try {
    const textareas = new Set<HTMLTextAreaElement>()

    for (const selector of selectors) {
      const elements = document.querySelectorAll<HTMLTextAreaElement>(selector)
      elements.forEach((el) => textareas.add(el))
    }

    logger.debug(`Found ${textareas.size} unique textareas`)
    return Array.from(textareas)
  } catch (error) {
    logger.error('Failed to find textareas', error)
    return []
  }
}
