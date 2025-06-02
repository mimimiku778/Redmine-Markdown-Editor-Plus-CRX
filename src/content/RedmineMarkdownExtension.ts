import { RedmineService } from './services/RedmineService'
import { TextareaProcessor } from './services/TextareaProcessor'
import { DOMObserver } from './services/DOMObserver'

export class RedmineMarkdownExtension {
  constructor(
    private isInitialized = false,
    private redmineService: RedmineService = new RedmineService(),
    private textareaProcessor: TextareaProcessor = new TextareaProcessor(),
    private domObserver: DOMObserver = new DOMObserver((nodes) => this.handleNewNodes(nodes))
  ) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    // Check if this is a Redmine page
    if (!this.redmineService.isRedminePage()) {
      console.log('Not a Redmine page, skipping initialization')
      return
    }

    console.log('Initializing Redmine Markdown Extension')

    try {
      // Process existing textareas
      await this.processExistingTextareas()

      // Hide Redmine toolbars
      this.redmineService.hideToolbars()

      // Start observing for new textareas
      this.domObserver.start()

      this.isInitialized = true
      console.log('Redmine Markdown Extension initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Redmine Markdown Extension:', error)
    }
  }

  destroy(): void {
    if (!this.isInitialized) {
      return
    }

    console.log('Destroying Redmine Markdown Extension')

    this.domObserver.stop()
    // Note: TextareaProcessor cleanup would need to be implemented
    // if we want to support dynamic removal

    this.isInitialized = false
  }

  private async processExistingTextareas(): Promise<void> {
    const textareas = this.redmineService.findTextareas()
    console.log(`Found ${textareas.length} textareas to process`)

    for (const textarea of textareas) {
      try {
        this.textareaProcessor.process(textarea)
      } catch (error) {
        console.error('Failed to process textarea:', error, textarea)
      }
    }
  }

  private handleNewNodes(addedNodes: Node[]): void {
    // Debounce the processing to avoid excessive calls
    setTimeout(() => {
      this.processNewNodes(addedNodes)
    }, 100)
  }

  private processNewNodes(addedNodes: Node[]): void {
    const newTextareas: HTMLTextAreaElement[] = []

    addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return
      }

      const element = node as Element

      // Check if the added element is a jstBlock or contains textareas
      if (element.classList?.contains('jstBlock') || element.querySelector?.('.jstBlock')) {
        const jstTextareas = element.querySelectorAll(
          '.jstBlock textarea'
        ) as NodeListOf<HTMLTextAreaElement>
        newTextareas.push(...Array.from(jstTextareas))
      }

      // Check for wiki-edit textareas
      if (element.matches?.('textarea.wiki-edit')) {
        newTextareas.push(element as HTMLTextAreaElement)
      } else {
        const wikiTextareas = element.querySelectorAll?.(
          'textarea.wiki-edit'
        ) as NodeListOf<HTMLTextAreaElement>
        if (wikiTextareas) {
          newTextareas.push(...Array.from(wikiTextareas))
        }
      }
    })

    if (newTextareas.length > 0) {
      console.log(`Processing ${newTextareas.length} new textareas`)

      newTextareas.forEach((textarea) => {
        try {
          this.textareaProcessor.process(textarea)
        } catch (error) {
          console.error('Failed to process new textarea:', error, textarea)
        }
      })

      // Hide toolbars for any new elements
      this.redmineService.hideToolbars()
    }
  }
}
