// Background service worker for Chrome extension
// This prevents timeout issues in CI environments

declare const chrome: any

if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log('Redmine Markdown Editor extension installed')
  })

  // Keep service worker alive
  chrome.runtime.onMessage.addListener((_request: any, _sender: any, _sendResponse: any) => {
    // Handle any messages if needed
    return true
  })
}