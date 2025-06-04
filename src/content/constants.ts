import type { RedmineSelectors, OverlayConfig } from "./types"

export const REDMINE_SELECTORS: RedmineSelectors = {
  wikiEdit: "textarea.wiki-edit",
  jstBlock: ".jstBlock textarea",
  jstTabs: ".jstTabs, .tabs",
  tabElements: ".jstTabs .tab-elements, .tabs .tab-elements",
  previewTab: "a[onclick*=\"preview\"], a[href*=\"preview\"], .tab-preview",
  editTab: "a[onclick*=\"edit\"], a[href*=\"edit\"], .tab-edit",
}

export const OVERLAY_CONFIG: OverlayConfig = {
  minHeight: 200,
  backgroundColor: "white",
}

export const MARKDOWN_OVERLAY_ATTRIBUTE = "data-markdown-overlay"
export const SYNC_INTERVAL_MS = 500
export const CURSOR_SYNC_DELAY_MS = 10
