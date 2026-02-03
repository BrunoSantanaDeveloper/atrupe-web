import { test, expect, fiscalHelpers, testData } from './fixtures'

test.describe('Fluxo NFS-e', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await fiscalHelpers.goToNfseList(page)
  })

  test('deve exibir lista de NFS-e', async ({ authenticatedPage: page }) => {
    await expect(page.locator('[data-testid="nfse-list"]')).toBeVisible()
  })

  test('deve filtrar NFS-e por status', async ({ authenticatedPage: page }) => {
    await page.selectOption('[data-testid="filtro-status"]', 'AUTHORIZED')

    const items = page.locator(
      '[data-testid="nfse-item"][data-status="AUTHORIZED"]',
    )
    if ((await items.count()) > 0) {
      await expect(items.first()).toBeVisible()
    }
  })

  test('deve abrir detalhes de NFS-e', async ({ authenticatedPage: page }) => {
    const firstNfse = page.locator('[data-testid="nfse-item"]').first()
    if (await firstNfse.isVisible()) {
      await firstNfse.click()
      await expect(page.locator('[data-testid="nfse-detalhes"]')).toBeVisible()
    }
  })

  test('deve baixar PDF de NFS-e autorizada', async ({
    authenticatedPage: page,
  }) => {
    const nfseAutorizada = page
      .locator('[data-testid="nfse-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfseAutorizada.isVisible()) {
      await nfseAutorizada.click()

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="baixar-pdf"]'),
      ])

      expect(download.suggestedFilename()).toContain('nfse')
    }
  })
})

test.describe('Emissão de NFS-e', () => {
  test('deve navegar para página de emissão de NFS-e', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfseList(page)
    await page.click('[data-testid="nova-nfse"]')

    await expect(page.locator('[data-testid="nfse-form"]')).toBeVisible()
  })

  test('deve validar dados do tomador', async ({ authenticatedPage: page }) => {
    await fiscalHelpers.goToNfseList(page)
    await page.click('[data-testid="nova-nfse"]')

    await page.click('[data-testid="emitir-nfse"]')

    await expect(page.locator('text=Tomador é obrigatório')).toBeVisible()
  })

  test('deve validar código de serviço', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfseList(page)
    await page.click('[data-testid="nova-nfse"]')

    // Preencher código inválido
    await page.fill('[data-testid="codigo-servico"]', '99.99')
    await page.click('[data-testid="emitir-nfse"]')

    await expect(page.locator('text=Código de serviço inválido')).toBeVisible()
  })

  test('deve preencher ISS automaticamente', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfseList(page)
    await page.click('[data-testid="nova-nfse"]')

    // Ao preencher valor, ISS deve ser calculado
    await page.fill('[data-testid="valor-servico"]', '1000.00')

    // ISS padrão 5%
    const issField = page.locator('[data-testid="valor-iss"]')
    await expect(issField).toHaveValue('50.00')
  })

  test('deve salvar rascunho de NFS-e', async ({ authenticatedPage: page }) => {
    await fiscalHelpers.goToNfseList(page)
    await page.click('[data-testid="nova-nfse"]')

    await page.fill('[data-testid="tomador-nome"]', 'Tomador Teste E2E')

    await page.click('[data-testid="salvar-rascunho"]')

    await fiscalHelpers.waitForToast(page, 'Rascunho salvo')
  })
})

test.describe('Cancelamento NFS-e', () => {
  test('deve exibir modal de cancelamento de NFS-e', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfseList(page)

    const nfseAutorizada = page
      .locator('[data-testid="nfse-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfseAutorizada.isVisible()) {
      await nfseAutorizada.click()
      await page.click('[data-testid="cancelar-nfse"]')

      await expect(
        page.locator('[data-testid="modal-cancelamento"]'),
      ).toBeVisible()
    }
  })

  test('deve exigir motivo de cancelamento', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToNfseList(page)

    const nfseAutorizada = page
      .locator('[data-testid="nfse-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfseAutorizada.isVisible()) {
      await nfseAutorizada.click()
      await page.click('[data-testid="cancelar-nfse"]')

      await page.click('[data-testid="confirmar-cancelamento"]')

      await expect(page.locator('text=Motivo é obrigatório')).toBeVisible()
    }
  })
})
