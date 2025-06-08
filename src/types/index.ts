// Core types for the extension
export interface ExtensionConfig {
  debug: boolean
  syncInterval: number
  cursorSyncDelay: number
  overlay: {
    minHeight: number
    backgroundColor: string
  }
}

export interface ProcessedTextarea {
  textarea: HTMLTextAreaElement
  wrapper: HTMLDivElement
  root: import('react-dom/client').Root
}

export interface DOMObserverOptions {
  selector?: string
  childList?: boolean
  subtree?: boolean
  attributes?: boolean
  attributeFilter?: string[]
}

export type DOMObserverCallback = (addedNodes: Node[]) => void

export interface RedmineSelectors {
  wikiEdit: string
  jstBlock: string
  jstTabs: string
  tabElements: string
  previewTab: string
  editTab: string
}

export interface MarkdownCommand {
  name: string
  icon?: React.ReactNode
  execute?: (state: unknown, api: unknown) => void
  keyCommand?: string
  buttonProps?: Record<string, unknown>
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface Logger {
  debug: (message: string, ...args: unknown[]) => void
  info: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
  error: (message: string, error?: unknown) => void
}

// Error types
export class ExtensionError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message)
    this.name = 'ExtensionError'
  }
}

export class InitializationError extends ExtensionError {
  constructor(message: string) {
    super(message, 'INIT_ERROR')
  }
}

export class DOMError extends ExtensionError {
  constructor(message: string) {
    super(message, 'DOM_ERROR')
  }
}
