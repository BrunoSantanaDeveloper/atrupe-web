import { test, expect } from '@playwright/test'

test.describe('Fiscal Settings page (/configuracoes/nota-fiscal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configuracoes/nota-fiscal')
  })

  test('should load the fiscal settings page without errors', async ({ page }) => {
    await page.goto('/configuracoes/nota-fiscal')

    // Verify the page loaded (no error / 404 state)
    await expect(page).toHaveURL(/\/configuracoes\/nota-fiscal/, {
      timeout: 15_000,
    })

    // The page should not show a "not found" or generic error
    await expect(page.getByText(/página não encontrada|not found/i)).not.toBeVisible()
  })

  test('should display "Configurar Emissores" section', async ({ page }) => {
    await page.goto('/configuracoes/nota-fiscal')

    await expect(
      page.getByText('Configurar Emissores'),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('should display "NF-e Natureza de Operação e CFOP" section', async ({
    page,
  }) => {
    await page.goto('/configuracoes/nota-fiscal')

    await expect(
      page.getByText('NF-e Natureza de Operação e CFOP'),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('should display "NF-e - Lista de Produtos e Serviços" section', async ({
    page,
  }) => {
    await page.goto('/configuracoes/nota-fiscal')

    await expect(
      page.getByText('NF-e - Lista de Produtos e Serviços'),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('should display "NFS-e - Lista de Serviços" section', async ({ page }) => {
    await page.goto('/configuracoes/nota-fiscal')

    await expect(
      page.getByText('NFS-e - Lista de Serviços'),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('should show all 4 fiscal settings items together', async ({ page }) => {
    await page.goto('/configuracoes/nota-fiscal')

    // Wait for page to be fully rendered
    await expect(page.getByText('Configurar Emissores')).toBeVisible({
      timeout: 15_000,
    })

    // Assert all four settings items are visible simultaneously
    await expect(page.getByText('Configurar Emissores')).toBeVisible()
    await expect(page.getByText('NF-e Natureza de Operação e CFOP')).toBeVisible()
    await expect(page.getByText('NF-e - Lista de Produtos e Serviços')).toBeVisible()
    await expect(page.getByText('NFS-e - Lista de Serviços')).toBeVisible()
  })

  test('clicking "Configurar Emissores" should navigate to emissores page', async ({
    page,
  }) => {
    await page.goto('/configuracoes/nota-fiscal')
    await expect(page.getByText('Configurar Emissores')).toBeVisible({
      timeout: 15_000,
    })

    // The settings list renders each item as a card with title + a "Configurar" button/link.
    // Locate the card that contains "Configurar Emissores" and click its "Configurar" link.
    const emissoresCard = page.locator('div').filter({ hasText: /^Configurar Emissores/ }).first()
    const configLink = emissoresCard.getByRole('link', { name: /configurar/i })
      .or(emissoresCard.getByRole('button', { name: /configurar/i }))
    await configLink.first().click()

    await expect(page).toHaveURL(/\/configuracoes\/nota-fiscal\/emissores/, {
      timeout: 15_000,
    })
  })
})
