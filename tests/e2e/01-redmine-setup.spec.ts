import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test'

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

  test('Verify Redmine is accessible and ready for extension testing', async () => {
    console.log('🌐 Step 1: Verifying Redmine home page access...')
    
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    
    // Verify we can access Redmine without authentication
    const hasRedmineHeader = await page.locator('#header').isVisible().catch(() => false)
    expect(hasRedmineHeader).toBe(true)
    console.log('✅ Step 1 Complete: Redmine accessible without authentication')
    
    console.log('📄 Step 2: Verifying test issue exists and is accessible...')
    
    await page.goto('/issues/1', { waitUntil: 'domcontentloaded' })
    
    // Verify issue page loads
    const isIssuePage = await page.locator('.controller-issues').isVisible().catch(() => false)
    expect(isIssuePage).toBe(true)
    
    // Check issue title
    const issueSubject = await page.locator('.subject h3').textContent()
    expect(issueSubject).toContain('Test Issue for Markdown Editor Extension')
    console.log('✅ Step 2 Complete: Test issue accessible')
    
    console.log('🎯 Step 3: Final extension prerequisites verification...')
    
    const prerequisites = await page.evaluate(() => {
      return {
        hasRedmineIndicators: !!(
          document.querySelector('#header') ||
          document.querySelector('.controller-issues') ||
          document.querySelector('.controller-wiki') ||
          document.querySelector('textarea.wiki-edit')
        ),
        isIssuePage: !!document.querySelector('.controller-issues'),
        hasTextareas: document.querySelectorAll('textarea').length > 0,
        totalTextareas: document.querySelectorAll('textarea').length,
        wikiEditTextareas: document.querySelectorAll('textarea.wiki-edit').length,
        jstBlockTextareas: document.querySelectorAll('.jstBlock textarea').length,
        hasJournals: document.querySelectorAll('.journal').length > 0,
        hasLoginForm: !!document.querySelector('#login-form')
      }
    })
    
    console.log('📊 Final prerequisites check:', prerequisites)
    
    expect(prerequisites.hasRedmineIndicators).toBe(true)
    expect(prerequisites.isIssuePage).toBe(true)
    expect(prerequisites.hasLoginForm).toBe(false) // Should be false since auth is disabled
    
    console.log('✅ Step 3 Complete: All extension prerequisites verified')
    console.log('')
    console.log('🎉 REDMINE SETUP VERIFICATION COMPLETE!')
    console.log('🚀 All prerequisites met for extension testing in 02-extension-redmine.spec.ts')
    console.log('')
    console.log('Prerequisites Summary:')
    console.log(`  - Redmine accessible: ✅`)
    console.log(`  - Authentication disabled: ✅`)
    console.log(`  - Issue access: ✅`)
    console.log(`  - Total textareas found: ${prerequisites.totalTextareas}`)
    console.log(`  - Has journals: ${prerequisites.hasJournals ? '✅' : '⚠️'}`)
  })
})