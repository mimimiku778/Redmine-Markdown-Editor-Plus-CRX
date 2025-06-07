import { test, expect, chromium, BrowserContext, Page } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'
import { REDMINE_SELECTORS } from '../../src/config/index'

test.describe('Redmine Setup Prerequisites Verification', () => {
  let context: BrowserContext
  let page: Page

  test.beforeAll(async () => {
    const uniqueUserData = `/tmp/playwright-redmine-setup-${Date.now()}`

    context = await chromium.launchPersistentContext(uniqueUserData, {
      headless: !!process.env.CI,
    })

    page = await context.newPage()

    // Enable console logging
    page.on('console', (msg) => {
      console.log(`SETUP LOG [${msg.type()}]:`, msg.text())
    })
    page.on('pageerror', (err) => {
      console.log('SETUP ERROR:', err.message)
    })
  })

  test.afterAll(async () => {
    if (context) {
      await context.close()
    }
  })

  test('Login as admin and verify selectors', async () => {
    await loginAsAdmin(page)

    console.log('🎯 Verifying extension selectors on issue page...')
    await page.goto('/issues/1', { waitUntil: 'domcontentloaded' })

    const selectors = await page.evaluate((redmineSelectors) => {
      const result: Record<string, number> = {}
      for (const [key, selector] of Object.entries(redmineSelectors)) {
        result[key] = document.querySelectorAll(selector).length
      }
      return {
        ...result,
        journals: document.querySelectorAll('.journal').length,
      }
    }, REDMINE_SELECTORS)

    console.log('📊 Extension selectors check:', selectors)

    for (const [key, count] of Object.entries(selectors)) {
      expect(count).toBeGreaterThan(0)
    }
    console.log('✅ Extension selectors verified')
    console.log('🎉 SETUP COMPLETE: Ready for extension testing')
  })
})
