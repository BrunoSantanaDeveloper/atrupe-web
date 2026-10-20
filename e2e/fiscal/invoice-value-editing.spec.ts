import { test, expect, type Page } from '@playwright/test'
import { skipUnlessFiscalReady } from '../helpers/fiscal-gate'

test.describe('Invoice item value editing', () => {
  test.beforeEach(async ({ page }) => {
    await skipUnlessFiscalReady(page)
    await page.goto('/nota-fiscal/emitir')
  })

  /**
   * Helper: navigate to the emission list, open the type modal on the first
   * available order and select NF-e to land on the emission form.
   * Returns false if there are no orders (test should be skipped).
   */
  async function navigateToEmissionForm(page: Page) {
    await expect(
      page.getByRole('table').or(page.getByText('Nenhuma ordem encontrada')),
    ).toBeVisible({ timeout: 15_000 })

    const emitButtons = page.getByRole('button', {
      name: /emitir nota fiscal/i,
    })
    const count = await emitButtons.count()
    if (count === 0) return false

    await emitButtons.first().click()

    const dialog = page.getByRole('dialog', {
      name: /selecionar tipo de nota fiscal/i,
    })
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: /nf-e \(produto\)/i }).click()
    await expect(dialog).not.toBeVisible()

    // Wait for emission form to load
    await page.waitForURL(/\/nota-fiscal\/emitir\/.+/, { timeout: 15_000 })
    return true
  }

  test('should open InvoiceItemEditDialog when clicking the pencil edit button on an item', async ({
    page,
  }) => {
    const hasOrders = await navigateToEmissionForm(page)
    test.skip(!hasOrders, 'No orders available to test with')

    // Wait for items table to render
    await expect(page.getByText('Itens')).toBeVisible({ timeout: 10_000 })

    // The edit button uses IconPencil — locate by aria-label
    const editButtons = page.getByRole('button', { name: /editar item/i })
    await expect(editButtons.first()).toBeVisible({ timeout: 10_000 })
    await editButtons.first().click()

    // Verify the edit dialog opened
    await expect(
      page.getByRole('dialog', { name: /editar item/i }),
    ).toBeVisible()
  })

  test('should display editable fields inside the InvoiceItemEditDialog', async ({
    page,
  }) => {
    const hasOrders = await navigateToEmissionForm(page)
    test.skip(!hasOrders, 'No orders available to test with')

    await expect(page.getByText('Itens')).toBeVisible({ timeout: 10_000 })

    const editButtons = page.getByRole('button', { name: /editar item/i })
    await expect(editButtons.first()).toBeVisible()
    await editButtons.first().click()

    const dialog = page.getByRole('dialog', { name: /editar item/i })
    await expect(dialog).toBeVisible()

    // Verify all editable fields are present
    await expect(dialog.getByLabel(/quantidade/i)).toBeVisible()
    await expect(dialog.getByLabel(/valor unitário/i)).toBeVisible()
    await expect(dialog.getByLabel(/desconto/i)).toBeVisible()
    await expect(dialog.getByLabel(/frete/i)).toBeVisible()
    await expect(dialog.getByLabel(/seguro/i)).toBeVisible()

    // The calculated total field should be read-only (disabled)
    await expect(dialog.getByLabel(/valor total/i)).toBeDisabled()
  })

  test('should update totals and show amber disclaimer after editing a unit value', async ({
    page,
  }) => {
    const hasOrders = await navigateToEmissionForm(page)
    test.skip(!hasOrders, 'No orders available to test with')

    await expect(page.getByText('Itens')).toBeVisible({ timeout: 10_000 })

    const editButtons = page.getByRole('button', { name: /editar item/i })
    await expect(editButtons.first()).toBeVisible()
    await editButtons.first().click()

    const dialog = page.getByRole('dialog', { name: /editar item/i })
    await expect(dialog).toBeVisible()

    // Change the unit value to a known number
    const unitValueInput = dialog.getByLabel(/valor unitário/i)
    await unitValueInput.fill('')
    await unitValueInput.fill('999')

    // Save changes
    await dialog.getByRole('button', { name: /salvar alterações/i }).click()

    // Dialog should close
    await expect(dialog).not.toBeVisible()

    // Disclaimer banner should appear
    await expect(
      page.getByText(/os valores foram ajustados manualmente/i),
    ).toBeVisible({ timeout: 5_000 })
  })

  test('should recalculate total value in real time as fields are edited', async ({
    page,
  }) => {
    const hasOrders = await navigateToEmissionForm(page)
    test.skip(!hasOrders, 'No orders available to test with')

    await expect(page.getByText('Itens')).toBeVisible({ timeout: 10_000 })

    const editButtons = page.getByRole('button', { name: /editar item/i })
    await expect(editButtons.first()).toBeVisible()
    await editButtons.first().click()

    const dialog = page.getByRole('dialog', { name: /editar item/i })
    await expect(dialog).toBeVisible()

    // Set quantity = 2 and unit value = 100 → total should be 200
    const quantityInput = dialog.getByLabel(/quantidade/i)
    const unitValueInput = dialog.getByLabel(/valor unitário/i)
    const totalInput = dialog.getByLabel(/valor total/i)

    await quantityInput.fill('2')
    await unitValueInput.fill('100')

    // Total should have been recalculated to 200
    await expect(totalInput).toHaveValue('200')
  })

  test('cancel button should close the dialog without saving changes', async ({
    page,
  }) => {
    const hasOrders = await navigateToEmissionForm(page)
    test.skip(!hasOrders, 'No orders available to test with')

    await expect(page.getByText('Itens')).toBeVisible({ timeout: 10_000 })

    const editButtons = page.getByRole('button', { name: /editar item/i })
    await expect(editButtons.first()).toBeVisible()
    await editButtons.first().click()

    const dialog = page.getByRole('dialog', { name: /editar item/i })
    await expect(dialog).toBeVisible()

    // Cancel without saving
    await dialog.getByRole('button', { name: /cancelar/i }).click()
    await expect(dialog).not.toBeVisible()

    // No disclaimer should appear since nothing was saved
    await expect(
      page.getByText(/os valores foram ajustados manualmente/i),
    ).not.toBeVisible()
  })
})
