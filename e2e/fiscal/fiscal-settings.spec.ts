import { test, expect } from '@playwright/test'

test.describe('Fiscal Settings page (/configuracoes/nota-fiscal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configuracoes/nota-fiscal')
  })

  test('should load the fiscal settings page without errors', async ({
    page,
  }) => {
    await page.goto('/configuracoes/nota-fiscal')

    await expect(page).toHaveURL(/\/configuracoes\/nota-fiscal/, {
      timeout: 15_000,
    })

    await expect(
      page.getByText(/página não encontrada|not found/i),
    ).not.toBeVisible()
  })

  test('should display "Dados do Emissor" section', async ({ page }) => {
    await page.goto('/configuracoes/nota-fiscal')

    await expect(page.getByText('Dados do Emissor')).toBeVisible({
      timeout: 15_000,
    })
  })

  test('should display "Natureza de Operação e CFOP" section', async ({
    page,
  }) => {
    await page.goto('/configuracoes/nota-fiscal')

    await expect(page.getByText('Natureza de Operação e CFOP')).toBeVisible({
      timeout: 15_000,
    })
  })

  test('should show both fiscal settings items together', async ({ page }) => {
    await page.goto('/configuracoes/nota-fiscal')

    // Wait for page to be fully rendered
    await expect(page.getByText('Dados do Emissor')).toBeVisible({
      timeout: 15_000,
    })

    // Assert both settings items are visible simultaneously
    await expect(page.getByText('Dados do Emissor')).toBeVisible()
    await expect(page.getByText('Natureza de Operação e CFOP')).toBeVisible()

    // Removed cards should NOT be present
    await expect(
      page.getByText('NF-e - Lista de Produtos e Serviços'),
    ).not.toBeVisible()
    await expect(page.getByText('NFS-e - Lista de Serviços')).not.toBeVisible()
  })

  test('clicking "Dados do Emissor" should navigate to emissores page', async ({
    page,
  }) => {
    await page.goto('/configuracoes/nota-fiscal')
    await expect(page.getByText('Dados do Emissor')).toBeVisible({
      timeout: 15_000,
    })

    const emissoresCard = page
      .locator('div')
      .filter({ hasText: /^Dados do Emissor/ })
      .first()
    const configLink = emissoresCard
      .getByRole('link', { name: /configurar/i })
      .or(emissoresCard.getByRole('button', { name: /configurar/i }))
    await configLink.first().click()

    await expect(page).toHaveURL(/\/configuracoes\/nota-fiscal\/emissores/, {
      timeout: 15_000,
    })
  })
})
