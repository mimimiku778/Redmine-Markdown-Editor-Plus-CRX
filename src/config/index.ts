export const CONFIG = {
  debug: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
  syncInterval: 500,
  cursorSyncDelay: 10,
  overlay: {
    minHeight: 200,
    backgroundColor: 'white',
  },
}

export const REDMINE_SELECTORS = {
  wikiEdit: 'textarea.wiki-edit',
  jstBlockTextarea: '.jstBlock textarea',
  jstBlock: '.jstBlock',
  tabElements: '.tab-elements',
}

export const MARKDOWN_OVERLAY_ATTRIBUTE = 'data-markdown-overlay' as const
export const PROCESSED_ATTRIBUTE_VALUE = 'true' as const
