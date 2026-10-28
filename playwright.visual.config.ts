import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://localhost:4173'

export default defineConfig({
  testDir: 'tests/visual',
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-visual' }]],
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' } },
  use: { baseURL, trace: 'retain-on-failure', locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', reducedMotion: 'reduce' },
  projects: [
    {
      name: 'w390',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: 'w768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'w1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: { command: 'pnpm preview', url: baseURL, reuseExistingServer: !process.env.CI, timeout: 60_000 },
})
