import { test, expect, chromium, BrowserContext, Page } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'
import * as path from 'path'

test.describe('Redmine Markdown Editor Extension', () => {
  let context: BrowserContext
  let page: Page

  test.beforeAll(async () => {
    const extensionPath = path.resolve('./dist')
    console.log('Extension path:', extensionPath)

    const uniqueUserData = `/tmp/playwright-extension-${Date.now()}`

    context = await chromium.launchPersistentContext(uniqueUserData, {
      headless: false,
      args: [
        `--load-extension=${extensionPath}`,
        `--disable-extensions-except=${extensionPath}`,
        '--disable-web-security',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ],
    })

    page = await context.newPage()

    // Enable console logging for debugging
    page.on('console', (msg) => {
      console.log(`EXT LOG [${msg.type()}]:`, msg.text())
    })
    page.on('pageerror', (err) => {
      console.log('EXT ERROR:', err.message)
    })
  })

  test.afterAll(async () => {
    if (context) {
      await context.close()
    }
  })

  test('should enhance textareas on issue page', async () => {
    const page = await context.newPage()

    try {
      await loginAsAdmin(page)
      
      console.log('🎯 Navigating to issue page...')
      await page.goto('/issues/1', { waitUntil: 'domcontentloaded' })
      
      console.log('✏️ Clicking note edit button...')
      await page.locator('#note-1 > div.contextual > span > a.icon-only.icon-edit').click()
      
      console.log('📝 Clicking issue edit button...')
      await page.locator('#content > div:nth-child(1) > a.icon.icon-edit').click()
      
      console.log('🔧 Clicking all attributes link...')
      await page.locator('#all_attributes > p:nth-child(6) > a').click()
      
      console.log('🔍 Waiting for extension to process textareas...')
      await page.waitForTimeout(1000)
      
      const processedTextareas = await page
        .locator('textarea[data-markdown-overlay="true"]')
        .count()
      console.log('✅ Processed textareas count:', processedTextareas)
      expect(processedTextareas).toBe(3)
    } finally {
      await context.close()
    }
  })
})
