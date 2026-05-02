# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders/orders-lifecycle.spec.ts >> Ciclo de Vida do Pedido (Orçamento -> OS) >> Deve criar um orçamento, adicionar itens, condição de pagamento e aprovar
- Location: e2e/orders/orders-lifecycle.spec.ts:10:7

# Error details

```
TypeError: (0 , _roleSetup.roleSetup) is not a function
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { roleSetup } from '../helpers/role-setup'
  3   | 
  4   | test.describe('Ciclo de Vida do Pedido (Orçamento -> OS)', () => {
  5   |   // Configura a sessão com o perfil ADMIN antes de cada teste
  6   |   test.beforeEach(async ({ page }) => {
> 7   |     await roleSetup(page, 'ADMIN')
      |                    ^ TypeError: (0 , _roleSetup.roleSetup) is not a function
  8   |   })
  9   | 
  10  |   test('Deve criar um orçamento, adicionar itens, condição de pagamento e aprovar', async ({
  11  |     page,
  12  |   }) => {
  13  |     test.setTimeout(60000) // 60 segundos porque o fluxo completo pode demorar
  14  | 
  15  |     // 1. Acessar a listagem de orçamentos e abrir o modal de criação
  16  |     await page.goto('/vendas/orcamentos')
  17  | 
  18  |     // Tenta encontrar o botão "Novo orçamento" (pode estar na tela principal)
  19  |     const newQuotationBtn = page.getByRole('button', {
  20  |       name: /novo orçamento|nova cotação/i,
  21  |     })
  22  |     await expect(newQuotationBtn).toBeVisible()
  23  |     await newQuotationBtn.click()
  24  | 
  25  |     // 2. Preencher os dados do novo orçamento (Cliente)
  26  |     // Clica no combobox de Cliente
  27  |     const clientCombobox = page
  28  |       .locator('label:has-text("Cliente")')
  29  |       .locator('..')
  30  |       .locator('button, input')
  31  |       .first()
  32  |     await clientCombobox.click()
  33  |     await page.keyboard.type('a', { delay: 100 }) // Busca genérica
  34  |     await page.waitForTimeout(1500) // Aguarda debounce/API
  35  |     await page.keyboard.press('ArrowDown')
  36  |     await page.keyboard.press('Enter')
  37  | 
  38  |     // Clica no botão para salvar e criar o orçamento
  39  |     const submitBtn = page.getByRole('button', { name: /criar orçamento/i })
  40  |     await expect(submitBtn).toBeVisible()
  41  |     await submitBtn.click()
  42  | 
  43  |     // 3. Aguardar o redirecionamento para a página de detalhes do orçamento
  44  |     await expect(page).toHaveURL(/\/vendas\/orcamentos\/.+/, { timeout: 15000 })
  45  | 
  46  |     // Aguardar carregamento da página de detalhes
  47  |     await page.waitForLoadState('domcontentloaded')
  48  | 
  49  |     // 4. Adicionar um Produto ao orçamento
  50  |     const addProductBtn = page
  51  |       .getByRole('button', { name: /adicionar produto|novo item/i })
  52  |       .first()
  53  |     if (await addProductBtn.isVisible()) {
  54  |       await addProductBtn.click()
  55  | 
  56  |       // Interage com o campo de produto
  57  |       const productSelect = page
  58  |         .locator('label:has-text("Produto")')
  59  |         .locator('..')
  60  |         .locator('button, input')
  61  |         .first()
  62  |       await productSelect.click()
  63  |       await page.keyboard.type('a', { delay: 100 })
  64  |       await page.waitForTimeout(1500)
  65  |       await page.keyboard.press('ArrowDown')
  66  |       await page.keyboard.press('Enter')
  67  | 
  68  |       // Confirma adição do produto (Salvar/Adicionar)
  69  |       const saveProductBtn = page
  70  |         .getByRole('dialog')
  71  |         .getByRole('button', { name: /salvar|adicionar/i })
  72  |       await saveProductBtn.click()
  73  |       await page.waitForTimeout(1000)
  74  |     }
  75  | 
  76  |     // 5. Configurar Condição de Pagamento
  77  |     const paymentCondTab = page
  78  |       .getByRole('button', { name: /condição de pagamento|financeiro/i })
  79  |       .first()
  80  |     if (await paymentCondTab.isVisible()) {
  81  |       await paymentCondTab.click()
  82  |     }
  83  | 
  84  |     // Abre a edição da condição de pagamento (às vezes é um botão de "Editar" ou o próprio Select)
  85  |     const paymentSelect = page
  86  |       .locator('label:has-text("Condição de Pagamento")')
  87  |       .locator('..')
  88  |       .locator('button, input')
  89  |       .first()
  90  |       .or(page.getByRole('button', { name: /editar.*condição/i }))
  91  | 
  92  |     if (await paymentSelect.isVisible()) {
  93  |       await paymentSelect.click()
  94  |       await page.keyboard.press('ArrowDown')
  95  |       await page.keyboard.press('Enter')
  96  | 
  97  |       // Caso haja um botão Salvar para a condição
  98  |       const savePaymentBtn = page.getByRole('button', {
  99  |         name: /salvar.*condição/i,
  100 |       })
  101 |       if (await savePaymentBtn.isVisible()) {
  102 |         await savePaymentBtn.click()
  103 |         await page.waitForTimeout(1000)
  104 |       }
  105 |     }
  106 | 
  107 |     // 6. Aprovar Orçamento
```