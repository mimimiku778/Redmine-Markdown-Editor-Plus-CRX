import type { ExtensionConfig, RedmineSelectors } from '../types'

export const CONFIG: ExtensionConfig = {
  debug: import.meta?.env?.DEV || false,
  syncInterval: 500,
  cursorSyncDelay: 10,
  overlay: {
    minHeight: 200,
    backgroundColor: 'white',
  },
}

export const REDMINE_SELECTORS: RedmineSelectors = {
  wikiEdit: 'textarea.wiki-edit',
  jstBlock: '.jstBlock textarea',
  jstTabs: '.jstTabs, .tabs',
  tabElements: '.jstTabs .tab-elements, .tabs .tab-elements',
  previewTab: 'a[onclick*="preview"], a[href*="preview"], .tab-preview',
  editTab: 'a[onclick*="edit"], a[href*="edit"], .tab-edit',
}

export const MARKDOWN_OVERLAY_ATTRIBUTE = 'data-markdown-overlay' as const
export const PROCESSED_ATTRIBUTE_VALUE = 'true' as const
