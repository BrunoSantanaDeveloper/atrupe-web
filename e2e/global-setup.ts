import { chromium, type FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  // Pega a URL do projeto (que veio do E2E_BASE_URL no config) ou usa localhost
  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:3000'
  
  // Usa variáveis de ambiente para a conta de smoke test, fallback para a de dev local
  const email = process.env.E2E_USER_EMAIL ?? 'contato.atori@gmail.com'
  const password = process.env.E2E_USER_PASSWORD ?? 'Atrupe123@'

  console.log(`[E2E Setup] Autenticando em: ${baseURL} com ${email}`)

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${baseURL}/login`)
  await page.getByLabel(/e-?mail/i).fill(email)
  await page.getByLabel(/senha/i).fill(password)
  await page.getByRole('button', { name: /entrar|login|acessar/i }).click()
  
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 })

  // Wait a bit for session to stabilize
  await page.waitForTimeout(2000)

  await page.context().storageState({ path: './e2e/.auth/user.json' })
  await browser.close()
}

export default globalSetup
