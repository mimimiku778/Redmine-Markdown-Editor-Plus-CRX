import { Page, expect } from '@playwright/test'

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  console.log('🔐 Logging in as admin...')

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // Navigate to login page
  await page.click('a[href="/login"]')
  
  // Login with admin credentials
  await page.fill('#username', 'admin')
  await page.fill('#password', process.env.REDMINE_ADMIN_PASSWORD || 'admin123')
  await page.click('input[type="submit"]')

  // Verify login success
  await expect(page.locator('#loggedas')).toBeVisible()
  console.log('✅ Admin login successful')
}