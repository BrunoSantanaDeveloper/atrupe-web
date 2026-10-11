import { defineConfig, devices } from '@playwright/test'

// Suíte da fronteira do mock (e2e/fronteira.spec.ts): o build SEM a flag de
// demonstração, servido no próprio computador ou runner, com uma API de
// mentira e uma sessão de teste com todas as chaves de plano. Não depende de
// homolog nem de conta de teste, por isso pode barrar o deploy de produção.
//
//   NEXT_PUBLIC_DEMO_DATA=off NEXT_PUBLIC_REVIEW_MARKS=off AUTH_SECRET=<qualquer> API_URL=http://localhost:9999 npx next build
//   AUTH_SECRET=<o mesmo> npx playwright test -c playwright.fronteira.config.ts
//
// O build precisa já existir: a config sobe o `next start` dele.
const PORT = Number(process.env.FRONTEIRA_PORT || 3100)
const API_PORT = Number(process.env.STUB_API_PORT || 9999)

// A suíte confere que roda por esta config (sessão com todas as chaves)
process.env.FRONTEIRA_FULL_SESSION = '1'
process.env.FRONTEIRA_STUB_API = '1'

export default defineConfig({
  testDir: './e2e',
  testMatch: /fronteira\.spec\.ts$/,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : 'list',
  globalSetup: './e2e/fronteira/global-setup.ts',
  outputDir: 'test-results/fronteira',
  use: {
    baseURL: `http://localhost:${PORT}`,
    storageState: './e2e/.auth/fronteira-full.json',
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'node e2e/fronteira/stub-api.mjs',
      port: API_PORT,
      reuseExistingServer: false,
      env: { STUB_API_PORT: String(API_PORT) },
    },
    {
      command: `npx next start -p ${PORT}`,
      port: PORT,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        API_URL: `http://localhost:${API_PORT}`,
        NEXT_PUBLIC_APP_URL: `http://localhost:${PORT}`,
        AUTH_TRUST_HOST: 'true',
      },
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
