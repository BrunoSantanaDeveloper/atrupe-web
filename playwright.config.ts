import { defineConfig, devices } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

// O Playwright não lê `.env` sozinho (diferente do Next). Sem isso, as credenciais
// exigidas em e2e/helpers/credentials.ts só funcionariam exportadas no shell.
loadEnvConfig(process.cwd())

export default defineConfig({
  testDir: './e2e',
  // Timeouts maiores para suportar latência de rede real (homolog)
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // 1 retry no CI (evita falha por flakiness de rede)
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  // Reporter rico no CI (GitHub Actions), lista simples local
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './e2e/global-setup.ts',
  outputDir: 'test-results/',
  use: {
    // Em CI aponta para homolog (E2E_BASE_URL), em dev aponta para localhost
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    storageState: './e2e/.auth/user.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Salva vídeo apenas em falha para debug visual
    video: 'retain-on-failure',
    navigationTimeout: 60_000,
    // Sem a barra da Vercel dos deploys de preview: com o user agent do Chrome
    // desktop ela abre um iframe e deixa um OPTIONS pendurado, e o
    // 'networkidle' nunca chega
    extraHTTPHeaders: { 'x-vercel-skip-toolbar': '1' },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
