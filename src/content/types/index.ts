export interface TextareaInfo {
  element: HTMLTextAreaElement
  isProcessed: boolean
}

export interface TabState {
  isPreviewMode: boolean
  tabsContainer: Element | null
}

export interface DragState {
  isDragging: boolean
  cursorPosition: number
}

export interface OverlayConfig {
  minHeight: number
  backgroundColor: string
}

export interface RedmineSelectors {
  wikiEdit: string
  jstBlock: string
  jstTabs: string
  tabElements: string
  previewTab: string
  editTab: string
}

export interface ITextareaProcessor {
  canProcess(textarea: HTMLTextAreaElement): boolean
  process(textarea: HTMLTextAreaElement): void
  cleanup?(textarea: HTMLTextAreaElement): void
}

export interface IDOMObserver {
  start(): void
  stop(): void
}

export interface IRedmineService {
  findTextareas(): HTMLTextAreaElement[]
  hideToolbars(): void
  isRedminePage(): boolean
}