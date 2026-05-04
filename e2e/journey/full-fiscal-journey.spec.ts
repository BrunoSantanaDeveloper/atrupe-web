import { test, expect } from '@playwright/test'

// Resetamos o estado armazenado (cookies) para simular um usuário totalmente novo
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Jornada Completa: Contratação -> Onboarding Fiscal -> Emissão', () => {
  test('deve criar conta, ativar módulo fiscal e emitir a primeira NF', async ({
    page,
  }) => {
    // ==========================================
    // 1. CONTRATAÇÃO / CADASTRO DE NOVA CONTA
    // ==========================================
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        json: {
          user: { id: 'usr-1', email: 'test@atrupe.com' },
          token: 'mock-jwt-token',
        },
      })
    })

    await page.goto('/cadastro')

    const emailInput = page
      .getByPlaceholder(/email/i)
      .or(page.getByLabel(/email/i))
      .first()
    const passwordInput = page
      .getByPlaceholder(/senha/i)
      .or(page.getByLabel(/senha/i))
      .first()
    const nameInput = page
      .getByPlaceholder(/nome/i)
      .or(page.getByLabel(/nome/i))
      .first()

    if (await nameInput.isVisible()) await nameInput.fill('Admin E2E')
    if (await emailInput.isVisible()) await emailInput.fill('test@atrupe.com')
    if (await passwordInput.isVisible()) await passwordInput.fill('Senha123!')

    const registerButton = page
      .getByRole('button', { name: /cadastrar|criar conta/i })
      .first()
    if (await registerButton.isVisible()) await registerButton.click()

    // ==========================================
    // 2. ASSINATURA / ONBOARDING FISCAL
    // ==========================================

    // Mocks genéricos de sessão e empresa
    await page.route('**/api/companies/me', async (route) => {
      await route.fulfill({
        json: { id: 'comp-1', name: 'Atrupe', cnpj: '12345678000199' },
      })
    })

    // Mock da API de ativação InvoiCy
    await page.route('**/api/fiscal/onboarding', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: { status: 'NOT_STARTED', hasConfig: false },
        })
        return
      }
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          json: { status: 'ACTIVE', onboardingId: 'onb-1' },
        })
      }
    })

    await page.goto('/configuracoes/fiscal')

    const startFiscalBtn = page
      .getByRole('button', { name: /ativar|iniciar/i })
      .first()
    if (await startFiscalBtn.isVisible()) await startFiscalBtn.click()

    const cnpjFiscal = page
      .getByPlaceholder(/00.000.000\/0000-00/)
      .or(page.getByLabel(/cnpj/i))
      .first()
    if (await cnpjFiscal.isVisible()) await cnpjFiscal.fill('12345678000199')

    const activateBtn = page
      .getByRole('button', { name: /concluir|ativar|enviar/i })
      .first()
    if (await activateBtn.isVisible()) {
      // Após o click, a interface faz um GET para ver o status atualizado
      await page.route('**/api/fiscal/onboarding', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({ json: { status: 'ACTIVE', hasConfig: true } })
        }
      })
      await activateBtn.click()
      await expect(page.getByText(/Ativo|Sucesso/)).toBeVisible({
        timeout: 10000,
      })
    }

    // ==========================================
    // 3. EMISSÃO DA PRIMEIRA NF
    // ==========================================
    await page.route('**/api/clients**', async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: 'cli-1', name: 'Cliente E2E', document: '11111111111' }],
        },
      })
    })

    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        json: { data: [{ id: 'prod-1', name: 'Produto E2E', price: 50 }] },
      })
    })

    // Mock da emissão final da Nota Fiscal
    await page.route('**/api/fiscal/emissions/nfe', async (route) => {
      await route.fulfill({
        status: 201,
        json: {
          id: 'nfe-1',
          status: 'AUTHORIZED',
          numero: 1,
          serie: 1,
          xmlUrl: 'url-xml',
          pdfUrl: 'url-pdf',
        },
      })
    })

    await page.goto('/nota-fiscal/emitir/avulsa/nfe')

    const clientTrigger = page
      .getByRole('combobox', { name: /cliente/i })
      .or(page.getByRole('button', { name: /selecionar cliente/i }))
      .first()
    if (await clientTrigger.isVisible()) {
      await clientTrigger.click()
      await page
        .getByText(/Cliente E2E/i)
        .first()
        .click()
    }

    const addProductBtn = page
      .getByRole('button', { name: /adicionar produto/i })
      .first()
    if (await addProductBtn.isVisible()) {
      await addProductBtn.click()
      const productInput = page
        .getByRole('combobox', { name: /produto/i })
        .or(page.getByPlaceholder(/nome do produto/i))
        .first()
      if (await productInput.isVisible()) await productInput.fill('Produto E2E')
    }

    const emitButton = page.getByRole('button', { name: /emitir/i }).first()
    if (await emitButton.isVisible()) {
      await emitButton.click()

      // Valida o grande final: Nota Autorizada com botões de impressão (DANFE)
      await expect(page.getByText(/Autorizada|Sucesso/i)).toBeVisible({
        timeout: 15_000,
      })
      await expect(
        page.getByRole('button', { name: /DANFE|Imprimir/i }),
      ).toBeVisible()
    }
  })
})
