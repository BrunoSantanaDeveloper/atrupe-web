import { chromium, type FullConfig } from '@playwright/test'

import { getTestCredentials } from './helpers/credentials'

async function globalSetup(config: FullConfig) {
  // Pega a URL do projeto (que veio do E2E_BASE_URL no config) ou usa localhost
  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:3000'

  // Conta de smoke test — exigida via ambiente, sem fallback no repositório
  const { email, password } = getTestCredentials()

  console.log(`[E2E Setup] Autenticando em: ${baseURL} com ${email}`)

  const browser = await chromium.launch()
  const page = await browser.newPage()

  const response = await page.goto(`${baseURL}/login`)

  // Sem esta checagem, um ambiente fora do ar falha 30s depois com "locator.fill
  // timeout", escondendo a causa real (deployment inexistente, URL do backend, etc.)
  if (!response || !response.ok()) {
    const status = response?.status() ?? 'sem resposta'
    const body = await page
      .evaluate(() => document.body.innerText)
      .catch(() => '')
    throw new Error(
      `[E2E Setup] ${baseURL}/login retornou ${status}. ` +
        `Verifique se o ambiente está no ar e se E2E_BASE_URL aponta para o front-end ` +
        `(e não para a API). Resposta: ${body.substring(0, 200)}`,
    )
  }

  await page.getByLabel(/e-?mail/i).fill(email)
  await page.getByLabel(/senha/i).fill(password)
  await page.getByRole('button', { name: /entrar|login|acessar/i }).click()

  try {
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 30_000,
    })
  } catch (error) {
    console.error(
      '[E2E Setup] Falha no redirecionamento. O login pode ter falhado.',
    )
    await page.screenshot({ path: './e2e/.auth/login-failure.png' })
    const bodyText = await page.evaluate(() => document.body.innerText)
    console.error(`[E2E Setup] Texto da tela: ${bodyText.substring(0, 300)}...`)
    throw error
  }

  // Wait a bit for session to stabilize
  await page.waitForTimeout(2000)

  await page.context().storageState({ path: './e2e/.auth/user.json' })
  await browser.close()
}

export default globalSetup
