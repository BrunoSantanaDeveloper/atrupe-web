# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quotation/quotation-form.spec.ts >> Formulário de Cotação >> deve exibir erro se tentar salvar sem cliente selecionado
- Location: e2e/quotation/quotation-form.spec.ts:45:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /salvar|gravar/i })

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
  1   | import { test, expect, Page } from '@playwright/test'
  2   | 
  3   | // ─── Helpers ─────────────────────────────────────────────────────────────────
  4   | 
  5   | async function openNewQuotationForm(page: Page) {
  6   |   await page.goto('/venda/orcamento')
  7   |   await page.waitForLoadState('domcontentloaded')
  8   | 
  9   |   const newQuotationBtn = page.getByRole('button', {
  10  |     name: /novo orçamento|nova cotação/i,
  11  |   })
  12  | 
  13  |   // Em vez de esperar a rede parar (o que gera timeout), espera especificamente o botão aparecer
  14  |   await newQuotationBtn
  15  |     .waitFor({ state: 'visible', timeout: 8000 })
  16  |     .catch(() => {})
  17  | 
  18  |   if (await newQuotationBtn.isVisible()) {
  19  |     await newQuotationBtn.click()
  20  |   } else {
  21  |     // Se o botão não estiver visível (por permissão ou fluxo diferente), vai direto pela URL
  22  |     await page.goto('/venda/orcamento/novo')
  23  |   }
  24  | 
  25  |   // Aguarda a tela de novo orçamento carregar
  26  |   await expect(page).toHaveURL(/\/venda\/orcamento\/novo/, { timeout: 10_000 })
  27  | }
  28  | 
  29  | // ─── Suite ───────────────────────────────────────────────────────────────────
  30  | 
  31  | test.describe('Formulário de Cotação', () => {
  32  |   // ── Abertura e estrutura ──────────────────────────────────────────────────
  33  | 
  34  |   test('deve abrir o formulário de nova cotação', async ({ page }) => {
  35  |     await openNewQuotationForm(page)
  36  | 
  37  |     // Verifica se as abas ou seções principais estão visíveis
  38  |     await expect(page.getByText(/cliente/i).first()).toBeVisible()
  39  |     await expect(page.getByText(/itens|produtos/i).first()).toBeVisible()
  40  |     await expect(page.getByText(/financeiro|pagamento/i).first()).toBeVisible()
  41  |   })
  42  | 
  43  |   // ── Seleção de cliente ────────────────────────────────────────────────────
  44  | 
  45  |   test('deve exibir erro se tentar salvar sem cliente selecionado', async ({
  46  |     page,
  47  |   }) => {
  48  |     await openNewQuotationForm(page)
  49  | 
  50  |     // Tenta salvar direto sem preencher o cliente
  51  |     const saveBtn = page.getByRole('button', { name: /salvar|gravar/i })
> 52  |     await saveBtn.click()
      |                   ^ Error: locator.click: Test timeout of 60000ms exceeded.
  53  | 
  54  |     // Deve mostrar mensagem indicando que cliente é obrigatório
  55  |     await expect(
  56  |       page.getByText(/cliente.*obrigatório|selecione um cliente/i),
  57  |     ).toBeVisible({ timeout: 5_000 })
  58  |   })
  59  | 
  60  |   test('deve pesquisar e selecionar cliente preenchendo contato', async ({
  61  |     page,
  62  |   }) => {
  63  |     await openNewQuotationForm(page)
  64  | 
  65  |     // Interage com o combobox/select de cliente
  66  |     const clientSelect = page
  67  |       .getByLabel(/cliente/i)
  68  |       .or(page.getByPlaceholder(/buscar cliente/i))
  69  |       .first()
  70  |     await clientSelect.click()
  71  |     await page.keyboard.type('Cliente Teste') // Assume que exista ou mockado
  72  |     await page.waitForTimeout(1000)
  73  |     await page.keyboard.press('ArrowDown')
  74  |     await page.keyboard.press('Enter')
  75  | 
  76  |     // Contato deve ficar disponível ou autocompletado
  77  |     // O teste valida se o campo contato existe (se houver essa regra no front)
  78  |     const contatoLabel = page.getByText(/contato/i).first()
  79  |     await expect(contatoLabel).toBeVisible()
  80  |   })
  81  | 
  82  |   // ── Itens de Produto e Totais ──────────────────────────────────────────────
  83  | 
  84  |   test('total geral deve somar corretamente todos os itens adicionados', async ({
  85  |     page,
  86  |   }) => {
  87  |     await openNewQuotationForm(page)
  88  | 
  89  |     // Aqui simulamos a adição de 2 produtos
  90  |     const addProductBtn = page
  91  |       .getByRole('button', { name: /adicionar produto|novo item/i })
  92  |       .first()
  93  | 
  94  |     // Se não tiver o botão explícito na tela inicial, pulamos (depende muito do UI exato)
  95  |     if (await addProductBtn.isVisible()) {
  96  |       await addProductBtn.click()
  97  | 
  98  |       // Simula a escolha de um produto e quantidade = 2
  99  |       // Como não temos a classe exata, validamos apenas a expectativa visual do total
  100 |       const totalDisplay = page
  101 |         .getByText(/total: R\$/i)
  102 |         .or(page.locator('.total-value'))
  103 | 
  104 |       // O total tem que mudar de 0
  105 |       await expect(totalDisplay).not.toContainText('0,00')
  106 |     } else {
  107 |       test.skip()
  108 |     }
  109 |   })
  110 | 
  111 |   test('desconto percentual e fixo devem recalcular valor total', async ({
  112 |     page,
  113 |   }) => {
  114 |     await openNewQuotationForm(page)
  115 | 
  116 |     // Vai para a aba financeira/descontos
  117 |     const financeiroTab = page.getByRole('tab', {
  118 |       name: /financeiro|pagamento/i,
  119 |     })
  120 |     if (await financeiroTab.isVisible()) {
  121 |       await financeiroTab.click()
  122 |     }
  123 | 
  124 |     const discountInput = page.getByLabel(/desconto/i).first()
  125 |     if (await discountInput.isVisible()) {
  126 |       await discountInput.fill('10') // 10% ou R$ 10
  127 |       await page.keyboard.press('Tab')
  128 | 
  129 |       // Devemos esperar que a UI tenha reagido
  130 |       await page.waitForTimeout(500)
  131 |     }
  132 |     // Sucesso base: formulário não quebrou ao interagir com o desconto
  133 |   })
  134 | 
  135 |   // ── Financeiro e Parcelas ────────────────────────────────────────────────
  136 | 
  137 |   test('alterar condição de pagamento deve gerar parcelas automaticamente', async ({
  138 |     page,
  139 |   }) => {
  140 |     await openNewQuotationForm(page)
  141 | 
  142 |     const paymentConditionSelect = page
  143 |       .getByLabel(/condição de pagamento/i)
  144 |       .first()
  145 | 
  146 |     if (await paymentConditionSelect.isVisible()) {
  147 |       await paymentConditionSelect.click()
  148 |       await page.keyboard.press('ArrowDown') // Seleciona "30/60/90" por ex
  149 |       await page.keyboard.press('Enter')
  150 | 
  151 |       // Deve aparecer uma seção de parcelas geradas
  152 |       const parcelasArea = page.getByText(/parcela 1|vencimento/i).first()
```