# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bank/bank-accounts.spec.ts >> Módulo de Contas Bancárias (E2E) >> Deve criar uma nova conta bancária com sucesso
- Location: e2e/bank/bank-accounts.spec.ts:10:7

# Error details

```
TypeError: (0 , _roleSetup.roleSetup) is not a function
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { roleSetup } from '../helpers/role-setup'
  3  | 
  4  | test.describe('Módulo de Contas Bancárias (E2E)', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Autentica como ADMIN pois as configurações financeiras exigem permissões altas
> 7  |     await roleSetup(page, 'ADMIN')
     |                    ^ TypeError: (0 , _roleSetup.roleSetup) is not a function
  8  |   })
  9  | 
  10 |   test('Deve criar uma nova conta bancária com sucesso', async ({ page }) => {
  11 |     test.setTimeout(30000)
  12 | 
  13 |     // 1. Acessar a listagem de contas bancárias
  14 |     await page.goto('/configuracoes/financeiro/contas-bancarias')
  15 |     await page.waitForLoadState('domcontentloaded')
  16 | 
  17 |     // 2. Abrir o modal de Nova Conta
  18 |     const newAccountBtn = page
  19 |       .getByRole('button', { name: /nova conta/i })
  20 |       .first()
  21 |     await expect(newAccountBtn).toBeVisible()
  22 |     await newAccountBtn.click()
  23 | 
  24 |     // Aguardar o modal abrir
  25 |     const dialog = page.getByRole('dialog').first()
  26 |     await expect(dialog).toBeVisible()
  27 | 
  28 |     // 3. Preencher os dados básicos da conta
  29 |     const accountName = `Conta E2E ${Date.now()}`
  30 |     const accountDescription =
  31 |       'Conta criada automaticamente via script de teste E2E Playwright'
  32 | 
  33 |     await page.getByLabel(/referência da conta/i).fill(accountName)
  34 |     await page.getByLabel(/descrição/i).fill(accountDescription)
  35 | 
  36 |     // 4. Selecionar o Banco (Combobox)
  37 |     const bankCombobox = page
  38 |       .locator('label:has-text("Banco")')
  39 |       .locator('..')
  40 |       .locator('button, input')
  41 |       .first()
  42 |     await bankCombobox.click()
  43 |     await page.keyboard.type('Brasil', { delay: 100 }) // Exemplo genérico
  44 |     await page.waitForTimeout(1000) // Aguarda a listagem do Select carregar
  45 |     await page.keyboard.press('ArrowDown')
  46 |     await page.keyboard.press('Enter')
  47 | 
  48 |     // 5. Salvar a nova conta bancária
  49 |     const saveBtn = dialog.getByRole('button', { name: /salvar/i })
  50 |     await saveBtn.click()
  51 | 
  52 |     // 6. Validar o Toast de sucesso
  53 |     await expect(page.getByText(/sucesso/i).first()).toBeVisible({
  54 |       timeout: 10000,
  55 |     })
  56 | 
  57 |     // 7. Validar que o modal foi fechado
  58 |     await expect(dialog).not.toBeVisible()
  59 |   })
  60 | })
  61 | 
```