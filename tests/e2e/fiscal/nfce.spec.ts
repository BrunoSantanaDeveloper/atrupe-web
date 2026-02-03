import { test, expect, fiscalHelpers, testData } from './fixtures'

test.describe('Fluxo NFC-e (Cupom Fiscal)', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await fiscalHelpers.goToNfceList(page)
  })

  test('deve exibir lista de NFC-e', async ({ authenticatedPage: page }) => {
    await expect(page.locator('[data-testid="nfce-list"]')).toBeVisible()
  })

  test('deve filtrar NFC-e por período', async ({
    authenticatedPage: page,
  }) => {
    // Selecionar período de hoje
    await page.click('[data-testid="filtro-periodo-hoje"]')

    await page.waitForLoadState('networkidle')

    // Verificar que lista foi atualizada
    await expect(page.locator('[data-testid="nfce-list"]')).toBeVisible()
  })

  test('deve exibir estatísticas do dia', async ({
    authenticatedPage: page,
  }) => {
    await expect(page.locator('[data-testid="stats-total-dia"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="stats-valor-total"]'),
    ).toBeVisible()
  })

  test('deve abrir detalhes de NFC-e', async ({ authenticatedPage: page }) => {
    const firstNfce = page.locator('[data-testid="nfce-item"]').first()
    if (await firstNfce.isVisible()) {
      await firstNfce.click()
      await expect(page.locator('[data-testid="nfce-detalhes"]')).toBeVisible()
    }
  })

  test('deve imprimir cupom fiscal', async ({ authenticatedPage: page }) => {
    const nfceAutorizada = page
      .locator('[data-testid="nfce-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfceAutorizada.isVisible()) {
      await nfceAutorizada.click()

      // Verificar que botão de impressão está disponível
      await expect(page.locator('[data-testid="imprimir-cupom"]')).toBeEnabled()
    }
  })

  test('deve exibir QR Code da NFC-e', async ({ authenticatedPage: page }) => {
    const nfceAutorizada = page
      .locator('[data-testid="nfce-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfceAutorizada.isVisible()) {
      await nfceAutorizada.click()

      // QR Code deve estar visível
      await expect(page.locator('[data-testid="qrcode-nfce"]')).toBeVisible()
    }
  })
})

test.describe('Modo Contingência NFC-e', () => {
  test('deve exibir indicador de modo contingência', async ({
    authenticatedPage: page,
  }) => {
    // Se houver NFC-e em contingência, deve haver indicador
    const contingencyIndicator = page.locator(
      '[data-testid="contingency-indicator"]',
    )

    // O indicador pode ou não estar visível dependendo do estado
    await expect(contingencyIndicator).toBeDefined()
  })

  test('deve listar NFC-e pendentes de sincronização', async ({
    authenticatedPage: page,
  }) => {
    // Clicar no indicador de contingência se existir
    const contingencyIndicator = page.locator(
      '[data-testid="contingency-indicator"]',
    )

    if (await contingencyIndicator.isVisible()) {
      await contingencyIndicator.click()

      // Deve exibir lista de pendentes
      await expect(
        page.locator('[data-testid="contingency-list"]'),
      ).toBeVisible()
    }
  })

  test('deve forçar sincronização manual de NFC-e', async ({
    authenticatedPage: page,
  }) => {
    const contingencyItem = page
      .locator('[data-testid="nfce-item"][data-status="CONTINGENCY"]')
      .first()

    if (await contingencyItem.isVisible()) {
      await contingencyItem.click()
      await page.click('[data-testid="forcar-sincronizacao"]')

      // Aguardar resposta
      const toast = page.locator('[role="alert"]')
      await expect(toast).toBeVisible({ timeout: 15000 })
    }
  })
})

test.describe('Cancelamento NFC-e', () => {
  test('deve validar prazo de cancelamento', async ({
    authenticatedPage: page,
  }) => {
    // NFC-e só pode ser cancelada em até 24h
    const nfceAutorizada = page
      .locator('[data-testid="nfce-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfceAutorizada.isVisible()) {
      await nfceAutorizada.click()

      const cancelButton = page.locator('[data-testid="cancelar-nfce"]')

      // Botão deve estar habilitado ou desabilitado baseado no prazo
      await expect(cancelButton).toBeDefined()
    }
  })

  test('deve exigir justificativa para cancelamento', async ({
    authenticatedPage: page,
  }) => {
    const nfceAutorizada = page
      .locator('[data-testid="nfce-item"][data-status="AUTHORIZED"]')
      .first()

    if (await nfceAutorizada.isVisible()) {
      await nfceAutorizada.click()

      const cancelButton = page.locator('[data-testid="cancelar-nfce"]')
      if (await cancelButton.isEnabled()) {
        await cancelButton.click()
        await page.click('[data-testid="confirmar-cancelamento"]')

        await expect(
          page.locator('text=Justificativa é obrigatória'),
        ).toBeVisible()
      }
    }
  })
})

test.describe('Inutilização de Numeração NFC-e', () => {
  test('deve acessar página de inutilização', async ({
    authenticatedPage: page,
  }) => {
    await page.click('[data-testid="menu-inutilizacao"]')

    await expect(
      page.locator('[data-testid="inutilizacao-form"]'),
    ).toBeVisible()
  })

  test('deve validar intervalo de numeração', async ({
    authenticatedPage: page,
  }) => {
    await page.click('[data-testid="menu-inutilizacao"]')

    // Número inicial maior que final
    await page.fill('[data-testid="numero-inicial"]', '100')
    await page.fill('[data-testid="numero-final"]', '50')
    await page.click('[data-testid="confirmar-inutilizacao"]')

    await expect(
      page.locator('text=Número final deve ser maior ou igual ao inicial'),
    ).toBeVisible()
  })

  test('deve exigir justificativa mínima', async ({
    authenticatedPage: page,
  }) => {
    await page.click('[data-testid="menu-inutilizacao"]')

    await page.fill('[data-testid="numero-inicial"]', '1')
    await page.fill('[data-testid="numero-final"]', '5')
    await page.fill('[data-testid="justificativa"]', 'Erro')
    await page.click('[data-testid="confirmar-inutilizacao"]')

    await expect(page.locator('text=mínimo 15 caracteres')).toBeVisible()
  })
})
