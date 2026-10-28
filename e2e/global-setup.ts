import {
  chromium,
  expect,
  type Browser,
  type FullConfig,
} from '@playwright/test'

import {
  TEST_PLANS,
  getTestCredentials,
  planStorageState,
} from './helpers/credentials'

/** Entra pela tela de login e grava a sessão em `storagePath`. */
async function login(
  browser: Browser,
  baseURL: string,
  email: string,
  password: string,
  storagePath: string,
) {
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

  // A tela de login chama router.refresh() ao montar, e a resposta do refresh
  // recria o formulário: o que foi preenchido antes dela some, e o envio sai
  // vazio ("Campo obrigatório"). Por isso preenche e envia de novo enquanto a
  // página continuar no login.
  const onLogin = () => new URL(page.url()).pathname.startsWith('/login')

  try {
    await expect(async () => {
      if (!onLogin()) return
      await page.getByLabel(/e-?mail/i).fill(email)
      await page.getByLabel(/senha/i).fill(password)
      await page.getByRole('button', { name: /entrar|login|acessar/i }).click()
      await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
        timeout: 10_000,
      })
    }).toPass({ timeout: 40_000 })
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

  await page.context().storageState({ path: storagePath })
  await page.context().close()
}

async function globalSetup(config: FullConfig) {
  // Pega a URL do projeto (que veio do E2E_BASE_URL no config) ou usa localhost
  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:3000'

  // Conta de smoke test — exigida via ambiente, sem fallback no repositório
  const { email, password } = getTestCredentials()

  console.log(`[E2E Setup] Autenticando em: ${baseURL} com ${email}`)

  const browser = await chromium.launch()

  try {
    await login(browser, baseURL, email, password, './e2e/.auth/user.json')

    // Uma sessão por plano com conta de teste (E2E_<PLANO>_EMAIL/PASSWORD),
    // para os testes de parede e de portão por plano. Sem a credencial, o
    // plano fica de fora e os testes dele são pulados.
    for (const plan of TEST_PLANS) {
      const credentials = getTestCredentials(plan)
      if (!credentials) {
        console.log(`[E2E Setup] Plano ${plan} sem credencial: pulado.`)
        continue
      }
      console.log(
        `[E2E Setup] Plano ${plan}: autenticando com ${credentials.email}`,
      )
      await login(
        browser,
        baseURL,
        credentials.email,
        credentials.password,
        planStorageState(plan),
      )
    }
  } finally {
    await browser.close()
  }
}

export default globalSetup
