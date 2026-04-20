import { chromium, type FullConfig } from '@playwright/test'

const TEST_EMAIL = 'contato.atori@gmail.com'
const TEST_PASSWORD = 'Atrupe123@'

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto('http://localhost:3000/login')
  await page.getByLabel(/e-?mail/i).fill(TEST_EMAIL)
  await page.getByLabel(/senha/i).fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /entrar|login|acessar/i }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 })

  // Wait a bit for session to stabilize
  await page.waitForTimeout(2000)

  await page.context().storageState({ path: './e2e/.auth/user.json' })
  await browser.close()
}

export default globalSetup
