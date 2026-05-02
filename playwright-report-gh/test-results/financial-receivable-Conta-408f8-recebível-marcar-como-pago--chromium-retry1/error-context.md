# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: financial/receivable.spec.ts >> Contas a Receber (Financeiro) >> deve permitir baixar/compensar um recebível (marcar como pago)
- Location: e2e/financial/receivable.spec.ts:23:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /contas a receber|recebíveis/i }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('heading', { name: /contas a receber|recebíveis/i }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - img [ref=e4]
    - generic [ref=e8]:
      - generic [ref=e9]: Você está em ambiente de Desenvolvimento / Homologação
      - generic [ref=e10]: As alterações feitas aqui não serão refletidas em produção!
    - button "Fechar alerta" [ref=e11] [cursor=pointer]:
      - img [ref=e12]
  - generic [ref=e16]:
    - paragraph [ref=e17]: "404"
    - paragraph [ref=e18]: Página não encontrada
    - link "Voltar ao início" [ref=e19] [cursor=pointer]:
      - /url: /
      - img [ref=e20]
      - text: Voltar ao início
  - region "Notifications alt+T"
  - alert [ref=e24]
```

# Test source

```ts
  1  | import { test, expect, Page } from '@playwright/test'
  2  | 
  3  | async function openReceivablesPage(page: Page) {
  4  |   await page.goto('/financeiro/contas-a-receber')
  5  |   await page.waitForLoadState('domcontentloaded')
  6  |   await expect(
  7  |     page.getByRole('heading', { name: /contas a receber|recebíveis/i }).first(),
> 8  |   ).toBeVisible({ timeout: 15_000 })
     |     ^ Error: expect(locator).toBeVisible() failed
  9  | }
  10 | 
  11 | test.describe('Contas a Receber (Financeiro)', () => {
  12 |   test('deve listar os recebíveis do tenant corretamente', async ({ page }) => {
  13 |     await openReceivablesPage(page)
  14 | 
  15 |     // Garante que a tabela/lista carregou e não estourou erro (quebra silenciosa)
  16 |     const listArea = page
  17 |       .locator('table')
  18 |       .or(page.locator('.list-container'))
  19 |       .first()
  20 |     await expect(listArea).toBeVisible()
  21 |   })
  22 | 
  23 |   test('deve permitir baixar/compensar um recebível (marcar como pago)', async ({
  24 |     page,
  25 |   }) => {
  26 |     await openReceivablesPage(page)
  27 | 
  28 |     // Tenta encontrar um botão de "Baixar", "Pagar" ou "Compensar" no primeiro item da lista
  29 |     const payBtn = page
  30 |       .getByRole('button', { name: /baixar|pagar|receber|compensar/i })
  31 |       .first()
  32 | 
  33 |     if (await payBtn.isVisible()) {
  34 |       await payBtn.click()
  35 | 
  36 |       // Deve abrir um modal de confirmação ou formulário de baixa
  37 |       const modalTitle = page
  38 |         .getByText(/baixar parcela|confirmar recebimento|dados do pagamento/i)
  39 |         .first()
  40 |       await expect(modalTitle).toBeVisible({ timeout: 5000 })
  41 | 
  42 |       // Simulamos que o teste de UI fecha o modal sem concluir para não poluir base
  43 |       const closeBtn = page
  44 |         .getByRole('button', { name: /cancelar|fechar/i })
  45 |         .first()
  46 |       await closeBtn.click()
  47 |     } else {
  48 |       // Pula se não houver títulos em aberto para testar na tela atual
  49 |       test.skip()
  50 |     }
  51 |   })
  52 | 
  53 |   test('deve permitir abrir os detalhes do recebível para ver parcelas', async ({
  54 |     page,
  55 |   }) => {
  56 |     await openReceivablesPage(page)
  57 | 
  58 |     // Tenta clicar no primeiro item da lista
  59 |     const firstRow = page
  60 |       .locator('table tbody tr')
  61 |       .or(page.locator('.list-item'))
  62 |       .first()
  63 | 
  64 |     if (await firstRow.isVisible()) {
  65 |       await firstRow.click()
  66 | 
  67 |       // Verifica se abriu a visualização de parcelas
  68 |       const parcelasArea = page
  69 |         .getByText(/parcela 1|detalhes do título/i)
  70 |         .first()
  71 |       await expect(parcelasArea).toBeVisible({ timeout: 5000 })
  72 |     } else {
  73 |       test.skip()
  74 |     }
  75 |   })
  76 | })
  77 | 
```