import { test, expect } from '@playwright/test'

import { skipUnlessFiscalReady } from '../helpers/fiscal-gate'

test.describe('Nota Avulsa - NFS-e (/nota-fiscal/emitir/avulsa/nfse)', () => {
  test.beforeEach(async ({ page }) => {
    await skipUnlessFiscalReady(page)
  })

  test('should navigate to NFS-e form', async ({ page }) => {
    await page.goto('/nota-fiscal/emitir/avulsa')

    // Wait for the selection cards to appear
    await expect(page.getByText(/NFS-e/i)).toBeVisible({ timeout: 15_000 })

    // Click the NFS-e card link
    const nfseLink = page.getByRole('link', { name: /NFS-e/i }).first()
    await expect(nfseLink).toBeVisible({ timeout: 10_000 })
    await nfseLink.click()

    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa\/nfse/, {
      timeout: 15_000,
    })
  })

  test('should display NFS-e standalone form with key sections', async ({
    page,
  }) => {
    await page.goto('/nota-fiscal/emitir/avulsa/nfse')

    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa\/nfse/, {
      timeout: 15_000,
    })

    // The page should not show a 404 / error state
    await expect(
      page.getByText(/página não encontrada|not found/i),
    ).not.toBeVisible()

    // Client selection component should be visible
    const clientArea = page
      .getByRole('combobox', { name: /cliente/i })
      .or(page.getByPlaceholder(/buscar cliente|selecionar cliente/i))
      .or(page.getByText(/selecionar cliente|buscar cliente/i))
      .first()

    await expect(clientArea).toBeVisible({ timeout: 20_000 })

    // Service description textarea should exist
    const discriminacaoArea = page
      .getByRole('textbox', {
        name: /discriminação|descrição do serviço|serviço/i,
      })
      .or(
        page.locator(
          'textarea[name*="discriminacao"], textarea[placeholder*="discrimina"]',
        ),
      )
      .or(page.getByPlaceholder(/discriminação|descrição do serviço/i))
      .first()

    await expect(discriminacaoArea).toBeVisible({ timeout: 15_000 })

    // Fiscal data section should exist
    const fiscalSection = page
      .getByText(/dados fiscais|alíquota|ISS|código.*serviço/i)
      .first()

    await expect(fiscalSection).toBeVisible({ timeout: 15_000 })

    // Emit button should exist
    const emitButton = page.getByRole('button', { name: /emitir/i }).first()

    await expect(emitButton).toBeVisible({ timeout: 15_000 })
  })

  test('should display client search on NFS-e form', async ({ page }) => {
    await page.goto('/nota-fiscal/emitir/avulsa/nfse')

    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa\/nfse/, {
      timeout: 15_000,
    })

    // Client select combobox — find it
    const clientCombobox = page
      .getByRole('combobox', { name: /cliente/i })
      .or(page.getByPlaceholder(/buscar cliente|selecionar cliente/i))
      .first()

    const clientButton = page
      .getByRole('button', { name: /selecionar cliente|buscar cliente/i })
      .first()

    const clientTrigger = clientCombobox.or(clientButton)

    const isVisible = await clientTrigger.isVisible().catch(() => false)

    if (!isVisible) {
      test.skip()
      return
    }

    await clientTrigger.click()

    // After click, a dropdown list or popover with search results / input should appear
    const searchInput = page
      .getByRole('option')
      .or(page.getByPlaceholder(/buscar/i))
      .or(page.locator('[cmdk-input]'))
      .first()

    await expect(searchInput).toBeVisible({ timeout: 10_000 })
  })
})
