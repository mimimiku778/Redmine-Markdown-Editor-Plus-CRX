import type { ExtensionConfig, RedmineSelectors } from '../types'

export const CONFIG: ExtensionConfig = {
  debug: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
  syncInterval: 500,
  cursorSyncDelay: 10,
  overlay: {
    minHeight: 200,
    backgroundColor: 'white',
  },
}

export const REDMINE_SELECTORS: RedmineSelectors = {
  wikiEdit: 'textarea.wiki-edit',
  jstBlockTextarea: '.jstBlock textarea',
  jstTabs: '.jstTabs, .tabs',
  jstBlock: '.jstBlock',

}

export const MARKDOWN_OVERLAY_ATTRIBUTE = 'data-markdown-overlay' as const
export const PROCESSED_ATTRIBUTE_VALUE = 'true' as const
