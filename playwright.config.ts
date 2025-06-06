import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx http-server tests/e2e/mocks -p 8080 --cors',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chrome-extension',
      testDir: './tests/e2e',
      use: {
        // Use launchPersistentContext for extension support
        ...devices['Desktop Chrome']
      },
    },
  ],
})