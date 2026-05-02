import { test, expect } from '@playwright/test'
import { roleSetup } from '../helpers/role-setup'

test.describe('Módulo de Contas Bancárias (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Autentica como ADMIN pois as configurações financeiras exigem permissões altas
    await roleSetup(page, 'ADMIN')
  })

  test('Deve criar uma nova conta bancária com sucesso', async ({ page }) => {
    test.setTimeout(30000)

    // 1. Acessar a listagem de contas bancárias
    await page.goto('/configuracoes/financeiro/contas-bancarias')
    await page.waitForLoadState('domcontentloaded')

    // 2. Abrir o modal de Nova Conta
    const newAccountBtn = page
      .getByRole('button', { name: /nova conta/i })
      .first()
    await expect(newAccountBtn).toBeVisible()
    await newAccountBtn.click()

    // Aguardar o modal abrir
    const dialog = page.getByRole('dialog').first()
    await expect(dialog).toBeVisible()

    // 3. Preencher os dados básicos da conta
    const accountName = `Conta E2E ${Date.now()}`
    const accountDescription =
      'Conta criada automaticamente via script de teste E2E Playwright'

    await page.getByLabel(/referência da conta/i).fill(accountName)
    await page.getByLabel(/descrição/i).fill(accountDescription)

    // 4. Selecionar o Banco (Combobox)
    const bankCombobox = page
      .locator('label:has-text("Banco")')
      .locator('..')
      .locator('button, input')
      .first()
    await bankCombobox.click()
    await page.keyboard.type('Brasil', { delay: 100 }) // Exemplo genérico
    await page.waitForTimeout(1000) // Aguarda a listagem do Select carregar
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // 5. Salvar a nova conta bancária
    const saveBtn = dialog.getByRole('button', { name: /salvar/i })
    await saveBtn.click()

    // 6. Validar o Toast de sucesso
    await expect(page.getByText(/sucesso/i).first()).toBeVisible({
      timeout: 10000,
    })

    // 7. Validar que o modal foi fechado
    await expect(dialog).not.toBeVisible()
  })
})
