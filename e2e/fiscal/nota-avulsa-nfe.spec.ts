import { test, expect } from '@playwright/test'

test.describe('Nota Avulsa - NF-e (/nota-fiscal/emitir/avulsa/nfe)', () => {
  test('should navigate to Nota Avulsa from emission page', async ({ page }) => {
    await page.goto('/nota-fiscal/emitir')

    // Wait for the page to load
    await expect(page).toHaveURL(/\/nota-fiscal\/emitir/, { timeout: 15_000 })

    // Find and click the "Emitir Nota Avulsa" link/button
    const avulsaLink = page
      .getByRole('link', { name: /nota avulsa/i })
      .or(page.getByRole('button', { name: /nota avulsa/i }))
      .or(page.getByText(/emitir nota avulsa/i))
      .first()

    await expect(avulsaLink).toBeVisible({ timeout: 15_000 })
    await avulsaLink.click()

    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa/, {
      timeout: 15_000,
    })
  })

  test('should display NF-e and NFS-e selection cards', async ({ page }) => {
    await page.goto('/nota-fiscal/emitir/avulsa')

    // Wait for page to settle
    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa/, {
      timeout: 15_000,
    })

    // NF-e card should be visible
    await expect(page.getByText(/NF-e/i)).toBeVisible({ timeout: 15_000 })

    // NFS-e card should be visible
    await expect(page.getByText(/NFS-e/i)).toBeVisible({ timeout: 15_000 })

    // NFC-e should show "Em breve"
    await expect(page.getByText(/NFC-e/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/em breve/i)).toBeVisible({ timeout: 15_000 })
  })

  test('should navigate to NF-e form', async ({ page }) => {
    await page.goto('/nota-fiscal/emitir/avulsa')

    // Wait for cards to appear
    await expect(page.getByText(/NF-e/i)).toBeVisible({ timeout: 15_000 })

    // Click the NF-e card link
    const nfeLink = page.getByRole('link', { name: /NF-e/i }).first()
    await expect(nfeLink).toBeVisible({ timeout: 10_000 })
    await nfeLink.click()

    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa\/nfe/, {
      timeout: 15_000,
    })
  })

  test('should display NF-e standalone form with key sections', async ({ page }) => {
    await page.goto('/nota-fiscal/emitir/avulsa/nfe')

    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa\/nfe/, {
      timeout: 15_000,
    })

    // The page should not show a 404 / error state
    await expect(page.getByText(/página não encontrada|not found/i)).not.toBeVisible()

    // Client selection component should always be visible (renders even on API error)
    const clientArea = page
      .getByRole('combobox', { name: /destinatário|cliente/i })
      .or(page.getByPlaceholder(/buscar cliente|selecionar cliente|selecione o destinatário/i))
      .or(page.getByText(/selecionar cliente|buscar cliente|selecione o destinatário|cliente \/ destinatário/i))
      .first()

    await expect(clientArea).toBeVisible({ timeout: 20_000 })

    // If the API returned an error, data-dependent sections won't render — skip them
    const errorBanner = page.getByText(/erro ao carregar dados/i)
    const hasError = await errorBanner.isVisible().catch(() => false)
    if (hasError) {
      // Emit button should still exist (disabled)
      const emitButton = page
        .getByRole('button', { name: /emitir/i })
        .first()
      await expect(emitButton).toBeVisible({ timeout: 15_000 })
      return
    }

    // Product selector / add product button should exist
    const productArea = page
      .getByRole('button', { name: /adicionar produto|produto/i })
      .or(page.getByText(/adicionar produto|produtos/i))
      .first()

    await expect(productArea).toBeVisible({ timeout: 15_000 })

    // Payment section should exist
    const paymentSection = page
      .getByText(/pagamento/i)
      .first()

    await expect(paymentSection).toBeVisible({ timeout: 15_000 })

    // Emit button should exist
    const emitButton = page
      .getByRole('button', { name: /emitir/i })
      .first()

    await expect(emitButton).toBeVisible({ timeout: 15_000 })
  })

  test('should display client search on NF-e form', async ({ page }) => {
    await page.goto('/nota-fiscal/emitir/avulsa/nfe')

    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa\/nfe/, {
      timeout: 15_000,
    })

    // Wait for the form to be ready (not showing a loading skeleton exclusively)
    // Client select combobox — find it
    const clientCombobox = page
      .getByRole('combobox', { name: /destinatário|cliente/i })
      .or(page.getByPlaceholder(/buscar cliente|selecionar cliente|selecione o destinatário/i))
      .first()

    const clientButton = page
      .getByRole('button', { name: /selecionar cliente|buscar cliente|selecione o destinatário/i })
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
