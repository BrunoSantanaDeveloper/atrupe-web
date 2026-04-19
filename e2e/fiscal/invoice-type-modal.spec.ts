import { test, expect } from '@playwright/test'

test.describe('InvoiceTypeSelectModal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nota-fiscal/emitir')
  })

  test('should display the invoice type modal when clicking emit button on an order', async ({
    page,
  }) => {

    // Wait for the orders table to finish loading (skeletons disappear)
    await expect(
      page.getByRole('table').or(page.getByText('Nenhuma ordem encontrada')),
    ).toBeVisible({ timeout: 15_000 })

    // Skip if no orders are available
    const emitButtons = page.getByRole('button', { name: /emitir nota fiscal/i })
    const count = await emitButtons.count()
    test.skip(count === 0, 'No orders available to test with')

    // Find the first "Emitir Nota Fiscal" action button and click it
    await emitButtons.first().click()

    // Verify the dialog opened with the correct title
    await expect(
      page.getByRole('dialog', { name: /selecionar tipo de nota fiscal/i }),
    ).toBeVisible()
  })

  test('should show 3 invoice type options (NF-e, NFS-e, NFC-e)', async ({
    page,
  }) => {
    await expect(
      page.getByRole('table').or(page.getByText('Nenhuma ordem encontrada')),
    ).toBeVisible({ timeout: 15_000 })

    const emitButtons = page.getByRole('button', { name: /emitir nota fiscal/i })
    const count = await emitButtons.count()
    test.skip(count === 0, 'No orders available to test with')

    await emitButtons.first().click()

    const dialog = page.getByRole('dialog', { name: /selecionar tipo de nota fiscal/i })
    await expect(dialog).toBeVisible()

    // All three option labels should be visible
    await expect(dialog.getByText('NF-e (Produto)')).toBeVisible()
    await expect(dialog.getByText('NFS-e (Serviço)')).toBeVisible()
    await expect(dialog.getByText('NFC-e (Consumidor)')).toBeVisible()
  })

  test('NFC-e option should show "Em breve" badge and be disabled', async ({
    page,
  }) => {
    await expect(
      page.getByRole('table').or(page.getByText('Nenhuma ordem encontrada')),
    ).toBeVisible({ timeout: 15_000 })

    const emitButtons = page.getByRole('button', { name: /emitir nota fiscal/i })
    const count = await emitButtons.count()
    test.skip(count === 0, 'No orders available to test with')

    await emitButtons.first().click()

    const dialog = page.getByRole('dialog', { name: /selecionar tipo de nota fiscal/i })
    await expect(dialog).toBeVisible()

    // Locate the NFC-e button — it should be disabled
    const nfceButton = dialog.getByRole('button', { name: /nfc-e/i })
    await expect(nfceButton).toBeDisabled()

    // The "Em breve" badge should be visible inside the dialog
    await expect(dialog.getByText('Em breve')).toBeVisible()
  })

  test('clicking NF-e should navigate to the emission form', async ({ page }) => {
    await expect(
      page.getByRole('table').or(page.getByText('Nenhuma ordem encontrada')),
    ).toBeVisible({ timeout: 15_000 })

    // Only run this test if there are actual orders
    const tableRows = page.getByRole('button', { name: /emitir nota fiscal/i })
    const count = await tableRows.count()
    test.skip(count === 0, 'No orders available to test with')

    await tableRows.first().click()

    const dialog = page.getByRole('dialog', { name: /selecionar tipo de nota fiscal/i })
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: /nf-e \(produto\)/i }).click()

    // Modal should close and navigate to the emission form
    await expect(dialog).not.toBeVisible()
    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/.+/, { timeout: 15_000 })
  })
})
