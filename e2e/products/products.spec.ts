import { test, expect } from '@playwright/test'
import { roleSetup } from '../helpers/role-setup'

test.describe('Módulo de Produtos (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await roleSetup(page, 'ADMIN')
  })

  test('Deve criar um produto complexo e preencher suas configurações fiscais', async ({
    page,
  }) => {
    test.setTimeout(45000) // 45 segundos devido a múltiplos modais

    // 1. Acessar a tela de listagem de produtos
    await page.goto('/configuracoes/produtos')
    await page.waitForLoadState('networkidle')

    // 2. Abrir modal de criação de produto
    const newProductBtn = page
      .getByRole('button', { name: /novo produto/i })
      .first()
    await expect(newProductBtn).toBeVisible()
    await newProductBtn.click()

    // Aguardar o modal abrir
    const dialog = page.getByRole('dialog').first()
    await expect(dialog).toBeVisible()

    // 3. Preencher formulário principal do produto
    const productName = `Produto E2E ${Date.now()}`
    const productCode = `E2E-${Math.floor(Math.random() * 1000)}`

    // Setor
    const sectorCombobox = page
      .locator('label:has-text("Setor")')
      .locator('..')
      .locator('button, input')
      .first()
    await sectorCombobox.click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Grupo de produtos
    const groupCombobox = page
      .locator('label:has-text("Grupo de produtos")')
      .locator('..')
      .locator('button, input')
      .first()
    await groupCombobox.click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Nome e Código
    await page.getByLabel(/nome do produto/i).fill(productName)
    await page
      .getByLabel(/código/i)
      .first()
      .fill(productCode)

    // Unidade Comercial e Custo
    const unitCombobox = page
      .locator('label:has-text("Unidade Comercial")')
      .locator('..')
      .locator('button, input')
      .first()
    await unitCombobox.click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await page.getByLabel(/custo/i).fill('150.00')

    // Descritivo técnico
    await page
      .getByLabel(/descritivo técnico/i)
      .fill('Produto gerado automaticamente via teste E2E Playwright.')

    // Salvar Produto
    const saveBtn = dialog.getByRole('button', { name: /salvar/i })
    await saveBtn.click()

    // Aguardar mensagem de sucesso e o fechamento do modal principal
    await expect(page.getByText(/produto criado com sucesso/i)).toBeVisible()

    // 4. Modal de Configuração Fiscal deve abrir automaticamente após o sucesso
    // O sistema aguarda 500ms e abre o Dialog de "Configuração do Item" (ProductFiscalDataDialog)
    const fiscalDialog = page
      .getByRole('dialog')
      .filter({ hasText: /configuração do item|dados fiscais/i })
      .first()
    await expect(fiscalDialog).toBeVisible({ timeout: 10000 })

    // Preencher NCM e outros dados fiscais
    const ncmInput = page.getByLabel(/ncm/i)
    if (await ncmInput.isVisible()) {
      await ncmInput.fill('00000000')
    }

    const cfopInput = page.getByLabel(/cfop estadual/i)
    if (await cfopInput.isVisible()) {
      await cfopInput.fill('5102')
    }

    // Salvar configurações fiscais
    const saveFiscalBtn = fiscalDialog.getByRole('button', { name: /salvar/i })
    await saveFiscalBtn.click()

    // 5. Validar o sucesso
    await expect(
      page.getByText(/dados fiscais salvos com sucesso/i),
    ).toBeVisible()

    // Modal fiscal deve fechar e o produto estar na tabela
    await expect(fiscalDialog).not.toBeVisible()
  })
})
