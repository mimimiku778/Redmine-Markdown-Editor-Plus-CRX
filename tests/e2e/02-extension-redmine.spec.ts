import { test, expect, chromium, BrowserContext, Page } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'
import { pasteImageFromClipboard, dragAndDropImage } from './helpers/clipboard'
import { compareImageWithLocalFile } from './helpers/image-comparison'
import * as path from 'path'

// Selector constants
const SELECTORS = {
  MD_EDITOR_CONTENT: '#add_notes .md-editor-content-editor',
} as const

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

  test('should enhance textareas with markdown overlay on issue page', async () => {
    const page = await context.newPage()

    try {
      await loginAsAdmin(page)

      console.log('🎯 Navigating to issue page...')
      await page.goto('/issues/1', { waitUntil: 'domcontentloaded' })

      console.log('✏️ Clicking note edit button...')
      await page.locator('a[href="/journals/1/edit"]').click()

      console.log('📝 Clicking issue edit button...')
      await page.locator('a[href="/issues/1/edit"]').first().click()

      console.log('🔧 Clicking all attributes link...')
      await page.locator('#all_attributes .icon.icon-edit').click()

      console.log('🔍 Waiting for extension to process textareas...')
      await page.waitForTimeout(1000)

      const processedTextareas = await page.locator('.md-editor').count()
      console.log('✅ Processed textareas count:', processedTextareas)
      expect(processedTextareas).toBe(3)
    } finally {
      await context.close()
    }
  })

  test('should support image paste and drag-and-drop in markdown editor', async () => {
    const page = await context.newPage()

    try {
      await loginAsAdmin(page)
      await page.goto('/issues/1', { waitUntil: 'domcontentloaded' })
      await page.locator('a[href="/issues/1/edit"]').first().click()
      await page.locator('#add_notes').getByRole('textbox').locator('div').click()

      console.log('🎯 Clicking on the editor area to focus it...')
      await page.locator(SELECTORS.MD_EDITOR_CONTENT).click()

      await pasteImageFromClipboard(page, './icons/icon-128.png')
      await page.keyboard.press('Enter')
      await dragAndDropImage(page, './icons/icon-128.png', SELECTORS.MD_EDITOR_CONTENT)

      await expect(page.locator(SELECTORS.MD_EDITOR_CONTENT)).toContainText('![](image.png)')
      await expect(page.locator(SELECTORS.MD_EDITOR_CONTENT)).toContainText('![](icon-128.png)')
      console.log('🖼️ Image pasted and dropped successfully.')

      await page.getByRole('button', { name: 'Submit' }).click()
      console.log('✅ Note submitted successfully.')

      console.log('🔍 Navigating to image links...')
      await page.getByRole('link', { name: 'image.png' }).first().click()
      await page.getByRole('link', { name: 'Bug #' }).click()
      await page.getByRole('link', { name: 'icon-128.png' }).first().click()
    } finally {
      await context.close()
    }
  })

  test('should switch between edit and preview tabs in markdown editor', async () => {
    test.setTimeout(120 * 1000) // Increase timeout for this test
    const page = await context.newPage()
    const testCount = 10

    try {
      await page.goto('/issues/1', { waitUntil: 'domcontentloaded' })
      await page.locator('a[href="/issues/1/edit"]').first().click()
      await page.locator('#add_notes').getByRole('textbox').locator('div').click()

      console.log('🎯 Clicking on the editor area to focus it...')
      await page.locator(SELECTORS.MD_EDITOR_CONTENT).click()

      // abcdefghijklmnopqrstuvwxyz を入力
      const text = 'abcdefghijklmnopqrstuvwxyz\n'
      for (let i = 0; i < testCount; i++) {
        await page.keyboard.type(text)

        await page.getByRole('link', { name: 'Preview' }).click()
        await page.getByRole('group', { name: 'Notes' }).getByRole('paragraph').click()

        await page.locator('#add_notes').getByRole('link', { name: 'Edit' }).click()
        await page.locator('.cm-line').last().click()
      }

      await page.getByRole('button', { name: 'Submit' }).click()
      await expect(page.getByText(text).first()).toBeVisible()
      console.log('✅ Note submitted successfully.')

      await page.pause()
    } finally {
      await context.close()
    }
  })
})
