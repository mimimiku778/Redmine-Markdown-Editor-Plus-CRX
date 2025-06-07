import { defineConfig, devices } from '@playwright/test'

// Get test configuration from environment variables or defaults
function getTestConfig() {
  const host = process.env.REDMINE_HOST || 'localhost';
  const port = process.env.REDMINE_PORT || '3001';
  return `http://${host}:${port}`;
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: getTestConfig(),
    trace: 'on-first-retry',
  },
  // Run setup tests first to establish authentication state
  testIgnore: /.*\.tmp$/,
  webServer: process.env.CI ? undefined : {
    command: 'npx http-server e2e/mocks -p 8080 --cors',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chrome-extension',
      testDir: './e2e',
      use: {
        // Use launchPersistentContext for extension support
        ...devices['Desktop Chrome']
      },
    },
  ],
})