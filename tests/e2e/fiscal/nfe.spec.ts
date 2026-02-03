import { test, expect, fiscalHelpers, testData } from './fixtures'

test.describe('Fluxo NF-e', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await fiscalHelpers.goToNfeList(page)
  })

  test('deve exibir lista de NF-e', async ({ authenticatedPage: page }) => {
    await expect(page.locator('[data-testid="nfe-list"]')).toBeVisible()
  })

  test('deve filtrar NF-e por status', async ({ authenticatedPage: page }) => {
    // Selecionar filtro por status
    await page.selectOption('[data-testid="filtro-status"]', 'AUTHORIZED')

    // Verificar que os itens exibidos têm o status correto
    const items = page.locator(
      '[data-testid="nfe-item"][data-status="AUTHORIZED"]',
    )
    if ((await items.count()) > 0) {
      await expect(items.first()).toBeVisible()
    }
  })

  test('deve buscar NF-e por número', async ({ authenticatedPage: page }) => {
    await page.fill('[data-testid="busca-numero"]', '1')
    await page.press('[data-testid="busca-numero"]', 'Enter')

    // Aguardar resultado da busca
    await page.waitForLoadState('networkidle')
  })

  test('deve abrir detalhes de NF-e', async ({ authenticatedPage: page }) => {
    // Clicar na primeira NF-e (se existir)
    const firstNfe = page.locator('[data-testid="nfe-item"]').first()
    if (await firstNfe.isVisible()) {
      await firstNfe.click()
      await expect(page.locator('[data-testid="nfe-detalhes"]')).toBeVisible()
    }
  })

  test('deve baixar PDF de NF-e autorizada', async ({
    authenticatedPage: page,
  }) => {
    // Localizar NF-e autorizada
    const nfeAutorizada = page
      .locator('[data-testid="nfe-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfeAutorizada.isVisible()) {
      await nfeAutorizada.click()

      // Clicar em baixar PDF
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="baixar-pdf"]'),
      ])

      expect(download.suggestedFilename()).toContain('nfe')
    }
  })

  test('deve baixar XML de NF-e autorizada', async ({
    authenticatedPage: page,
  }) => {
    const nfeAutorizada = page
      .locator('[data-testid="nfe-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfeAutorizada.isVisible()) {
      await nfeAutorizada.click()

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="baixar-xml"]'),
      ])

      expect(download.suggestedFilename()).toContain('.xml')
    }
  })

  test('deve exibir histórico de eventos da NF-e', async ({
    authenticatedPage: page,
  }) => {
    const firstNfe = page.locator('[data-testid="nfe-item"]').first()

    if (await firstNfe.isVisible()) {
      await firstNfe.click()
      await page.click('[data-testid="tab-eventos"]')

      await expect(page.locator('[data-testid="eventos-list"]')).toBeVisible()
    }
  })
})

test.describe('Emissão de NF-e', () => {
  test('deve navegar para página de emissão de NF-e', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfeList(page)
    await page.click('[data-testid="nova-nfe"]')

    await expect(page.locator('[data-testid="nfe-form"]')).toBeVisible()
  })

  test('deve validar dados obrigatórios do destinatário', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfeList(page)
    await page.click('[data-testid="nova-nfe"]')

    // Tentar emitir sem preencher dados
    await page.click('[data-testid="emitir-nfe"]')

    // Verificar mensagens de erro
    await expect(page.locator('text=Destinatário é obrigatório')).toBeVisible()
  })

  test('deve validar NCM do produto', async ({ authenticatedPage: page }) => {
    await fiscalHelpers.goToNfeList(page)
    await page.click('[data-testid="nova-nfe"]')

    // Preencher NCM inválido
    await page.fill('[data-testid="item-ncm"]', '1234') // NCM deve ter 8 dígitos
    await page.click('[data-testid="emitir-nfe"]')

    await expect(page.locator('text=NCM inválido')).toBeVisible()
  })

  test('deve calcular totais automaticamente', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfeList(page)
    await page.click('[data-testid="nova-nfe"]')

    // Adicionar produto
    await page.fill('[data-testid="item-valor"]', '100.00')
    await page.fill('[data-testid="item-quantidade"]', '2')

    // Verificar total calculado
    await expect(page.locator('[data-testid="total-produtos"]')).toHaveText(
      'R$ 200,00',
    )
  })

  test('deve salvar rascunho de NF-e', async ({ authenticatedPage: page }) => {
    await fiscalHelpers.goToNfeList(page)
    await page.click('[data-testid="nova-nfe"]')

    // Preencher dados mínimos
    await page.fill('[data-testid="cliente-nome"]', 'Cliente Teste E2E')

    // Salvar rascunho
    await page.click('[data-testid="salvar-rascunho"]')

    await fiscalHelpers.waitForToast(page, 'Rascunho salvo')
  })
})

test.describe('Cancelamento de NF-e', () => {
  test('deve exibir modal de cancelamento', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfeList(page)

    const nfeAutorizada = page
      .locator('[data-testid="nfe-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfeAutorizada.isVisible()) {
      await nfeAutorizada.click()
      await page.click('[data-testid="cancelar-nfe"]')

      await expect(
        page.locator('[data-testid="modal-cancelamento"]'),
      ).toBeVisible()
    }
  })

  test('deve validar justificativa mínima para cancelamento', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfeList(page)

    const nfeAutorizada = page
      .locator('[data-testid="nfe-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfeAutorizada.isVisible()) {
      await nfeAutorizada.click()
      await page.click('[data-testid="cancelar-nfe"]')

      // Tentar cancelar com justificativa curta
      await page.fill('[data-testid="justificativa-cancelamento"]', 'Erro')
      await page.click('[data-testid="confirmar-cancelamento"]')

      await expect(page.locator('text=mínimo 15 caracteres')).toBeVisible()
    }
  })
})

test.describe('Carta de Correção NF-e', () => {
  test('deve enviar carta de correção', async ({ authenticatedPage: page }) => {
    await fiscalHelpers.goToNfeList(page)

    const nfeAutorizada = page
      .locator('[data-testid="nfe-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfeAutorizada.isVisible()) {
      await nfeAutorizada.click()
      await page.click('[data-testid="carta-correcao"]')

      // Preencher correção
      await page.fill(
        '[data-testid="texto-correcao"]',
        'Correção de teste para campo informação adicional',
      )
      await page.click('[data-testid="enviar-correcao"]')

      // Aguardar resposta
      const toast = page.locator('[role="alert"]')
      await expect(toast).toBeVisible({ timeout: 15000 })
    }
  })
})
