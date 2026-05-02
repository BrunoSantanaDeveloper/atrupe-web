# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: products/products.spec.ts >> Módulo de Produtos (E2E) >> Deve criar um produto complexo e preencher suas configurações fiscais
- Location: e2e/products/products.spec.ts:9:7

# Error details

```
TypeError: (0 , _roleSetup.roleSetup) is not a function
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { roleSetup } from '../helpers/role-setup'
  3   | 
  4   | test.describe('Módulo de Produtos (E2E)', () => {
  5   |   test.beforeEach(async ({ page }) => {
> 6   |     await roleSetup(page, 'ADMIN')
      |                    ^ TypeError: (0 , _roleSetup.roleSetup) is not a function
  7   |   })
  8   | 
  9   |   test('Deve criar um produto complexo e preencher suas configurações fiscais', async ({
  10  |     page,
  11  |   }) => {
  12  |     test.setTimeout(45000) // 45 segundos devido a múltiplos modais
  13  | 
  14  |     // 1. Acessar a tela de listagem de produtos
  15  |     await page.goto('/configuracoes/produtos')
  16  |     await page.waitForLoadState('domcontentloaded')
  17  | 
  18  |     // 2. Abrir modal de criação de produto
  19  |     const newProductBtn = page
  20  |       .getByRole('button', { name: /novo produto/i })
  21  |       .first()
  22  |     await expect(newProductBtn).toBeVisible()
  23  |     await newProductBtn.click()
  24  | 
  25  |     // Aguardar o modal abrir
  26  |     const dialog = page.getByRole('dialog').first()
  27  |     await expect(dialog).toBeVisible()
  28  | 
  29  |     // 3. Preencher formulário principal do produto
  30  |     const productName = `Produto E2E ${Date.now()}`
  31  |     const productCode = `E2E-${Math.floor(Math.random() * 1000)}`
  32  | 
  33  |     // Setor
  34  |     const sectorCombobox = page
  35  |       .locator('label:has-text("Setor")')
  36  |       .locator('..')
  37  |       .locator('button, input')
  38  |       .first()
  39  |     await sectorCombobox.click()
  40  |     await page.keyboard.press('ArrowDown')
  41  |     await page.keyboard.press('Enter')
  42  | 
  43  |     // Grupo de produtos
  44  |     const groupCombobox = page
  45  |       .locator('label:has-text("Grupo de produtos")')
  46  |       .locator('..')
  47  |       .locator('button, input')
  48  |       .first()
  49  |     await groupCombobox.click()
  50  |     await page.keyboard.press('ArrowDown')
  51  |     await page.keyboard.press('Enter')
  52  | 
  53  |     // Nome e Código
  54  |     await page.getByLabel(/nome do produto/i).fill(productName)
  55  |     await page
  56  |       .getByLabel(/código/i)
  57  |       .first()
  58  |       .fill(productCode)
  59  | 
  60  |     // Unidade Comercial e Custo
  61  |     const unitCombobox = page
  62  |       .locator('label:has-text("Unidade Comercial")')
  63  |       .locator('..')
  64  |       .locator('button, input')
  65  |       .first()
  66  |     await unitCombobox.click()
  67  |     await page.keyboard.press('ArrowDown')
  68  |     await page.keyboard.press('Enter')
  69  | 
  70  |     await page.getByLabel(/custo/i).fill('150.00')
  71  | 
  72  |     // Descritivo técnico
  73  |     await page
  74  |       .getByLabel(/descritivo técnico/i)
  75  |       .fill('Produto gerado automaticamente via teste E2E Playwright.')
  76  | 
  77  |     // Salvar Produto
  78  |     const saveBtn = dialog.getByRole('button', { name: /salvar/i })
  79  |     await saveBtn.click()
  80  | 
  81  |     // Aguardar mensagem de sucesso e o fechamento do modal principal
  82  |     await expect(page.getByText(/produto criado com sucesso/i)).toBeVisible()
  83  | 
  84  |     // 4. Modal de Configuração Fiscal deve abrir automaticamente após o sucesso
  85  |     // O sistema aguarda 500ms e abre o Dialog de "Configuração do Item" (ProductFiscalDataDialog)
  86  |     const fiscalDialog = page
  87  |       .getByRole('dialog')
  88  |       .filter({ hasText: /configuração do item|dados fiscais/i })
  89  |       .first()
  90  |     await expect(fiscalDialog).toBeVisible({ timeout: 10000 })
  91  | 
  92  |     // Preencher NCM e outros dados fiscais
  93  |     const ncmInput = page.getByLabel(/ncm/i)
  94  |     if (await ncmInput.isVisible()) {
  95  |       await ncmInput.fill('00000000')
  96  |     }
  97  | 
  98  |     const cfopInput = page.getByLabel(/cfop estadual/i)
  99  |     if (await cfopInput.isVisible()) {
  100 |       await cfopInput.fill('5102')
  101 |     }
  102 | 
  103 |     // Salvar configurações fiscais
  104 |     const saveFiscalBtn = fiscalDialog.getByRole('button', { name: /salvar/i })
  105 |     await saveFiscalBtn.click()
  106 | 
```