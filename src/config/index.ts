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
  wikiEditClass: '.wiki-edit',
  wikiEdit: 'textarea.wiki-edit',
  jstBlockTextarea: '.jstBlock textarea',
  jstBlock: '.jstBlock',
  tabElements: '.tab-elements',
  box: '.box',
  filedroplistner: '.filedroplistner',
  note: '.note',
  controllerIssues: '.controller-issues',
  jstTabs: '.jstTabs',
  tabPreviewSelected: '.tab-preview.selected',
}

export const MARKDOWN_OVERLAY_ATTRIBUTE = 'data-markdown-overlay' as const
export const PROCESSED_ATTRIBUTE_VALUE = 'true' as const

export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']
